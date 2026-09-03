import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireHeraldAccess, isAccessError } from "@/src/lib/herald/require-access";
import { mediaService } from "@/src/entities/media/services/media.service.factory";
import { toMediaAssetDTO } from "@/src/entities/media/core/media.domain";

const ACCESS_ERROR_STATUS = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  SERVICE_ERROR: 500,
} as const;

export async function GET() {
  const cookieHeader = (await cookies()).toString();
  const access = await requireHeraldAccess(cookieHeader);
  if (isAccessError(access)) {
    return NextResponse.json(access, { status: ACCESS_ERROR_STATUS[access.error] });
  }

  const assets = await mediaService.listAll();
  return NextResponse.json({ assets: assets.map(toMediaAssetDTO) });
}
