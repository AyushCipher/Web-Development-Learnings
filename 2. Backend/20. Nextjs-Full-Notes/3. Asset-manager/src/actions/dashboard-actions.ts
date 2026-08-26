"use server";
// The module-level "use server" directive marks EVERY exported function in
// this file as a Server Action: a function that only ever runs on the
// server, but that Client Components can call as if it were a normal async
// function (Next.js generates a hidden network endpoint + client stub for
// each one). Some of these are invoked as a <form action={...}> (see
// uploadAssetAction, called from src/components/dashboard/upload-asset.tsx),
// others (getCategoriesAction, getUserAssetsAction, ...) are just called
// directly from Server Components during render (src/app/dashboard/assets/page.tsx)
// - being in a "use server" file is what makes them Server Actions either way.
//
// UPLOAD FLOW (steps 1-2 are elsewhere): the browser already uploaded the
// file bytes straight to Cloudinary via a signed request (see
// src/app/api/cloudinary/signature/route.ts and
// src/components/dashboard/upload-asset.tsx). `uploadAssetAction` below is
// step 3: it only ever receives Cloudinary's resulting URL + form metadata,
// never the file bytes themselves.
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, category, user } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";


const AssetSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  categoryId: z.number().positive("Please select a category"),
  price: z
    .number()
    .min(1, "Price must be at least $1")
    .max(10000, "Price cannot be more than $10,000"),
  fileUrl: z.string().url("Invalid file url"),
  thumbnailUrl: z.string().url("Invalid file url").optional(),
});


export async function getCategoriesAction() {
  try {
    return db.select().from(category);
  } catch (e) {
    console.log(e);
    return [];
  }
}


// Called with a <form action={handleAssetUpload}> style submission (a plain
// FormData payload, not JSON) from the client's XHR-based upload flow -
// FormData is what Server Actions receive natively from a <form>, and the
// client component here builds one manually after the Cloudinary upload
// finishes so it can hand off fileUrl/thumbnailUrl alongside the rest of
// the form fields.
export async function uploadAssetAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("You must be logged in to upload asset");
  }

  try {
    // Zod validates + coerces the raw FormData string values (note the
    // manual Number(...) conversions - FormData.get() always returns
    // string | File | null, never a number) before anything touches the DB.
    const validateFields = AssetSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      categoryId: Number(formData.get("categoryId")),
      price: Number(formData.get("price")),
      fileUrl: formData.get("fileUrl"),
      thumbnailUrl: formData.get("thumbnailUrl") || formData.get("fileUrl"),
    });

    await db.insert(asset).values({
      title: validateFields.title,
      description: validateFields.description,
      price: Math.round(validateFields.price * 100),
      fileUrl: validateFields.fileUrl,
      thumbnailUrl: validateFields.thumbnailUrl,
      // Every newly uploaded asset starts "pending" - it only shows up in
      // the public gallery once an admin approves it via
      // src/app/admin/asset-approval/page.tsx -> approveAssetAction in
      // src/actions/admin-actions.ts.
      isApproved: "pending",
      userId: session.user.id,
      categoryId: validateFields.categoryId,
    });

    // The /dashboard/assets page is a Server Component that fetched this
    // user's assets at request time; without revalidatePath, Next.js's
    // cache for that route wouldn't know the underlying data changed and
    // could keep serving a stale list. This tells Next to invalidate/refetch
    // that path's cached render on next visit.
    revalidatePath("/dashboard/assets");
    return {
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: "Failed to upload asset!",
    };
  }
}


export async function getUserAssetsAction(userId: string) {
  try {
    return await db
      .select()
      .from(asset)
      .where(eq(asset.userId, userId))
      .orderBy(asset.createdAt);
  } catch (e) {
    return [];
  }
}


export async function getPublicAssetsAction(categoryId?: number) {
  try {
    // add multiple base conditions
    let conditions = and(eq(asset.isApproved, "approved"));

    if (categoryId) {
      conditions = and(conditions, eq(asset.categoryId, categoryId));
    }

    const query = await db
      .select({
        asset: asset,
        categoryName: category.name,
        userName: user.name,
      })
      .from(asset)
      .leftJoin(category, eq(asset.categoryId, category.id))
      .leftJoin(user, eq(asset.userId, user.id))
      .where(conditions);

    return query;
  } catch (e) {
    console.error(e);
    return [];
  }
}

// Shared by src/app/gallery/[id]/page.tsx (public asset detail page) and
// src/app/api/download/[id]/route.ts (to resolve the real fileUrl after the
// purchase/entitlement check passes) - no ownership/approval filtering here,
// callers are responsible for deciding whether the viewer is allowed to see it.
export async function getAssetByIdAction(assetId: string) {
  try {
    const [result] = await db
      .select({
        asset: asset,
        categoryName: category.name,
        userName: user.name,
        userImage: user.image,
        userId: user.id,
      })
      .from(asset)
      .leftJoin(category, eq(asset.categoryId, category.id))
      .leftJoin(user, eq(asset.userId, user.id))
      .where(eq(asset.id, assetId));

    return result;
  } catch (e) {
    return null;
  }
}
