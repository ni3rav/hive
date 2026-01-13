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
        fit: 'inside',
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
    context.log("Failed to generate thumbhash:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      context.log("Stack trace:", error.stack);
    }
    return null;
  }
}

async function fetchImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
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
  try {
    const response = await fetch(
      `${backendUrl}/api/media/internal/${mediaId}/thumbhash`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-azure-function-secret": secret,
        },
        body: JSON.stringify(thumbhash),
      }
    );
    if (!response.ok) {
      context.log(`Backend callback failed for mediaId ${mediaId}: ${response.status} ${response.statusText}`);
    }
    return response.ok;
  } catch (error) {
    context.log(`Backend callback error for mediaId ${mediaId}:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function hiveThumbhash(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const secret = request.headers.get("x-azure-function-secret");
    const expectedSecret = process.env.AZURE_FUNCTION_SECRET;

    if (!secret || secret !== expectedSecret) {
      context.log("Invalid or missing secret header");
      return {
        status: 401,
        jsonBody: { error: "Unauthorized" },
      };
    }

    const bodyText = await request.text();
    let payload: ThumbhashPayload;
    try {
      payload = JSON.parse(bodyText);
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
      return {
        status: 200,
        jsonBody: { message: "Skipped: file too small" },
      };
    }

    const imageBuffer = await fetchImage(publicUrl);

    if (!imageBuffer) {
      context.log(`Failed to fetch or invalid image: ${publicUrl}`);
      return {
        status: 200,
        jsonBody: { message: "Failed to fetch image or invalid content type" },
      };
    }

    const thumbhashResult = await generateThumbhash(imageBuffer, context);

    if (!thumbhashResult) {
      context.log(`Failed to generate thumbhash for mediaId: ${mediaId}`);
      return {
        status: 200,
        jsonBody: { message: "Failed to generate thumbhash" },
      };
    }

    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      context.log("BACKEND_URL environment variable not set");
      return {
        status: 500,
        jsonBody: { error: "Backend URL not configured" },
      };
    }

    const success = await callbackBackend(
      backendUrl,
      mediaId,
      thumbhashResult,
      expectedSecret!,
      context
    );

    if (!success) {
      context.log(`Failed to callback backend for mediaId: ${mediaId}`);
      return {
        status: 200,
        jsonBody: { message: "Thumbhash generated but callback failed" },
      };
    }

    return {
      status: 200,
      jsonBody: {
        message: "Thumbhash generated and saved successfully",
        mediaId,
      },
    };
  } catch (error) {
    context.log("Unexpected error in thumbhash function", error);
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
