import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 md:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
