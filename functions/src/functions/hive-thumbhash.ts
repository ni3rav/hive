import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

interface ThumbhashPayload {
  mediaId: string;
  publicUrl: string;
  size: number;
}

interface ThumbhashResult {
  thumbhash_base64: string;
  aspect_ratio: number;
}

async function generateThumbhash(
  imageBuffer: Buffer,
  context: InvocationContext
): Promise<ThumbhashResult | null> {
  try {
    const originalMetadata = await sharp(imageBuffer).metadata();
    const originalWidth = originalMetadata.width || 0;
    const originalHeight = originalMetadata.height || 0;
    const aspectRatio = originalWidth / originalHeight;

    const { data, info } = await sharp(imageBuffer)
      .resize(100, 100, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const rgbaData = new Uint8Array(data);

    const thumbhash = rgbaToThumbHash(width, height, rgbaData);
    const thumbhashBase64 = Buffer.from(thumbhash).toString("base64");

    return {
      thumbhash_base64: thumbhashBase64,
      aspect_ratio: aspectRatio,
    };
  } catch (error) {
    context.log(
      "Failed to generate thumbhash:",
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.stack) {
      context.log("Stack trace:", error.stack);
    }
    return null;
  }
}

async function fetchImage(
  url: string,
  context: InvocationContext
): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      context.log(
        `Image fetch failed: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      context.log(`Invalid content type: ${contentType}`);
      return null;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      const sizeMB = parseInt(contentLength, 10) / (1024 * 1024);
      context.log(`Downloading image: ${sizeMB.toFixed(2)} MB`);
    }

    const arrayBuffer = await response.arrayBuffer();
    context.log(
      `Image downloaded: ${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(
        2
      )} MB`
    );
    return Buffer.from(arrayBuffer);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      context.log("Image fetch timeout after 30 seconds");
    } else {
      context.log(
        "Image fetch error:",
        error instanceof Error ? error.message : String(error)
      );
    }
    return null;
  }
}

async function callbackBackend(
  backendUrl: string,
  mediaId: string,
  thumbhash: ThumbhashResult,
  secret: string,
  context: InvocationContext
): Promise<boolean> {
  const callbackUrl = `${backendUrl}/api/media/internal/${mediaId}/thumbhash`;
  context.log("=== Starting backend callback ===", {
    callbackUrl,
    mediaId,
    hasSecret: !!secret,
    secretLength: secret?.length || 0,
    thumbhashLength: thumbhash.thumbhash_base64.length,
    aspectRatio: thumbhash.aspect_ratio,
  });

  try {
    const requestBody = JSON.stringify(thumbhash);
    context.log("Callback request details:", {
      url: callbackUrl,
      method: "POST",
      bodyLength: requestBody.length,
      bodyPreview: requestBody.substring(0, 200),
    });

    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      context.log("Callback request timeout after 30 seconds", { callbackUrl });
    }, 30000); // 30 second timeout

    let response: Response;
    try {
      response = await fetch(callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-azure-function-secret": secret,
        },
        body: requestBody,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        context.log("=== Callback request timeout ===", {
          mediaId,
          url: callbackUrl,
          timeout: 30000,
        });
        throw new Error("Callback request timeout after 30 seconds");
      }
      throw fetchError;
    }

    context.log("Callback response received:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      redirected: response.redirected,
      type: response.type,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries()),
    });

    // Log if response was redirected
    if (response.redirected) {
      context.log("WARNING: Response was redirected", {
        originalUrl: callbackUrl,
        finalUrl: response.url,
      });
    }

    const responseText = await response.text();
    let responseBody: unknown;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }

    context.log("Callback response body:", {
      bodyLength: responseText.length,
      body: responseBody,
    });

    if (!response.ok) {
      context.log("=== Backend callback failed ===", {
        mediaId,
        status: response.status,
        statusText: response.statusText,
        responseBody,
        url: callbackUrl,
      });
      return false;
    }

    context.log("=== Backend callback succeeded ===", {
      mediaId,
      status: response.status,
      responseBody,
    });
    return true;
  } catch (error) {
    const errorDetails: Record<string, unknown> = {
      mediaId,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      url: callbackUrl,
    };

    // Add more specific error information
    if (error instanceof Error) {
      if (error.stack) {
        errorDetails.errorStack = error.stack;
      }
      if ("code" in error) {
        errorDetails.errorCode = (error as { code?: string }).code;
      }
      if ("cause" in error) {
        errorDetails.errorCause = (error as { cause?: unknown }).cause;
      }
    }

    // Check for specific error types
    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorDetails.errorCategory = "Network/Fetch Error";
      errorDetails.possibleCauses = [
        "DNS resolution failed",
        "Connection refused",
        "SSL/TLS certificate issue",
        "Network timeout",
        "CORS blocked",
      ];
    }

    context.log("=== Backend callback error ===", errorDetails);
    return false;
  }
}

export async function hiveThumbhash(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("=== Function called ===", {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    hasBody: !!request.body,
  });
  try {
    const secret = request.headers.get("x-azure-function-secret");
    const expectedSecret = process.env.AZURE_FUNCTION_SECRET;

    context.log("Secret check:", {
      hasSecret: !!secret,
      hasExpectedSecret: !!expectedSecret,
      secretMatch: secret === expectedSecret,
      receivedSecretLength: secret?.length || 0,
      expectedSecretLength: expectedSecret?.length || 0,
      receivedSecretPreview: secret ? `${secret.substring(0, 10)}...` : "none",
      expectedSecretPreview: expectedSecret
        ? `${expectedSecret.substring(0, 10)}...`
        : "none",
    });

    if (!secret || secret !== expectedSecret) {
      context.log("Invalid or missing secret header");
      return {
        status: 401,
        jsonBody: { error: "Unauthorized" },
      };
    }

    context.log("Secret validated successfully");

    const bodyText = await request.text();
    context.log("Request body received, length:", bodyText.length);

    let payload: ThumbhashPayload;
    try {
      payload = JSON.parse(bodyText);
      context.log("Payload parsed:", {
        mediaId: payload.mediaId,
        size: payload.size,
      });
    } catch (error) {
      context.log("Invalid JSON payload", error);
      return {
        status: 400,
        jsonBody: { error: "Invalid request body" },
      };
    }

    const { mediaId, publicUrl, size } = payload;

    if (!mediaId || !publicUrl || typeof size !== "number") {
      context.log("Missing required fields in payload");
      return {
        status: 400,
        jsonBody: {
          error: "Missing required fields: mediaId, publicUrl, size",
        },
      };
    }

    if (size < 100 * 1024) {
      context.log(`Skipping: file too small (${size} bytes)`);
      return {
        status: 200,
        jsonBody: { message: "Skipped: file too small" },
      };
    }

    context.log(`Fetching image from: ${publicUrl}`);
    const imageBuffer = await fetchImage(publicUrl, context);

    if (!imageBuffer) {
      context.log(`Failed to fetch or invalid image: ${publicUrl}`);
      return {
        status: 200,
        jsonBody: { message: "Failed to fetch image or invalid content type" },
      };
    }

    context.log(
      `Image fetched successfully, size: ${imageBuffer.length} bytes`
    );
    context.log("Generating thumbhash...");
    const thumbhashResult = await generateThumbhash(imageBuffer, context);

    if (!thumbhashResult) {
      context.log(`Failed to generate thumbhash for mediaId: ${mediaId}`);
      return {
        status: 200,
        jsonBody: { message: "Failed to generate thumbhash" },
      };
    }

    context.log("Thumbhash generated successfully:", {
      thumbhashLength: thumbhashResult.thumbhash_base64.length,
      aspectRatio: thumbhashResult.aspect_ratio,
    });

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      context.log("BACKEND_URL environment variable not set");
      return {
        status: 500,
        jsonBody: { error: "Backend URL not configured" },
      };
    }

    // Validate and normalize backend URL
    let normalizedBackendUrl = backendUrl.trim();
    if (
      !normalizedBackendUrl.startsWith("http://") &&
      !normalizedBackendUrl.startsWith("https://")
    ) {
      context.log("BACKEND_URL missing protocol, defaulting to https", {
        originalUrl: normalizedBackendUrl,
      });
      normalizedBackendUrl = `https://${normalizedBackendUrl}`;
    }

    // Remove trailing slash
    normalizedBackendUrl = normalizedBackendUrl.replace(/\/$/, "");

    context.log("Backend URL configuration:", {
      original: backendUrl,
      normalized: normalizedBackendUrl,
    });

    context.log("=== Preparing backend callback ===", {
      backendUrl: normalizedBackendUrl,
      mediaId,
      callbackEndpoint: `${normalizedBackendUrl}/api/media/internal/${mediaId}/thumbhash`,
      hasSecret: !!expectedSecret,
      secretLength: expectedSecret?.length || 0,
      thumbhashData: {
        thumbhashLength: thumbhashResult.thumbhash_base64.length,
        aspectRatio: thumbhashResult.aspect_ratio,
      },
    });

    const success = await callbackBackend(
      normalizedBackendUrl,
      mediaId,
      thumbhashResult,
      expectedSecret!,
      context
    );

    if (!success) {
      context.log(
        "=== Backend callback failed - returning error response ===",
        {
          mediaId,
          thumbhashGenerated: true,
          callbackFailed: true,
        }
      );
      return {
        status: 200,
        jsonBody: { message: "Thumbhash generated but callback failed" },
      };
    }

    context.log(`=== Successfully completed for mediaId: ${mediaId} ===`);
    return {
      status: 200,
      jsonBody: {
        message: "Thumbhash generated and saved successfully",
        mediaId,
      },
    };
  } catch (error) {
    context.log("=== Unexpected error in thumbhash function ===", error);
    context.log(
      "Error details:",
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.stack) {
      context.log("Stack trace:", error.stack);
    }
    return {
      status: 500,
      jsonBody: { error: "Internal server error" },
    };
  }
}

app.http("hive-thumbhash", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: hiveThumbhash,
});
