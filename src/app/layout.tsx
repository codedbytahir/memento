import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memento | Preserve Your Story",
  description: "An AI-powered biographer that captures your memories through voice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
