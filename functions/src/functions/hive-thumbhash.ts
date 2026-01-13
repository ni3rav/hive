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
  imageBuffer: Buffer
): Promise<ThumbhashResult | null> {
  try {
    // Decode image to RGBA using sharp
    const { data, info } = await sharp(imageBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const rgbaData = new Uint8Array(data);

    // Generate thumbhash from RGBA data
    const thumbhash = rgbaToThumbHash(width, height, rgbaData);

    // Convert thumbhash to base64
    const thumbhashBase64 = Buffer.from(thumbhash).toString("base64");

    // Calculate aspect ratio
    const aspectRatio = width / height;

    return {
      thumbhash_base64: thumbhashBase64,
      aspect_ratio: aspectRatio,
    };
  } catch (error) {
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
  secret: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${backendUrl}/media/internal/${mediaId}/thumbhash`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-azure-function-secret": secret,
        },
        body: JSON.stringify(thumbhash),
      }
    );
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function hiveThumbhash(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // 1. Verify secret header
    const secret = request.headers.get("x-azure-function-secret");
    const expectedSecret = process.env.AZURE_FUNCTION_SECRET;

    if (!secret || secret !== expectedSecret) {
      context.log("Invalid or missing secret header");
      return {
        status: 401,
        jsonBody: { error: "Unauthorized" },
      };
    }

    // 2. Parse request body
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

    // 3. Skip small files (<100KB)
    if (size < 100 * 1024) {
      context.log(
        `Skipping thumbhash generation for small file: ${mediaId} (${size} bytes)`
      );
      return {
        status: 200,
        jsonBody: { message: "Skipped: file too small" },
      };
    }

    // 4. Fetch image from R2
    context.log(`Fetching image from ${publicUrl} for mediaId: ${mediaId}`);
    const imageBuffer = await fetchImage(publicUrl);

    if (!imageBuffer) {
      context.log(`Failed to fetch or invalid image: ${publicUrl}`);
      return {
        status: 200,
        jsonBody: { message: "Failed to fetch image or invalid content type" },
      };
    }

    // 5. Generate thumbhash + aspect ratio
    context.log(`Generating thumbhash for mediaId: ${mediaId}`);
    const thumbhashResult = await generateThumbhash(imageBuffer);

    if (!thumbhashResult) {
      context.log(`Failed to generate thumbhash for mediaId: ${mediaId}`);
      return {
        status: 200,
        jsonBody: { message: "Failed to generate thumbhash" },
      };
    }

    // 6. Callback to backend
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
      expectedSecret!
    );

    if (!success) {
      context.log(`Failed to callback backend for mediaId: ${mediaId}`);
      return {
        status: 200,
        jsonBody: { message: "Thumbhash generated but callback failed" },
      };
    }

    context.log(`Successfully processed thumbhash for mediaId: ${mediaId}`);
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
