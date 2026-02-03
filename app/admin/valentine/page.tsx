"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    useTheme,
    useMediaQuery,
    Tooltip,
    Alert
} from "@mui/material";
import {
    Add,
    SearchNormal,
    Edit,
    Trash,
    Copy,
    Export,
    Import,
    Image as ImageIcon,
    VideoPlay,
    Music,
    Ticket,
    Heart,
    Eye,
    CloseCircle,
    Maximize,
    DeviceMessage,
    Printer,
    ScanBarcode,
    Home,
    Refresh
} from "iconsax-react";
import Link from "next/link";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import QRCode from "qrcode";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MemoryItem {
    id?: string;
    type: string;
    url: string;
    caption?: string;
    file?: any;
}

interface ValentineCardFormData {
    title: string;
    openingText: string;
    greeting: string;
    subtitle: string;
    message: string;
    signer: string;
    slug: string;
    backgroundColor: string;
    backgroundMusicYoutubeId: string;
    backgroundMusicUrl: string;
    swipeHintColor: string;
    swipeHintText: string;
    isActive: boolean;
    showGame: boolean;
    memories: MemoryItem[];
    productIds: string[];
}

// --- Sortable Item Component ---
interface SortableMemoryItemProps {
    memory: MemoryItem;
    index: number;
    onRemove: (index: number) => void;
    onEdit: (index: number) => void;
}

function SortableMemoryItem({ memory, index, onRemove, onEdit }: SortableMemoryItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: memory.id || `memory-${index}` });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl mb-2 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="p-2 bg-gray-50 rounded-lg text-[#D4AF37] cursor-move">
                <DeviceMessage size="20" variant="Bold" color="#D4AF37" />
            </div>
            {memory.type === 'image' && <ImageIcon size="20" color="#D4AF37" />}
            {memory.type === 'video' && <VideoPlay size="20" color="#D4AF37" />}
            {memory.type === 'youtube' && <VideoPlay size="20" color="#D4AF37" />}
            {memory.type === 'tiktok' && <Music size="20" color="#D4AF37" />}

            <div className="flex-grow min-w-0">
                <Typography variant="subtitle2" className="text-gray-800 font-bold truncate">
                    {memory.caption || (memory.type === 'image' ? 'Image Memory' : 'Video Memory')}
                </Typography>
                <Typography variant="caption" className="text-gray-500 truncate block">
                    {memory.type.toUpperCase()} - {memory.url?.substring(0, 30)}...
                </Typography>
            </div>

            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton size="small" onClick={() => onEdit(index)}>
                    <Edit size="16" color="#D4AF37" />
                </IconButton>
                <IconButton size="small" onClick={() => onRemove(index)}>
                    <Trash size="16" color="#F87171" />
                </IconButton>
            </div>
        </div>
    );
}

const generateRandomSlug = () => {
    return Math.random().toString(36).substring(2, 10);
};

