import {
  getAllCategoriesAction,
  getTotalAssetsCountAction,
  getTotalUsersCountAction,
} from "@/actions/admin-actions";
import CategoryManager from "@/components/admin/category-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderKanban, Images, Users } from "lucide-react";

// Admin-only page (same pattern as asset-approval/page.tsx: the underlying
// Server Actions - getAllCategoriesAction, getTotalUsersCountAction,
// getTotalAssetsCountAction, all in src/actions/admin-actions.ts - each
// independently check `session.user.role === "admin"` and throw otherwise).
async function SettingsPage() {
  // Three unrelated read queries fetched concurrently - a common Server
  // Component pattern for dashboard-style pages with multiple independent
  // stats.
  const [categories, userCount, assetsCount] = await Promise.all([
    getAllCategoriesAction(),
    getTotalUsersCountAction(),
    getTotalAssetsCountAction(),
  ]);

  return (
    <div className="page-shell py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage categories and monitor marketplace scale.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Total Users
            </CardTitle>
            <CardDescription>
              All registered users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <Images className="mr-2 h-5 w-5 text-primary" />
              Total Assets
            </CardTitle>
            <CardDescription>
              All uploaded assets on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{assetsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-medium">
              <FolderKanban className="mr-2 h-5 w-5 text-primary" />
              Categories
            </CardTitle>
            <CardDescription>Available gallery filters</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{categories.length}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Server-fetched `categories` is handed to a "use client"
              component as a plain prop - this is the standard way data
              crosses the server/client boundary in the App Router: fetch on
              the server, pass the resulting plain data down as props into
              client components that need interactivity. */}
          <CategoryManager categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;
