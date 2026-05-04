import "./globals.css";


export const metadata = {
  title: "ShopMind - AI Powered E-Commerce Store",
  description: "Smart AI-based e-commerce platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