export default function AdminValentinePage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [activeTab, setActiveTab] = useState(0);
    const [cards, setCards] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [currentCardId, setCurrentCardId] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
    const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);
    const [cardOrientation, setCardOrientation] = useState<'vertical' | 'horizontal'>('vertical');
    const [qrTitle, setQrTitle] = useState("Happy Valentine's Day");
    const [downloading, setDownloading] = useState(false);
    const [videoUrlInput, setVideoUrlInput] = useState("");
    const [videoTypeInput, setVideoTypeInput] = useState<"youtube" | "tiktok">("youtube");

    // Helper to extract Video ID from URL
    const extractVideoId = (url: string, type: "youtube" | "tiktok") => {
        if (!url) return "";
        try {
            if (type === "youtube") {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : url;
            } else if (type === "tiktok") {
                const match = url.match(/\/video\/(\d+)/);
                return match ? match[1] : url.split('?')[0].split('/').pop() || url;
            }
        } catch (e) {
            return url;
        }
        return url;
    };

    const handleAddVideoLink = () => {
        if (!videoUrlInput) return;
        const videoId = extractVideoId(videoUrlInput, videoTypeInput);
        appendMemory({
            type: videoTypeInput,
            url: videoId,
            caption: videoTypeInput === "youtube" ? "YouTube Video" : "TikTok Video"
        });
        setVideoUrlInput("");
    };

    const { control, handleSubmit, reset, watch, setValue, register, formState: { errors } } = useForm<ValentineCardFormData>({
        defaultValues: {
            title: "FOR MY LOVE",
            openingText: "Tap to open",
            greeting: "Happy Valentine's Day",
            subtitle: "My Heart",
            message: "ขอส่งมอบความรักผ่านดอกไม้ช่อนี้ สุขสันต์วันวาเลนไทน์นะครับ/คะ",
            signer: "HanFlower",
            slug: "",
            backgroundColor: "#FFF0F3",
            backgroundMusicYoutubeId: "",
            backgroundMusicUrl: "", // Added for file upload
            swipeHintColor: "white",
            swipeHintText: "Swipe up",
            isActive: true, // Default active
            showGame: true,
            memories: [],
            productIds: [] // For associated products
        }
    });

    const { fields: memoryFields, append: appendMemory, remove: removeMemory, move: moveMemory, update: updateMemory } = useFieldArray({
        control,
        name: "memories"
    });

    // Sensors for Drag and Drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const watchedMemories = watch("memories");

    const fetchCards = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/valentine");
            if (res.ok) {
                const data = await res.json();
                setCards(data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/valentine/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    useEffect(() => {
        fetchCards();
        fetchProducts();
    }, []);

    const handleCreateNew = () => {
        reset({
            title: "FOR MY LOVE",
            openingText: "Tap to open",
            greeting: "Happy Valentine's Day",
            subtitle: "My Heart",
            message: "ขอส่งมอบความรักผ่านดอกไม้ช่อนี้ สุขสันต์วันวาเลนไทน์นะครับ/คะ",
            signer: "HanFlower",
            slug: generateRandomSlug(),
            backgroundColor: "#FFF0F3",
            backgroundMusicYoutubeId: "",
            backgroundMusicUrl: "",
            swipeHintColor: "white",
            swipeHintText: "Swipe up",
            isActive: true,
            showGame: true,
            memories: [],
            productIds: []
        });
        setCurrentCardId(null);
        setIsEditing(true);
        setActiveTab(0);
    };

    const handleEdit = async (card: any) => {
        // Fetch full details
        try {
            const res = await fetch(`/api/admin/valentine/${card.id}`);
            if (res.ok) {
                const fullCard = await res.json();
                reset({
                    ...fullCard,
                    productIds: fullCard.products ? fullCard.products.map((p: any) => p.id) : []
                });
                setCurrentCardId(card.id);
                setIsEditing(true);
            }
        } catch (error) {
            console.error("Failed to fetch card details", error);
        }
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const url = currentCardId ? `/api/admin/valentine/${currentCardId}` : "/api/admin/valentine";
            const method = currentCardId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setIsEditing(false);
                fetchCards();
                // Show success
            } else {
                console.error("Failed to save");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentCardId) return;
        try {
            const res = await fetch(`/api/admin/valentine/${currentCardId}`, { method: "DELETE" });
            if (res.ok) {
                setIsEditing(false);
                setDeleteConfirmOpen(false);
                fetchCards();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // --- QR Code Logic ---
    const generateQrCode = async (slug: string) => {
        try {
            const url = `${window.location.origin}/valentine/${slug}`;
            const qrDataUrl = await QRCode.toDataURL(url, { width: 500, margin: 2, color: { dark: '#000000', light: '#00000000' } });
            setQrPreviewUrl(qrDataUrl);
            setQrDialogOpen(true);
            // Default Title from card title
            const card = cards.find(c => c.slug === slug);
            const initialTitle = card?.title || "FOR MY LOVE";
            setQrTitle(initialTitle);

            // Generate initial preview
            setTimeout(() => generateCardPreview(qrDataUrl, 'vertical', initialTitle), 100);
        } catch (error) {
            console.error(error);
        }
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.error("Failed to load image:", src);
                // Return a generic error or handle it
                reject(new Error(`Failed to load image: ${src}`));
            };
        });
    };

    const generateCardPreview = async (qrUrl: string, orientation: 'vertical' | 'horizontal', title: string = qrTitle) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            const bgSrc = orientation === 'vertical' ? "/images/card_blank_vertical.jpg" : "/images/card_blank.jpg";

            // Standard Business Card Size (3.5 x 2 inches at 300 DPI is ~1050 x 600)
            const cardWidth = orientation === 'horizontal' ? 1050 : 600;
            const cardHeight = orientation === 'horizontal' ? 600 : 1050;

            // Load images
            const [bgImg, qrImg, heartImg] = await Promise.all([
                loadImage(bgSrc),
                loadImage(qrUrl),
                loadImage("/images/heart.png")
            ]);

            canvas.width = cardWidth;
            canvas.height = cardHeight;

            // Draw background (stretched to fit business card size)
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            if (orientation === 'horizontal') {
                const midX = canvas.width * 0.30; // 30% for left group center
                const heartMidX = canvas.width * 0.75; // Moved further right from 72%

                // Text 1: FOR MY LOVE (Elegant Handwritten)
                ctx.fillStyle = '#4A1D1D';
                ctx.font = 'italic 36px "Dancing Script", cursive';
                ctx.textAlign = 'center';
                ctx.fillText(title, midX, canvas.height * 0.13);

                // QR Code (Main CTA - Prominent)
                const qrSize = canvas.height * 0.68;
                const qrX = midX - qrSize / 2;
                const qrY = canvas.height * 0.18;
                ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

                // Text 2: สแกนเพื่อดูข้อความ
                ctx.fillStyle = '#888888';
                ctx.font = '22px "Prompt", sans-serif';
                ctx.fillText("สแกนเพื่อดูข้อความ", midX, qrY + qrSize + 30);

                // Heart (Supporting Element - Slightly Larger)
                const heartSize = 260;
                const hX = heartMidX - heartSize / 2;
                const hY = canvas.height * 0.5 - heartSize / 2;
                ctx.drawImage(heartImg, hX, hY, heartSize, heartSize);
            } else {
                // Vertical layout (Balanced Spacing - 600 x 1050)
                const midX = canvas.width / 2;

                // Text 1: Title (Elegant Handwritten)
                ctx.fillStyle = '#4A1D1D';
                ctx.font = 'italic 36px "Dancing Script", cursive';
                ctx.textAlign = 'center';
                ctx.fillText(title, midX, canvas.height * 0.10); // Moved up from 0.13

                // QR Code (Main Focus)
                const qrSize = canvas.width * 0.65;
                const qrX = midX - qrSize / 2;
                const qrY = canvas.height * 0.13; // Moved up from 0.15
                ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

                // Text 2: สแกนเพื่อดูข้อความ
                ctx.fillStyle = '#888888';
                ctx.font = '22px "Prompt", sans-serif';
                ctx.fillText("สแกนเพื่อดูข้อความ", midX, qrY + qrSize + 30);

                // Heart (Supporting Element - Moved up for balance)
                const heartSize = 320;
                const hX = midX - heartSize / 2;
                const hY = canvas.height * 0.64; // Moved up from 0.68
                ctx.drawImage(heartImg, hX, hY, heartSize, heartSize);
            }

            // --- Cutting Guide Corners (Professional Crop Marks) ---
            ctx.strokeStyle = '#D1D1D1'; // Light gray
            ctx.lineWidth = 1.5;
            ctx.setLineDash([]);
            const cL = 30; // Corner length
            const m = 5;  // Margin

            // Top-Left
            ctx.beginPath();
            ctx.moveTo(m, m + cL); ctx.lineTo(m, m); ctx.lineTo(m + cL, m);
            ctx.stroke();

            // Top-Right
            ctx.beginPath();
            ctx.moveTo(canvas.width - m - cL, m); ctx.lineTo(canvas.width - m, m); ctx.lineTo(canvas.width - m, m + cL);
            ctx.stroke();

            // Bottom-Left
            ctx.beginPath();
            ctx.moveTo(m, canvas.height - m - cL); ctx.lineTo(m, canvas.height - m); ctx.lineTo(m + cL, canvas.height - m);
            ctx.stroke();

            // Bottom-Right
            ctx.beginPath();
            ctx.moveTo(canvas.width - m - cL, canvas.height - m); ctx.lineTo(canvas.width - m, canvas.height - m); ctx.lineTo(canvas.width - m, canvas.height - m - cL);
            ctx.stroke();

            setCardPreviewUrl(canvas.toDataURL("image/png"));
        } catch (error) {
            console.error("Error generating card preview:", error);
            // Fallback to manual drawing if images fail
            canvas.width = 1200;
            canvas.height = orientation === 'vertical' ? 1800 : 900;
            ctx.fillStyle = '#FFF0F5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#D41442';
            ctx.font = 'bold 60px "Mali", cursive';
            ctx.textAlign = 'center';
            ctx.fillText(title, canvas.width / 2, 80);
            setCardPreviewUrl(canvas.toDataURL("image/png"));
        }
    };

    function drawHeartShape(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + topCurveHeight);
        // top left curve
        ctx.bezierCurveTo(
            x, y,
            x - size / 2, y,
            x - size / 2, y + topCurveHeight
        );
        // bottom left curve
        ctx.bezierCurveTo(
            x - size / 2, y + (size + topCurveHeight) / 2,
            x, y + (size + topCurveHeight) / 2,
            x, y + size
        );
        // bottom right curve
        ctx.bezierCurveTo(
            x, y + (size + topCurveHeight) / 2,
            x + size / 2, y + (size + topCurveHeight) / 2,
            x + size / 2, y + topCurveHeight
        );
        // top right curve
        ctx.bezierCurveTo(
            x + size / 2, y,
            x, y,
            x, y + topCurveHeight
        );
        ctx.fill();
        ctx.restore();
    }

    const handleDownloadCard = () => {
        if (cardPreviewUrl) {
            const link = document.createElement('a');
            link.href = cardPreviewUrl;
            link.download = `valentine-card-${qrTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    useEffect(() => {
        if (qrPreviewUrl) {
            generateCardPreview(qrPreviewUrl, cardOrientation, qrTitle);
        }
    }, [cardOrientation, qrTitle, qrPreviewUrl]);


    // --- File Upload Helpers ---
    const onDropMemory = useCallback((acceptedFiles: File[]) => {
        // Mock upload logic - ideally upload to server API and get URL
        // For now, we'll create object URLs for preview
        const newMemories = acceptedFiles.map(file => ({
            type: file.type.startsWith('video') ? 'video' : 'image',
            url: URL.createObjectURL(file), // Replace with real S3/Local URL after upload
            file: file, // Keep file for form submission if using FormData
            caption: file.name
        }));
        // Note: Field Array with files can be tricky. Better to upload immediately.
        // Simplified:
        appendMemory(newMemories);
    }, [appendMemory]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop: onDropMemory, accept: { 'image/*': [], 'video/*': [] } });

    // --- Tab Content ---
    const renderBasicInfo = () => (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <Box>
                <Controller name="title" control={control} render={({ field }) => (
                    <TextField {...field} label="Title (e.g. For My Love)" fullWidth error={!!errors.title} margin="normal" />
                )} />
            </Box>
            <Box>
                <Controller name="signer" control={control} rules={{ required: "กรุณาระบุชื่อผู้ส่ง" }} render={({ field }) => (
                    <TextField {...field} label="Signer Name" fullWidth margin="normal" error={!!errors.signer} helperText={errors.signer?.message} />
                )} />
            </Box>
            <Box>
                <Controller name="slug" control={control} rules={{ required: "Slug is required" }} render={({ field }) => (
                    <TextField {...field} label="URL Slug (Unique)" fullWidth error={!!errors.slug} helperText={errors.slug?.message} margin="normal"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">/valentine/</InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setValue("slug", generateRandomSlug())} size="small">
                                        <Refresh size="18" color="#D4AF37" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                )} />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
                <Controller name="message" control={control} rules={{ required: "กรุณาใส่ข้อความสื่อรัก" }} render={({ field }) => (
                    <TextField {...field} label="Main Message" fullWidth multiline rows={4} margin="normal" error={!!errors.message} helperText={errors.message?.message} />
                )} />
            </Box>
            <Box>
                <FormControlLabel control={<Switch {...register("isActive")} defaultChecked />} label="Active" />
                <FormControlLabel control={<Switch {...register("showGame")} defaultChecked />} label="Enable Game" />
            </Box>
        </Box>
    );

    const renderDesign = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ p: 3, border: '1px solid #eee', borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" gutterBottom className="text-gray-700 font-bold mb-3 flex items-center gap-2">
                    <VideoPlay size="20" color="#D4AF37" variant="Bold" />
                    เพิ่มวิดีโอจาก Link (YouTube / TikTok)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Select
                        value={videoTypeInput}
                        onChange={(e) => setVideoTypeInput(e.target.value as any)}
                        size="small"
                        sx={{ minWidth: 120 }}
                    >
                        <MenuItem value="youtube">YouTube</MenuItem>
                        <MenuItem value="tiktok">TikTok</MenuItem>
                    </Select>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder={videoTypeInput === 'youtube' ? "วางลิงก์ YouTube ที่นี่..." : "วางลิงก์ TikTok ที่นี่..."}
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVideoLink())}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button
                                        onClick={handleAddVideoLink}
                                        variant="contained"
                                        size="small"
                                        disabled={!videoUrlInput}
                                        sx={{ bgcolor: '#D4AF37', '&:hover': { bgcolor: '#B8860B' } }}
                                    >
                                        เพิ่ม
                                    </Button>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    * สามารถวาง Link เต็มจากเบราว์เซอร์ได้เลย ระบบจะดึงรหัสวิดีโอให้โดยอัตโนมัติ
                </Typography>
            </Box>

            <Box className="p-6 border border-dashed border-gray-300 rounded-xl text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors" {...getRootProps()}>
                <input {...getInputProps()} />
                <Typography color="textSecondary" className="flex items-center justify-center gap-2">
                    <ImageIcon size="24" color="#999" />
                    Drag & Drop Images/Videos here or Click to Upload
                </Typography>
            </Box>
            <Box>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(event) => {
                    const { active, over } = event;
                    if (active.id !== over?.id) {
                        const oldIndex = watchedMemories.findIndex((m, i) => (m.id || `memory-${i}`) === active.id);
                        const newIndex = watchedMemories.findIndex((m, i) => (m.id || `memory-${i}`) === over?.id);
                        moveMemory(oldIndex, newIndex);
                    }
                }}>
                    <SortableContext items={watchedMemories.map((m, i) => m.id || `memory-${i}`)} strategy={verticalListSortingStrategy}>
                        {watchedMemories.map((memory, index) => (
                            <SortableMemoryItem key={memory.id || `memory-${index}`} memory={memory} index={index} onRemove={removeMemory} onEdit={() => { }} />
                        ))}
                    </SortableContext>
                </DndContext>
            </Box>
        </Box>
    );

    return (
        <Box className="p-6 bg-gray-50 min-h-screen">
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'} mb-6`}>
                <div className="flex items-center gap-3">
                    <Button
                        component={Link}
                        href="/"
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                        startIcon={<Home size={isMobile ? "16" : "20"} variant="Bold" color="#D4AF37" />}
                        sx={{
                            borderRadius: '50px',
                            borderColor: '#D4AF37',
                            color: '#D4AF37',
                            minWidth: isMobile ? 'auto' : '100px',
                            '&:hover': {
                                borderColor: '#B8860B',
                                bgcolor: 'rgba(212, 175, 55, 0.05)'
                            }
                        }}
                    >
                        {isMobile ? "" : "Home"}
                    </Button>
                    <div>
                        <Typography variant={isMobile ? "h5" : "h4"} className="font-bold text-[#D4AF37] font-mali">Valentine Cards 💘</Typography>
                        <Typography variant="caption" className="text-gray-500">Manage your digital valentine cards</Typography>
                    </div>
                </div>
                {!isEditing && (
                    <Button
                        variant="contained"
                        fullWidth={isMobile}
                        startIcon={<Add color="#fff" />}
                        onClick={handleCreateNew}
                        sx={{ bgcolor: '#D4AF37', '&:hover': { bgcolor: '#B8860B' }, borderRadius: '50px', py: isMobile ? 1.5 : 1 }}
                    >
                        Create New Card
                    </Button>
                )}
            </div>

            {!isEditing ? (
                <Box>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cards.map(card => (
                            <Paper key={card.id} className="p-4 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B]" />
                                <div className="flex justify-between items-start mb-2">
                                    <Chip label={card.isActive ? "Active" : "Inactive"} color={card.isActive ? "success" : "default"} size="small" />
                                    <div className="flex gap-1">
                                        <Tooltip title="Preview QR">
                                            <IconButton size="small" onClick={() => generateQrCode(card.slug)}><ScanBarcode size="18" color="#D4AF37" /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton size="small" onClick={() => handleEdit(card)}><Edit size="18" color="#D4AF37" /></IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                                <Typography variant="h6" className="font-bold text-gray-800 mb-1">{card.title}</Typography>
                                <Typography variant="body2" className="text-gray-500 mb-4 line-clamp-2">{card.message}</Typography>

                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                                    <Heart size="14" variant="Bold" color="#D4AF37" />
                                    {card.memories?.length || 0} Memories
                                    <span className="mx-1">•</span>
                                    Visitors: {card.visitCount || 0}
                                </div>
                            </Paper>
                        ))}
                    </div>
                </Box>
            ) : (
                <Paper className="p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-4 mb-6 border-b pb-4">
                        <IconButton onClick={() => setIsEditing(false)}><CloseCircle color="#9CA3AF" /></IconButton>
                        <Typography variant="h5" className="font-bold text-gray-800">{currentCardId ? "Edit Card" : "New Valentine Card"}</Typography>
                    </div>

                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => setActiveTab(v)}
                        variant={isMobile ? "scrollable" : "standard"}
                        scrollButtons="auto"
                        sx={{
                            mb: 4,
                            '& .MuiTab-root': { color: '#999', minHeight: '64px' },
                            '& .Mui-selected': { color: '#D4AF37 !important' },
                            '& .MuiTabs-indicator': { bgcolor: '#D4AF37' }
                        }}
                    >
                        <Tab label={isMobile ? "Info" : "Basic Info"} icon={<Heart size="18" color={activeTab === 0 ? "#D4AF37" : "#999"} />} iconPosition="start" />
                        <Tab label={isMobile ? "Design" : "Design & Content"} icon={<ImageIcon size="18" color={activeTab === 1 ? "#D4AF37" : "#999"} />} iconPosition="start" />
                        <Tab label={isMobile ? "Settings" : "Products & Settings"} icon={<Ticket size="18" color={activeTab === 2 ? "#D4AF37" : "#999"} />} iconPosition="start" />
                    </Tabs>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {activeTab === 0 && renderBasicInfo()}
                        {activeTab === 1 && renderDesign()}
                        {activeTab === 2 && (
                            <Box>
                                <Controller name="productIds" control={control} render={({ field }) => (
                                    <Select {...field} multiple fullWidth displayEmpty renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const p = products.find(prod => prod.id === value);
                                                return <Chip key={value} label={p?.name || value} size="small" />;
                                            })}
                                        </Box>
                                    )}>
                                        {products.map(product => (
                                            <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
                                        ))}
                                    </Select>
                                )} />
                                <Typography variant="caption" className="text-gray-500 mt-2 block">Select products related to this campaign</Typography>
                            </Box>
                        )}

                        <div className={`flex ${isMobile ? 'flex-col-reverse' : 'justify-end'} gap-3 mt-8 pt-6 border-t`}>
                            {currentCardId && (
                                <Button
                                    color="error"
                                    fullWidth={isMobile}
                                    onClick={() => setDeleteConfirmOpen(true)}
                                    sx={{ py: isMobile ? 1.5 : 1 }}
                                >
                                    Delete Card
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                fullWidth={isMobile}
                                onClick={() => setIsEditing(false)}
                                sx={{ py: isMobile ? 1.5 : 1, borderRadius: '50px' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={loading}
                                fullWidth={isMobile}
                                sx={{ bgcolor: '#D4AF37', '&:hover': { bgcolor: '#B8860B' }, borderRadius: '50px', py: isMobile ? 1.5 : 1 }}
                            >
                                {loading ? <CircularProgress size={24} /> : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </Paper>
            )}

            {/* QR Code Dialog */}
            <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle className="font-mali font-bold text-[#D4AF37] flex justify-between items-center">
                    Download Card
                    <IconButton onClick={() => setQrDialogOpen(false)}><CloseCircle color="#9CA3AF" /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ px: isMobile ? 2 : 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 4 } }}>
                        <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
                            <div className="space-y-4">
                                <TextField
                                    label="Card Title"
                                    fullWidth
                                    value={qrTitle}
                                    onChange={(e) => setQrTitle(e.target.value)}
                                    variant="outlined"
                                />
                                <div>
                                    <Typography variant="subtitle2" gutterBottom className="text-gray-600">Orientation</Typography>
                                    <div className="flex gap-2">
                                        <Button
                                            fullWidth
                                            variant={cardOrientation === 'vertical' ? 'contained' : 'outlined'}
                                            onClick={() => setCardOrientation('vertical')}
                                            sx={{
                                                bgcolor: cardOrientation === 'vertical' ? '#D4AF37' : '',
                                                borderColor: '#D4AF37',
                                                color: cardOrientation === 'vertical' ? '#fff' : '#D4AF37',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            Vertical
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant={cardOrientation === 'horizontal' ? 'contained' : 'outlined'}
                                            onClick={() => setCardOrientation('horizontal')}
                                            sx={{
                                                bgcolor: cardOrientation === 'horizontal' ? '#D4AF37' : '',
                                                borderColor: '#D4AF37',
                                                color: cardOrientation === 'horizontal' ? '#fff' : '#D4AF37',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            Horizontal
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<Printer color="#fff" />}
                                    onClick={handleDownloadCard}
                                    sx={{
                                        bgcolor: '#D4AF37',
                                        py: 1.5,
                                        borderRadius: '50px',
                                        '&:hover': { bgcolor: '#B8860B' }
                                    }}
                                >
                                    Download Image
                                </Button>
                            </div>
                        </Box>
                        <Box sx={{
                            width: { xs: '100%', md: '66.666%' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f3f4f6',
                            borderRadius: '1rem',
                            p: { xs: 2, md: 4 },
                            overflow: 'hidden',
                            minHeight: { xs: '300px', md: '500px' }
                        }}>
                            {cardPreviewUrl ? (
                                <img src={cardPreviewUrl} alt="Preview" className="max-w-full shadow-lg rounded-lg object-contain" style={{ maxHeight: '80vh' }} />
                            ) : (
                                <CircularProgress />
                            )}
                            <Typography variant="caption" sx={{ mt: 2, color: '#999' }}>* ภาพพรีวิวขนาดจริงเมื่อดาวน์โหลดจะมีความละเอียดสูงกว่านี้</Typography>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Delete this card?</DialogTitle>
                <DialogContent>This action cannot be undone.</DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
