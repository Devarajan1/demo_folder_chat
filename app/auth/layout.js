import AuthLayout from "./authlayout";
export default async function AuthRootLayout({
  children,
}) {
  return await AuthLayout({ children });
}
