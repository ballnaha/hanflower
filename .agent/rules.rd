# HanFlower Project Rules & Context

## Project Identity
- **Name:** HanFlower (ฮันฟลาวเวอร์)
- **Niche:** Premium Flower Bouquets & Succulents (ไม้อวบน้ำ)
- **USP:** Personalized Digital Cards via QR Code. Every bouquet comes with a physical card containing a QR code that, when scanned, reveals a beautifully designed webpage with a personal message from the sender.

## SEO Strategy (Priority: High)
- **Semantic HTML:** Use strictly semantic tags (`<header>`, `<main>`, `<footer>`, `<section>`, `<article>`).
- **Headings:** Single `<h1>` per page. Logical hierarchy (`<h2>` to `<h6>`).
- **Meta Data:** 
  - Descriptive titles (e.g., "HanFlower | สั่งดอกไม้และไม้อวบน้ำ พร้อมการ์ดดิจิทัลบอกความในใจ")
  - Meta descriptions targeting keywords: สั่งดอกไม้, ช่อดอกไม้, ไม้อวบน้ำ, ของขวัญวาเลนไทน์, การ์ดบอกรัก.
- **Images:** Always include `alt` text and use Next.js `<Image />` component for optimization. Use descriptive filenames.
- **JSON-LD:** Implement Schema.org structured data for Products and Local Business.
- **Performance:** Maintain high Core Web Vitals (LCP, FID, CLS).

## Design System
- **Tone:** Premium Earth Tone & Soft Floral.
- **Color Palette:**
  - Background: `#FCF9F7` (Off-white beige)
  - Primary: `#A67C52` (Golden Brown/Caramel)
  - Secondary: `#E2BBA4` (Soft Peach)
  - Accent: `#D48C70` (Terracotta/Soft Orange)
  - Text Primary: `#2D2D2D` (Deep Charcoal)
- **Typography:**
  - Headings: `Playfair Display` (Serif)
  - Body: `Outfit` (Sans-serif)
- **Aesthetics:** Glassmorphism, smooth transitions, high-quality imagery, rounded corners (large).

## Technical Stack
- **Framework:** Next.js (App Router)
- **UI:** MUI (Material UI), Iconsax
- **Styling:** CSS Modules or Tailwind (as per default/user choice)
- **Design:** Modern, Premium, Elegant, Responsive. Use glassmorphism and smooth transitions.

## Content Guidelines
- Tone: Romantic, Elegant, Heartfelt.
- Language: Primary Thai (TH), Secondary English (EN) if needed.
- Focus on the emotional value of the gift.

## Rules for AI Assistant
1. Read this file before every major implementation.
2. Ensure every new page has proper SEO meta tags.
3. Use Iconsax for all icons. **CRITICAL:** Every Iconsax component MUST include `variant` (e.g., Bulk, Outline, Broken) and `color` (e.g., primary color hex) props to maintain design consistency.
4. Maintain a consistent premium aesthetic (Soft colors, high-quality imagery).
5. **Layout & Styling Rule:** Use MUI `Box` component with CSS Grid/Flexbox for all layouts. Prefer MUI `sx` prop for styling instead of Tailwind CSS classes to maintain theme consistency. Do NOT use MUI `Grid` component.
