// Homepage is handled by app/page.tsx to avoid route group conflict.
// This file exists only to satisfy Next.js route group structure.
import { redirect } from "next/navigation";
export default function StorefrontIndexPage() {
  redirect("/");
}
