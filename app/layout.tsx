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
  title: "HanFlower | ช่อดอกไม้สด & ไม้อวบน้ำ พร้อมการ์ดดิจิทัลแทนใจ",
  description: "ร้านดอกไม้พรีเมียม ฮันฟลาวเวอร์ HanFlower จำหน่ายช่อดอกไม้สด และไม้อวบน้ำคัดเกรด พิเศษด้วยการ์ด QR Code บอกความในใจถึงผู้รับได้ทันทีผ่านหน้าเว็บส่วนตัว",
  keywords: "สั่งดอกไม้, ช่อดอกไม้, ไม้อวบน้ำ, ของขวัญวาเลนไทน์, การ์ดบอกรัก, ส่งดอกไม้, HanFlower, ฮันฟลาวเวอร์",
  robots: "index, follow",
  other: {
    "google": "notranslate",
  },
  openGraph: {
    title: "HanFlower | มอบช่อดอกไม้และไม้อวบน้ำ พร้อมการ์ดดิจิทัลบอกความในใจ",
    description: "พิเศษกว่าใครด้วยการ์ด QR Code บอกความในใจที่มาพร้อมกับช่อดอกไม้และไม้อวบน้ำที่คุณเลือก",
    type: "website",
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    title: "HanFlower | มอบช่อดอกไม้และไม้อวบน้ำ พร้อมการ์ดดิจิทัลบอกความในใจ",
    description: "พิเศษกว่าใครด้วยการ์ด QR Code บอกความในใจที่มาพร้อมกับช่อดอกไม้และไม้อวบน้ำที่คุณเลือก",
    images: ["/images/logo5.png"],
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FlowerShop',
    'name': 'HanFlower Thailand',
    'image': 'https://hanflowerthailand.com/images/logo5.png',
    '@id': 'https://hanflowerthailand.com',
    'url': 'https://hanflowerthailand.com',
    'telephone': '093-726-5055',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '...', // ยังไม่มีข้อมูลที่อยู่แน่ชัด
      'addressLocality': 'Bangkok',
      'addressRegion': 'Bangkok',
      'postalCode': '10xxx',
      'addressCountry': 'TH'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 13.7563,
      'longitude': 100.5018
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ],
      'opens': '09:00',
      'closes': '21:00'
    },
    'sameAs': [
      'https://line.me/ti/p/~fonms2',
      'https://instagram.com/han.flower22',
      'https://tiktok.com/@hanflower.fon'
    ]
  };

  return (
    <html lang="th" translate="no">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
