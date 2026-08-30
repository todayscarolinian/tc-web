import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireHeraldAccess, isAccessError } from "@/src/lib/herald/require-access";
import { mediaService, mediaStorageService } from "@/src/entities/media/services/media.service.factory";
import { toMediaAssetDTO } from "@/src/entities/media/core/media.domain";
import { ALLOWED_IMAGE_CONTENT_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/src/lib/media-constraints";
import { MEDIA_FOLDERS } from "@/src/lib/staff-data";

const ACCESS_ERROR_STATUS = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  SERVICE_ERROR: 500,
} as const;

const LIBRARY_FOLDERS = MEDIA_FOLDERS.filter(
  (folder): folder is Exclude<(typeof MEDIA_FOLDERS)[number], "All"> => folder !== "All",
);

function sanitizeSegment(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "file"
  );
}

function readOptionalInt(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.trunc(parsed) : 0;
}

function readTagSlugs(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
  } catch {
    return value.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
}

function displayName(firstName: string, lastName: string, email: string): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || email;
}

export async function POST(request: Request) {
  const cookieHeader = (await cookies()).toString();
  const access = await requireHeraldAccess(cookieHeader);
  if (isAccessError(access)) {
    return NextResponse.json(access, { status: ACCESS_ERROR_STATUS[access.error] });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folderValue = formData.get("folder");
  const folder =
    typeof folderValue === "string" &&
    LIBRARY_FOLDERS.includes(folderValue as (typeof LIBRARY_FOLDERS)[number])
      ? folderValue
      : "Photos";

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

  const storagePath = `media/${sanitizeSegment(folder)}/${crypto.randomUUID()}-${sanitizeSegment(file.name)}`;
  const data = Buffer.from(await file.arrayBuffer());
  const { publicUrl } = await mediaStorageService.upload({
    storagePath,
    contentType: file.type,
    data,
  });

  try {
    const altText = typeof formData.get("altText") === "string" ? (formData.get("altText") as string) : "";
    const asset = await mediaService.create({
      name: file.name,
      folder,
      tagSlugs: readTagSlugs(formData.get("tagSlugs")),
      storagePath,
      url: publicUrl,
      contentType: file.type,
      sizeBytes: file.size,
      width: readOptionalInt(formData.get("width")),
      height: readOptionalInt(formData.get("height")),
      altText,
      uploadedBy: access.user.id,
      uploadedByName: displayName(access.user.firstName, access.user.lastName, access.user.email),
      iconKey: folder.toLowerCase(),
    });

    return NextResponse.json({ publicUrl, asset: toMediaAssetDTO(asset) });
  } catch (error) {
    await mediaStorageService.delete({ storagePath });
    throw error;
  }
}
