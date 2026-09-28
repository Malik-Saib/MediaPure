import { AdminApp } from "@/components/AdminApp";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Admin | MediaPure", description: "Admin dashboard", path: "/admin", noindex: true });

export default function AdminPage() {
  return <AdminApp />;
}
