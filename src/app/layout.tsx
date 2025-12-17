import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Nunito } from "next/font/google";
import "./globals.css";
import { GardenProvider } from "@/context/GardenContext";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Garden Companion",
  description: "Your personal plant care assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        <GardenProvider>
          {children}
        </GardenProvider>
      </body>
    </html>
  );
}
