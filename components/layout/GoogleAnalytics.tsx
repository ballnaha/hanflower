'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (!GA_MEASUREMENT_ID) return;

        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

        // Push page_view to GA
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }, [pathname, searchParams, GA_MEASUREMENT_ID]);

    if (!GA_MEASUREMENT_ID) return null;

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_MEASUREMENT_ID}', {
                            page_path: window.location.pathname,
                        });
                    `,
                }}
            />
        </>
    );
}

// Add gtag to window object
declare global {
    interface Window {
        gtag: (command: string, id: string, config?: any) => void;
        dataLayer: any[];
    }
}
