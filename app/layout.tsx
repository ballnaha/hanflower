import type { Metadata, Viewport } from "next";
import { Prompt, Mali, Dancing_Script, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import theme from './theme';

const prompt = Prompt({
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

const mali = Mali({
  variable: "--font-mali",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://hanflowerthailand.com'),
  title: "HanFlower | มอบช่อดอกไม้และไม้อวบน้ำ พร้อมการ์ดดิจิทัลบอกความในใจ",
  description: "ร้านดอกไม้พรีเมียม ฮันฟลาวเวอร์ HanFlower จำหน่ายช่อดอกไม้สด และไม้อวบน้ำคัดเกรด พิเศษด้วยการ์ด QR Code บอกความในใจถึงผู้รับได้ทันทีผ่านหน้าเว็บส่วนตัว",
  keywords: "สั่งดอกไม้, ช่อดอกไม้, ไม้อวบน้ำ, ของขวัญวาเลาไทน์, การ์ดบอกรัก, ส่งดอกไม้, HanFlower , ฮันฟลาวเวอร์ ",
  robots: "index, follow",
  other: {
    "google": "notranslate",
  },
  openGraph: {
    title: "HanFlower | มอบช่อดอกไม้และไม้อวบน้ำ พร้อมการ์ดดิจิทัลบอกความในใจ",
    description: "พิเศษกว่าใครด้วยการ์ด QR Code บอกความในใจที่มาพร้อมกับช่อดอกไม้และไม้อวบน้ำที่คุณเลือก",
    type: "website",
    locale: "th_TH",
  }
};

import MainLayout from "@/components/layout/MainLayout";
import GoogleAnalytics from "@/components/layout/GoogleAnalytics";
import ValentinePopup from "@/components/layout/ValentinePopup";
import { Suspense } from "react";

import CartProviderWrapper from "@/components/providers/CartProviderWrapper";
import { NotificationProvider } from "@/context/NotificationContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <html lang="th" translate="no">
      <body
        className={`${prompt.variable} ${mali.variable} ${dancingScript.variable} ${playfair.variable} font-sans antialiased bg-[#FFFFFF] text-[#000000]`}
      >
        <AppRouterCacheProvider options={{ key: 'css', enableCssLayer: true }}>
          <Suspense fallback={null}>
            <GoogleAnalytics GA_MEASUREMENT_ID={gaId} />
          </Suspense>
          <ThemeProvider theme={theme}>
            <NotificationProvider>
              <ValentinePopup />
              <CartProviderWrapper>
                <MainLayout>
                  {children}
                </MainLayout>
              </CartProviderWrapper>
            </NotificationProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
