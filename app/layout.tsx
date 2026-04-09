import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ResponsiveNav from "./components/Navbar/ResponsiveNav";
import { AuthProvider } from "@/contexts/AuthContext";
import ToastProvider from "./components/Providers/ToastProvider";

const font = Inter({
  weight: ["100","200","300","400","500","600","700","800","900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Room Reservation",
  description: "Room booking app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body className={`${font.className} antialiased bg-white h-full`}>
        <AuthProvider>
          <ResponsiveNav />
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}