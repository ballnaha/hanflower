import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Seed Shipping Methods first
    const shippingMethods = [
        { code: 'standard', name: 'ขนส่งพัสดุ (Standard)', description: '1-2 วันทำการ • ทั่วประเทศ', price: 50, estimatedDays: '1-2 วัน', enabled: true, priority: 0 },
        { code: 'express', name: 'ส่งด่วน (Lalamove/Grab)', description: 'กทม. และปริมณฑล', price: 150, estimatedDays: 'ภายในวันเดียว', enabled: true, priority: 1 },
        { code: 'pickup', name: 'รับสินค้าเอง', description: 'รับสินค้าที่ร้าน ซอยวัดลาดปลาดุก นนทบุรี', price: 0, estimatedDays: 'นัดรับสินค้า', enabled: false, priority: 2 },
        { code: 'cod', name: 'เก็บเงินปลายทาง (COD)', description: 'ชำระเงินเมื่อรับสินค้า • ค่าบริการเพิ่ม', price: 30, estimatedDays: '2-3 วัน', enabled: false, priority: 3 }
    ];

    for (const method of shippingMethods) {
        await (prisma as any).shippingMethod.upsert({
            where: { code: method.code },
            update: method,
            create: method
        });
    }
    console.log('✅ Seeded shipping methods!');

    // Clear existing data
    await (prisma as any).orderItem.deleteMany();
    await (prisma as any).order.deleteMany();
    await (prisma as any).productFeature.deleteMany();
    await (prisma as any).productDetail.deleteMany();
    await (prisma as any).productImage.deleteMany();
    await (prisma as any).product.deleteMany();
    await (prisma as any).category.deleteMany();

    const productsData = [
        {
            sku: "HAN-001",
            slug: "ช่อกุหลาบหวาน",
            title: "Sweet Roses",
            type: "Signature Bouquet",
            price: 1290,
            originalPrice: 1590,
            discount: 19,
            image: "/images/product1.png",
            description: "ช่อกุหลาบพรีเมียมสีชมพูที่มัดอย่างประณีต เพื่อแสดงความรักและความชื่นชม ทุกดอกคัดสรรมาอย่างพิถีพิถันเพื่อความสดใหม่และความงาม",
            stock: 12,
            priority: 100,
            images: ["/images/product1.png", "/images/product2.png", "/images/product3.png"],
            details: [
                "กุหลาบพรีเมียมคัดเกรด",
                "ห่อด้วยกระดาษ Signature Hanflower",
                "การ์ดข้อความส่วนตัว",
                "จัดส่งในวันเดียวกัน"
            ],
            features: [
                "รับประกันความสด 5 วัน",
                "จากฟาร์มออร์แกนิคในประเทศ",
                "บรรจุภัณฑ์รักษ์โลก"
            ]
        },
        {
            sku: "HAN-002",
            slug: "ต้นนำโชค",
            title: "Lucky Jade",
            type: "Premium Succulent",
            price: 450,
            originalPrice: 550,
            discount: 18,
            image: "/images/product2.png",
            description: "ไม้อวบน้ำนำโชคที่สื่อถึงความเจริญรุ่งเรืองและโชคดี เหมาะสำหรับวางบนโต๊ะทำงานหรือชั้นวาง ดูแลง่ายแต่ให้เสน่ห์มากมาย",
            stock: 25,
            priority: 90,
            images: ["/images/product2.png", "/images/product1.png", "/images/product3.png"],
            details: [
                "กระถางเซรามิกคุณภาพสูง",
                "คู่มือการดูแลง่ายๆ",
                "หินประดับด้านบน",
                "สูงประมาณ 15 ซม."
            ],
            features: [
                "ฟอกอากาศ",
                "รดน้ำน้อย",
                "เป็นมิตรกับสัตว์เลี้ยง"
            ]
        },
        {
            sku: "HAN-003",
            slug: "ตะกร้าผลไม้ทอง",
            title: "Golden Pear",
            type: "Fruit Basket",
            price: 2590,
            originalPrice: 3290,
            discount: 21,
            image: "/images/product3.png",
            description: "คอลเลกชันผลไม้พรีเมียมตามฤดูกาล นำโดยลูกแพร์ทองอันเป็นเอกลักษณ์ จัดเรียงอย่างสวยงามในตะกร้าหวายทำมือ",
            stock: 8,
            priority: 80,
            images: ["/images/product3.png", "/images/product4.png", "/images/product5.png"],
            details: [
                "ผลไม้พรีเมียมตามฤดูกาล",
                "ตะกร้าหวายสานมือ",
                "ริบบิ้นซาตินประดับ",
                "การ์ดข้อความ"
            ],
            features: [
                "คุณภาพส่งออก",
                "คัดสรรความสุก",
                "บรรจุภัณฑ์ปลอดภัย"
            ]
        },
        {
            sku: "HAN-004",
            slug: "กล่องของขวัญฤดูหนาว",
            title: "Winterberry Box",
            type: "Gift Box",
            price: 1890,
            originalPrice: 2290,
            discount: 17,
            image: "/images/product4.png",
            description: "กล่องของขวัญอบอุ่นและหรูหรา มาพร้อมผลเบอร์รี่ฤดูหนาว ช็อกโกแลตชั้นดี และเทียนหอม ของขวัญที่สมบูรณ์แบบสำหรับทุกโอกาส",
            stock: 15,
            priority: 70,
            images: ["/images/product4.png", "/images/product5.png", "/images/product6.png"],
            details: [
                "กิ่งเบอร์รี่สด",
                "ช็อกโกแลตอาร์ติซาน",
                "เทียนหอมถั่วเหลือง",
                "กล่องบุกำมะหยี่"
            ],
            features: [
                "พร้อมมอบเป็นของขวัญ",
                "ประสบการณ์หลากประสาทสัมผัส",
                "Limited Edition"
            ]
        },
        {
            sku: "HAN-005",
            slug: "ลิลลี่หรูหรา",
            title: "Elegant Lily",
            type: "Vase Arrangement",
            price: 1890,
            originalPrice: 2290,
            discount: 17,
            image: "/images/product5.png",
            description: "ดอกลิลลี่ขาวบริสุทธิ์จัดเรียงกับใบเขียวสดในแจกันแก้วใส สื่อถึงความบริสุทธิ์และความงดงาม เหมาะสำหรับทุกโอกาสพิเศษ",
            stock: 10,
            priority: 60,
            images: ["/images/product5.png", "/images/product6.png", "/images/product7.png"],
            details: [
                "ลิลลี่ก้านยาว 6-8 ดอก",
                "แจกันแก้วอิตาลี",
                "ยูคาลิปตัสและใบประดับ",
                "อาหารดอกไม้"
            ],
            features: [
                "หอมมาก",
                "บานทนนาน",
                "ดีไซน์คลาสสิก"
            ]
        },
        {
            sku: "HAN-006",
            slug: "สวนกุหลาบ",
            title: "Rose Garden",
            type: "Mixed Bouquet",
            price: 1590,
            originalPrice: 1990,
            discount: 20,
            image: "/images/product6.png",
            description: "กุหลาบแดงและชมพูผสมผสานกับดอกยิปโซ เหมาะสำหรับวันครบรอบ วาเลนไทน์ หรือทุกโอกาสโรแมนติก",
            stock: 18,
            priority: 50,
            images: ["/images/product6.png", "/images/product7.png", "/images/product1.png"],
            details: [
                "กุหลาบ 12 ดอกผสมสี",
                "ดอกยิปโซประดับ",
                "ห่อของขวัญสวยงาม",
                "วิธีดูแล"
            ],
            features: [
                "สดนาน",
                "ดอกเกรด A",
                "ทำด้วยใจรัก"
            ]
        },
        {
            sku: "HAN-007",
            slug: "สวรรค์เขตร้อน",
            title: "Tropical Paradise",
            type: "Exotic Arrangement",
            price: 2190,
            originalPrice: 2690,
            discount: 19,
            image: "/images/product7.png",
            description: "การจัดดอกไม้เขตร้อนสดใส มีดอกนกสวรรค์ แอนทูเรียม และใบไม้เอ็กโซติก นำความรู้สึกเขตร้อนมาสู่ทุกพื้นที่",
            stock: 6,
            priority: 40,
            images: ["/images/product7.png", "/images/product1.png", "/images/product2.png"],
            details: [
                "ดอกนกสวรรค์",
                "แอนทูเรียมแดง",
                "ใบปาล์มเขตร้อน",
                "แจกันเซรามิกทันสมัย"
            ],
            features: [
                "แปลกใหม่ไม่เหมือนใคร",
                "Statement Piece",
                "อยู่ได้นาน"
            ]
        }
    ];

    for (const productData of productsData) {
        const { images, details, features, ...product } = productData;

        await (prisma as any).product.create({
            data: {
                ...product,
                id: product.sku, // Use SKU as ID since it's unique
                productimages: {
                    create: images.map(url => ({ url }))
                },
                productdetails: {
                    create: details.map(text => ({ text }))
                },
                productfeatures: {
                    create: features.map(text => ({ text }))
                }
            }
        });
    }

    console.log('✅ Seeded 7 products with Thai slugs successfully!');

    // Seed Collections (category in schema)
    const collectionsData = [
        {
            id: 'bouquet',
            slug: 'bouquet',
            title: 'ช่อดอกไม้',
            subtitle: 'SIGNATURE',
            description: 'จัดช่อสไตล์ฝรั่งเศส',
            image: '/images/img2.webp',
            priority: 100
        },
        {
            id: 'succulent',
            slug: 'succulent',
            title: 'ไม้มงคล & ไม้อวบน้ำ',
            subtitle: 'LUCKY & SUCCULENTS',
            description: 'สัญลักษณ์แห่งความโชคดี',
            image: '/images/succulent.png',
            priority: 90
        },
        {
            id: 'fruit-basket',
            slug: 'fruit-basket',
            title: 'กระเช้าผลไม้',
            subtitle: 'PREMIUM FRUITS',
            description: 'ผลไม้นำเข้าคัดพิเศษ',
            image: '/images/img1.webp',
            priority: 80
        },
        {
            id: 'souvenir',
            slug: 'souvenir',
            title: 'ของชำร่วย',
            subtitle: 'SOUVENIRS',
            description: 'ของที่ระลึกสุดพิเศษ',
            image: '/images/bouquet.png',
            priority: 70
        }
    ];

    for (const collection of collectionsData) {
        await (prisma as any).category.upsert({
            where: { id: collection.id },
            update: collection,
            create: collection
        });
    }

    console.log('✅ Seeded 4 collections successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
