import type { Metadata } from "next";
import { Geist,Outfit } from "next/font/google";
import "./globals.css";
import { MongoRepository } from "./utils/mongoRepository";
import { AdminAuthProvider } from "./context/adminAuth";


const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700",'800', '900'],
});


export const metadata: Metadata = {
  title: "Mongo quiz app",
  description: "No hay descripción, nomás ten fe y ábrela",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="w-full h-full bg-background flex flex-col justify-stretch max-w-screen">
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  );
}
