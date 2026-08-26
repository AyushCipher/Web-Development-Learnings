// ROUTE HANDLER - STEP 1 of the UPLOAD flow.
// Full story: src/components/dashboard/upload-asset.tsx ("use client") calls
// this endpoint first, then uploads the raw file bytes directly from the
// BROWSER to Cloudinary's API (never through our server), and finally calls
// the Server Action `uploadAssetAction` in src/actions/dashboard-actions.ts
// to persist the resulting URL as metadata (isApproved: "pending").
//
// WHY THIS ROUTE EXISTS: `CLOUDINARY_API_SECRET` must never reach the
// browser bundle (unlike a `NEXT_PUBLIC_*` var, it is server-only). To let
// the client upload directly to Cloudinary (skipping our server as a
// pass-through for potentially large files) without exposing that secret,
// this route handler signs the upload request on the server and hands the
// client only a short-lived `signature` it can safely use once. Cloudinary
// verifies that signature server-side before accepting the upload.
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function POST(request: Request) {
  try {
    // `timestamp` is supplied by the client, but it (and the fixed `folder`)
    // get baked into the signature below - the client can't change the
    // folder without invalidating the signature Cloudinary will check.
    const { timestamp } = await request.json();
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "next-full-course-asset-manager",
      },
      process.env.CLOUDINARY_API_SECRET as string
    );

    // NextResponse.json() is the standard way to return a JSON body (with
    // the right Content-Type header) from a Route Handler.
    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });

  } catch (e) {
    console.error("Error while generating cloudinary signature");
    return NextResponse.json(
      {
        error: "Failed To generate signature",
      },
      { status: 500 }
    );
  }
}
