import "./globals.css";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import { Oxanium, Abhaya_Libre, Anonymous_Pro } from "next/font/google";

const fontSans = Oxanium({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Abhaya_Libre({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-serif",
});

const fontMono = Anonymous_Pro({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "God Complex",
  description: "Integrity-first accountability system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}