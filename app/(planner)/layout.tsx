import { AuthProvider } from "@/components/providers/auth-provider";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
