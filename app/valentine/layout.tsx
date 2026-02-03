import { Metadata } from "next";
import { Dancing_Script, Charm, Mali, Sriracha, Comfortaa } from "next/font/google"; // Added Comfortaa as it was used in page.tsx

// 🔤 Preload Valentine-specific fonts using next/font/google
// display: 'block' ensures text is hidden until font is loaded (prevents FOUT)
const dancingScript = Dancing_Script({
    subsets: ["latin"],
    weight: ["700"],
    variable: "--font-dancing",
    display: "block", // Block text until font is loaded
    preload: true,
});

const charm = Charm({
    subsets: ["latin", "thai"],
    weight: ["400", "700"],
    variable: "--font-charm",
    display: "block",
    preload: true,
});

const mali = Mali({
    subsets: ["latin", "thai"],
    weight: ["400", "700"],
    variable: "--font-mali",
    display: "block",
    preload: true,
});

const sriracha = Sriracha({
    subsets: ["latin", "thai"],
    weight: ["400"],
    variable: "--font-sriracha",
    display: "block",
    preload: true,
});

// Added Comfortaa as seen in the page.tsx styles
const comfortaa = Comfortaa({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-comfortaa",
    display: "block",
    preload: true,
});

export const metadata: Metadata = {
    title: "Happy Valentine's Day 💕 | ส่งความรักให้คนพิเศษ",
    description: "ส่งความรักและความสุขในวันวาเลนไทน์ ด้วยการ์ดอวยพรสุดพิเศษ ที่เต็มไปด้วยความทรงจำดีๆ",
    keywords: ["valentine", "valentines day", "love", "วาเลนไทน์", "ความรัก", "การ์ดอวยพร"],
    openGraph: {
        title: "Happy Valentine's Day 💕",
        description: "ส่งความรักและความสุขในวันวาเลนไทน์ ด้วยการ์ดอวยพรสุดพิเศษ",
        type: "website",
        locale: "th_TH",
        images: [
            {
                url: "/og-valentine.jpg", // ใส่ URL รูป OG Image ที่นี่
                width: 1200,
                height: 630,
                alt: "Happy Valentine's Day",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Happy Valentine's Day 💕",
        description: "ส่งความรักและความสุขในวันวาเลนไทน์",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function ValentineLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${dancingScript.variable} ${charm.variable} ${mali.variable} ${sriracha.variable} ${comfortaa.variable}`}>
            {children}
        </div>
    );
}
