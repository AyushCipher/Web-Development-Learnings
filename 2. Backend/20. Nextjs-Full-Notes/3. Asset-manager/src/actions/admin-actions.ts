"use server";
// Server Actions used exclusively by the admin area
// (src/app/admin/asset-approval/page.tsx, src/app/admin/settings/page.tsx,
// src/components/admin/category-manager.tsx).
//
// IMPORTANT Next.js gotcha: there is no middleware.ts protecting /admin/*.
// A Server Action compiles down to its own callable HTTP endpoint, so it is
// reachable independently of whatever page happened to render the button
// that calls it - the admin-only page itself does NOT implicitly protect
// these actions. That's why every single function below re-checks
// `session.user.role !== "admin"` itself, even though the pages that call
// them are already admin-only routes. Skipping this check in even one
// action here would make it directly callable by any logged-in user.
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asset, category, user } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const CategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be max 50 characters"),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;

export async function addNewCategoryAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be an admin to add categories");
  }

  try {
    const name = formData.get("name") as string;

    const validateFields = CategorySchema.parse({ name });

    const existingCategory = await db
      .select()
      .from(category)
      .where(eq(category.name, validateFields.name))
      .limit(1);

    if (existingCategory.length > 0) {
      return {
        success: false,
        message: "category already exists! Please try with a different name",
      };
    }

    await db.insert(category).values({
      name: validateFields.name,
    });

    revalidatePath("/admin/settings");
    return {
      success: true,
      message: "New category added",
    };
  } catch (e) {
    console.log(e);

    return {
      success: false,
      message: "Failed to add category",
    };
  }
}


export async function getAllCategoriesAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("You must be an admin to access this data");
    }

    return await db.select().from(category).orderBy(category.name);
  } catch (e) {
    console.log(e);

    return [];
  }
}


export async function getTotalUsersCountAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be an admin to access this data");
  }

  try {
    const result = await db.select({ count: sql<number>`count(*)` }).from(user);

    return result[0]?.count || 0;
  } catch (e) {
    console.log(e);

    return 0;
  }
}


export async function deleteCategoryAction(categoryId: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be an admin to delete category");
  }

  try {
    await db.delete(category).where(eq(category.id, categoryId));

    revalidatePath("/admin/settings");
    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Failed to delete category",
    };
  }
}


export async function getTotalAssetsCountAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be an admin to access this data");
  }

  try {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(asset);

    return result[0]?.count || 0;
  } catch (e) {
    console.log(e);

    return 0;
  }
}


// Called from tiny inline server actions defined directly inside the
// map loop in src/app/admin/asset-approval/page.tsx, e.g.
// `<form action={async () => { "use server"; await approveAssetAction(asset.id); }}>`
// - one closure per row, each capturing that row's asset id.
export async function approveAssetAction(assetId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be an admin to approve this data");
  }

  try {
    await db
      .update(asset)
      .set({ isApproved: "approved", updatedAt: new Date() })
      .where(eq(asset.id, assetId));
    revalidatePath("/admin/asset-approval");
    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
    };
  }
}


export async function rejectAssetAction(assetId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be an admin to reject this data");
  }

  try {
    await db
      .update(asset)
      .set({ isApproved: "rejected", updatedAt: new Date() })
      .where(eq(asset.id, assetId));
    revalidatePath("/admin/asset-approval");

    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
    };
  }
}


export async function getPendingAssetsAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("You must be an admin to access this data");
  }

  try {
    const pendingAssets = await db
      .select({
        asset: asset,
        userName: user.name,
      })
      .from(asset)
      .leftJoin(user, eq(asset.userId, user.id))
      .where(eq(asset.isApproved, "pending"));

    return pendingAssets;
  } catch (e) {
    return [];
  }
}
