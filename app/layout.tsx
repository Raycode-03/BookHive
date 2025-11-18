import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
export const metadata = {
  title: "BookHive",
  description:
    "Our library management service ...",
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
