import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArchiveX — Cinema Vault",
  description: "A cinematic showcase of Archive.org uploads",
  openGraph: { title: "ArchiveX", description: "Cinema Vault", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="film-grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
