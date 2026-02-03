"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ValentineCardForm from "@/components/admin/valentine/ValentineCardForm";
import { Box, CircularProgress, Typography } from "@mui/material";
import AdminLayout from "@/components/admin/AdminLayout";

export default function EditValentineCardPage() {
    const params = useParams();
    const id = params.id as string;
    const [card, setCard] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCard = async () => {
            try {
                const res = await fetch(`/api/admin/valentine/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCard(data);
                }
            } catch (error) {
                console.error("Failed to fetch card", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCard();
    }, [id]);

    if (loading) {
        return (
            <AdminLayout title="Edit Valentine Card">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                    <CircularProgress sx={{ color: '#D4AF37' }} />
                    <Typography sx={{ mt: 2, color: '#666' }}>กำลังโหลดข้อมูลการ์ด...</Typography>
                </Box>
            </AdminLayout>
        );
    }

    if (!card) {
        return (
            <AdminLayout title="Edit Valentine Card">
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography variant="h6" color="error">ไม่พบข้อมูลการ์ดที่ระบุ</Typography>
                </Box>
            </AdminLayout>
        );
    }

    return <ValentineCardForm initialData={card} isNew={false} />;
}
