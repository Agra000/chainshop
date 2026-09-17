import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { SiteFooter } from "@/components/layout/SiteFooter";

const display = Sora({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: "ChainShop — Shop freely, pay safely",
  description:
    "ChainShop is a marketplace where every payment sits in escrow until you confirm your order arrived.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <TopNavbar />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
