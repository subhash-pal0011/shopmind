import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Inter } from "next/font/google";
import Provider from "@/Provider";
import StoreProviders from "@/redux/StoreProviders";
import AppInit from "@/AppInit";

const inter = Inter({ subsets: ["latin"] });



export const metadata = {
  title: "ShopMind - AI Powered E-Commerce Store",
  description: "Smart AI-based e-commerce platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>

      <body className="min-h-full flex flex-col">
        <Provider>

          <StoreProviders>

            <AppInit>

              {children}

            </AppInit>

          </StoreProviders>
          <Toaster />
        </Provider>
      </body>

    </html>
  );
}
