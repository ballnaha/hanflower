import type { Metadata, Viewport } from "next";
import { Prompt } from "next/font/google";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "HanFlower | มอบช่อดอกไม้และไม้อวบน้ำ พร้อมการ์ดดิจิทัลบอกความในใจ",
  description: "ร้านดอกไม้พรีเมียม ฮันฟลาวเวอร์ HanFlower จำหน่ายช่อดอกไม้สด และไม้อวบน้ำคัดเกรด พิเศษด้วยการ์ด QR Code บอกความในใจถึงผู้รับได้ทันทีผ่านหน้าเว็บส่วนตัว",
  keywords: "สั่งดอกไม้, ช่อดอกไม้, ไม้อวบน้ำ, ของขวัญวาเลาไทน์, การ์ดบอกรัก, ส่งดอกไม้, HanFlower , ฮันฟลาวเวอร์ ",
  robots: "index, follow",
  openGraph: {
    title: "HanFlower | มอบช่อดอกไม้และไม้อวบน้ำ พร้อมการ์ดดิจิทัลบอกความในใจ",
    description: "พิเศษกว่าใครด้วยการ์ด QR Code บอกความในใจที่มาพร้อมกับช่อดอกไม้และไม้อวบน้ำที่คุณเลือก",
    type: "website",
    locale: "th_TH",
  }
};

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

import CartProviderWrapper from "@/components/providers/CartProviderWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${prompt.variable} font-sans antialiased bg-[#FFFFFF] text-[#000000]`}
      >
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CartProviderWrapper>
              <Header />
              <Box component="main" sx={{ pb: { xs: '100px', md: 0 } }}>
                {children}
              </Box>
              <Footer />
              <MobileNav />
            </CartProviderWrapper>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
