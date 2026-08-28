import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireHeraldAccess, isAccessError } from "@/src/lib/herald/require-access";
import { mediaStorageService } from "@/src/entities/media/services/media.service.factory";
import { ALLOWED_IMAGE_CONTENT_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/src/lib/media-constraints";

const ACCESS_ERROR_STATUS = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  SERVICE_ERROR: 500,
} as const;

function sanitizeSegment(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "file"
  );
}

export async function POST(request: Request) {
  const cookieHeader = (await cookies()).toString();
  const access = await requireHeraldAccess(cookieHeader);
  if (isAccessError(access)) {
    return NextResponse.json(access, { status: ACCESS_ERROR_STATUS[access.error] });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "INVALID_FILE", message: "No file was provided." },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_CONTENT_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "INVALID_FILE", message: `Unsupported file type: ${file.type}` },
      { status: 400 },
    );
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "INVALID_FILE", message: "File exceeds the 2MB upload limit." },
      { status: 400 },
    );
  }

  const storagePath = `media/${sanitizeSegment(typeof folder === "string" ? folder : "uploads")}/${crypto.randomUUID()}-${sanitizeSegment(file.name)}`;

  const data = Buffer.from(await file.arrayBuffer());
  const { publicUrl } = await mediaStorageService.upload({
    storagePath,
    contentType: file.type,
    data,
  });

  return NextResponse.json({ publicUrl });
}
