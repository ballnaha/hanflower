import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://hanflowerthailand.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // General crawlers (Google, Bing, etc.)
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/api/',
                    '/order/',
                    '/payment/',
                    '/payment-notification/',
                    '/ar-scan/',
                ],
            },
            // ChatGPT / OpenAI bot - ALLOW for AI search visibility
            {
                userAgent: 'GPTBot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/order/', '/payment/'],
            },
            // ChatGPT user browsing
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
                disallow: ['/admin/', '/api/', '/order/', '/payment/'],
            },
            // Google AI (Gemini, Bard, AI Overviews)
            {
                userAgent: 'Google-Extended',
                allow: '/',
                disallow: ['/admin/', '/api/', '/order/', '/payment/'],
            },
            // Anthropic (Claude)
            {
                userAgent: 'anthropic-ai',
                allow: '/',
                disallow: ['/admin/', '/api/', '/order/', '/payment/'],
            },
            {
                userAgent: 'Claude-Web',
                allow: '/',
                disallow: ['/admin/', '/api/', '/order/', '/payment/'],
            },
            // Bing AI (Copilot)
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/order/', '/payment/'],
            },
            // Perplexity AI
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/order/', '/payment/'],
            },
            // Common Crawl (used by many AI training)
            {
                userAgent: 'CCBot',
                allow: '/',
                disallow: ['/admin/', '/api/', '/order/', '/payment/'],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
