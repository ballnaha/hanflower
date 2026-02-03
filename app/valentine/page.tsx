"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Heart } from "iconsax-react";

export default function ValentineRootPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the default card or show an error
        // You might want to change this default redirect or make it a landing page later
        router.replace("/valentine/my-love");
    }, [router]);

    return (
        <Box
            sx={{
                height: "100dvh",
                width: "100vw",
                background: "#FFF0F3",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Heart size="80" variant="Bulk" color="#FF3366" className="animate-bounce" />
                <CircularProgress size={100} thickness={2} sx={{ position: 'absolute', top: -10, color: '#FF3366', opacity: 0.3 }} />
                <Typography sx={{ mt: 4, color: '#4A151B', fontWeight: 800, fontFamily: 'cursive', letterSpacing: 2 }}>
                    Redirecting to your surprise...
                </Typography>
            </Box>
        </Box>
    );
}
