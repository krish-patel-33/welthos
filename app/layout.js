import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({subsets: ['latin']});

export const metadata = {
  title: "Welthos",
  description: "one stop solution for all your financial needs",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${inter.className}`}>
        <Header/>
        <main className="min-h-hscreen">{children}</main>
        {/*footer*/}
        <footer className = "bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-grey-600">
            <p>made with love by krish</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
