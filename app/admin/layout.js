
import AdminAuth from "./adminAuth";
export default async function AdminRootLayout({
  children,
}) {
  return await AdminAuth({ children });
}
