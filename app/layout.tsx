import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
export const metadata = {
  title: "BookHive",
  description:
    "BookHive is a scalable, user-friendly library management solution that automates reservations, borrowing workflows, inventory tracking, and user supervision in a centralized platform.",
};


export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Toaster position="top-right" richColors />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
