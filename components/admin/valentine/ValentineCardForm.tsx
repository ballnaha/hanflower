"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    Tab,
    Tabs,
    Select,
    MenuItem,
    Chip,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Tooltip,
    LinearProgress,
    Checkbox,
    Divider,
    Card,
} from "@mui/material";
import {
    Trash,
    Image as ImageIcon,
    VideoPlay,
    Music,
    Ticket,
    Heart,
    CloseCircle,
    DeviceMessage,
    Refresh,
    AddCircle,
    Save2,
    ArrowLeft
} from "iconsax-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminLayout from "@/components/admin/AdminLayout";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

interface MemoryItem {
    id?: string;
    type: string;
    url: string;
    caption?: string;
    file?: any;
}

interface ValentineCardFormData {
    jobName: string;
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
    status: string;
    showGame: boolean;
    campaignName: string;
    customerPhone: string;
    customerAddress: string;
    note: string;
    disabledAt: string;
    memories: MemoryItem[];
    productIds: string[];
}

// --- Sortable Item Component ---
interface SortableMemoryItemProps {
    memory: MemoryItem;
    index: number;
    onRemove: (index: number) => void;
    onChangeCaption: (index: number, caption: string) => void;
}

function SortableMemoryItem({ memory, index, onRemove, onChangeCaption }: SortableMemoryItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: memory.id || `memory-${index}` });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl mb-2 shadow-sm hover:shadow-md transition-shadow relative group">
            <div {...attributes} {...listeners} className="p-2 bg-gray-50 rounded-lg text-gray-400 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors">
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px' }}>
                    {[...Array(6)].map((_, i) => (
                        <Box key={i} sx={{ width: 3, height: 3, bgcolor: 'currentColor', borderRadius: '50%' }} />
                    ))}
                </Box>
            </div>

            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {memory.type === 'image' && (
                    <img src={memory.url} className="w-full h-full object-cover" alt="Preview" />
                )}
                {memory.type === 'video' && <VideoPlay size="24" color="#D4AF37" variant="Bold" />}
                {memory.type === 'youtube' && <img src={`https://img.youtube.com/vi/${memory.url}/default.jpg`} className="w-full h-full object-cover" />}
                {memory.type === 'tiktok' && <Music size="24" color="#D4AF37" variant="Bold" />}
            </div>

            <div className="flex-grow min-w-0">
                <TextField
                    fullWidth
                    size="small"
                    placeholder="ใส่ข้อความสื่อรัก..."
                    value={memory.caption || ""}
                    onChange={(e) => onChangeCaption(index, e.target.value)}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true,
                        sx: {
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#1f2937',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                            padding: '4px 8px',
                            borderRadius: '4px'
                        }
                    }}
                />
                <Typography variant="caption" className="text-gray-400 px-2 truncate block">
                    {memory.type.toUpperCase()} • {memory.url?.substring(0, 40)}
                </Typography>
            </div>

            <div className="flex items-center gap-1">
                <Tooltip title="Remove">
                    <IconButton size="small" onClick={() => onRemove(index)}>
                        <Trash size="18" color="#F87171" variant="Bold" />
                    </IconButton>
                </Tooltip>
            </div>
        </div>
    );
}

const generateRandomSlug = () => {
    return Math.random().toString(36).substring(2, 10);
};

interface ValentineCardFormProps {
    initialData?: any;
    isNew?: boolean;
}

export default function ValentineCardForm({ initialData, isNew = false }: ValentineCardFormProps) {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [activeTab, setActiveTab] = useState(0);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [videoUrlInput, setVideoUrlInput] = useState("");
    const [videoTypeInput, setVideoTypeInput] = useState<"youtube" | "tiktok">("youtube");
    const [videoCaptionInput, setVideoCaptionInput] = useState("");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [musicFile, setMusicFile] = useState<File | null>(null);
    const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const sanitizeData = useCallback((data: any) => {
        if (!data) return data;
        const sanitized = { ...data };
        Object.keys(sanitized).forEach(key => {
            if (sanitized[key] === null) {
                sanitized[key] = "";
            }
        });
        if (data.disabledAt) {
            sanitized.disabledAt = new Date(data.disabledAt).toISOString().slice(0, 16);
        }
        if (data.orderedProducts) {
            sanitized.productIds = data.orderedProducts.map((p: any) => p.id) || [];
        }
        if (data.memories) {
            sanitized.memories = data.memories.map((m: any) => ({
                ...m,
                url: m.url ? (m.url.startsWith('/uploads/') ? m.url.replace('/uploads/', '/api/images/') : m.url) : ""
            }));
        }
        if (data.backgroundMusicUrl && data.backgroundMusicUrl.startsWith('/uploads/')) {
            sanitized.backgroundMusicUrl = data.backgroundMusicUrl.replace('/uploads/', '/api/images/');
        }
        return sanitized;
    }, []);

    const { control, handleSubmit, reset, watch, setValue, register, getValues, formState: { errors } } = useForm<ValentineCardFormData>({
        defaultValues: initialData ? sanitizeData(initialData) : {
            jobName: "",
            title: "For My Love",
            openingText: "Tap to open",
            greeting: "Happy Valentine's Day",
            subtitle: "My Heart",
            message: "ขอส่งมอบความรักผ่านดอกไม้ช่อนี้ สุขสันต์วันวาเลนไทน์นะคะ",
            signer: "HanFlower",
            slug: generateRandomSlug(),
            backgroundColor: "#FFF0F3",
            backgroundMusicYoutubeId: "",
            backgroundMusicUrl: "",
            swipeHintColor: "white",
            swipeHintText: "Swipe up",
            status: "active",
            showGame: true,
            campaignName: "Valentine's",
            customerPhone: "",
            customerAddress: "",
            note: "",
            disabledAt: "",
            memories: [],
            productIds: []
        }
    });

    const { fields: memoryFields, append: appendMemory, remove: removeMemory, move: moveMemory, update: updateMemory } = useFieldArray({
        control,
        name: "memories"
    });

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
    const watchedMemories = watch("memories");

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        if (initialData) {
            reset(sanitizeData(initialData));
        }
    }, [initialData, reset, sanitizeData]);

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
        } catch (e) { return url; }
        return url;
    };

    const handleAddVideoLink = () => {
        if (!videoUrlInput) return;
        const videoId = extractVideoId(videoUrlInput, videoTypeInput);
        appendMemory({
            type: videoTypeInput,
            url: videoId,
            caption: videoCaptionInput || ""
        });
        setVideoUrlInput("");
        setVideoCaptionInput("");
    };

    const handleUpdateMemoryCaption = (index: number, caption: string) => {
        updateMemory(index, { ...watchedMemories[index], caption });
    };

    const handleRemoveMemory = (index: number) => {
        const memory = watchedMemories[index];
        if (memory && memory.url && memory.url.startsWith('/uploads')) {
            setUrlsToDelete(prev => [...prev, memory.url]);
        }
        removeMemory(index);
    };

    const onSubmit = async (data: any) => {
        setLoading(true);
        setUploadProgress(0);
        try {
            let finalData = { ...data, urlsToDelete };
            const memoriesToUpload = data.memories.filter((m: any) => m.file);
            const totalToUpload = memoriesToUpload.length + (musicFile ? 1 : 0);
            let uploadedCount = 0;

            // 1. Upload Music File if selected
            if (musicFile) {
                const formData = new FormData();
                formData.append('file', musicFile);
                formData.append('slug', data.slug);

                const uploadRes = await fetch('/api/upload/valentine', { method: 'POST', body: formData });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    finalData.backgroundMusicUrl = uploadData.url;
                    uploadedCount++;
                    setUploadProgress(Math.round((uploadedCount / totalToUpload) * 100));
                } else {
                    throw new Error("อัปโหลดไฟล์เพลงล้มเหลว");
                }
            }

            // 2. Upload Memories files if any
            if (memoriesToUpload.length > 0) {
                for (let i = 0; i < data.memories.length; i++) {
                    const memory = data.memories[i];
                    if (memory.file) {
                        const formData = new FormData();
                        formData.append('file', memory.file);
                        formData.append('slug', data.slug);

                        const res = await fetch('/api/upload/valentine', { method: 'POST', body: formData });
                        if (res.ok) {
                            const uploadRes = await res.json();
                            finalData.memories[i].url = uploadRes.url;
                            delete finalData.memories[i].file;
                            uploadedCount++;
                            setUploadProgress(Math.round((uploadedCount / totalToUpload) * 100));
                        } else {
                            throw new Error(`Failed to upload ${memory.file.name}`);
                        }
                    }
                }
            }

            const url = isNew ? "/api/admin/valentine" : `/api/admin/valentine/${initialData.id}`;
            const method = isNew ? "POST" : "PUT";

            // Map productIds to orderedProducts for the backend API
            if (finalData.productIds) {
                finalData.orderedProducts = finalData.productIds;
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData)
            });

            if (res.ok) {
                router.push("/admin/valentine");
                router.refresh();
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to save");
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "An error occurred while saving");
        } finally {
            setLoading(false);
            setUploadProgress(null);
        }
    };

    const handleDelete = async () => {
        if (isNew || !initialData?.id) return;
        try {
            const res = await fetch(`/api/admin/valentine/${initialData.id}`, { method: "DELETE" });
            if (res.ok) {
                router.push("/admin/valentine");
                router.refresh();
            }
        } catch (error) { console.error(error); }
    };

    const onDropMemory = useCallback(async (acceptedFiles: File[]) => {
        const currentSlug = getValues("slug");
        if (!currentSlug) {
            alert("กรุณาระบุ URL Slug ก่อนอัปโหลดไฟล์");
            return;
        }

        const newMemories = acceptedFiles.map(file => ({
            type: file.type.startsWith('video') ? 'video' : 'image',
            url: URL.createObjectURL(file),
            caption: file.name,
            file: file
        }));

        appendMemory(newMemories);
    }, [appendMemory, getValues]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop: onDropMemory, accept: { 'image/*': [], 'video/*': [] } });

    const renderBasicInfo = () => (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <Box>
                <Controller name="jobName" control={control} render={({ field }) => (
                    <TextField {...field} label="Job Name (Admin Only)" fullWidth margin="normal" placeholder="เช่น คุณลูกค้า A - ช่อกุหลาบแดง" />
                )} />
            </Box>
            <Box>
                <Controller name="title" control={control} render={({ field }) => (
                    <TextField {...field} label="Display Title (Previewable)" fullWidth error={!!errors.title} margin="normal" />
                )} />
            </Box>
            <Box>
                <Controller name="signer" control={control} rules={{ required: "กรุณาระบุชื่อผู้ส่ง" }} render={({ field }) => (
                    <TextField {...field} label="Signer Name" fullWidth margin="normal" error={!!errors.signer} helperText={errors.signer?.message} />
                )} />
            </Box>
            <Box>
                <Controller name="slug" control={control} rules={{ required: "ต้องระบุ URL Slug เสมอ" }} render={({ field }) => (
                    <TextField {...field} label="URL Slug (Unique)" fullWidth required error={!!errors.slug} helperText={errors.slug?.message || "ใช้สำหรับลิงก์เข้าชมหน้าการ์ด (ห้ามว่าง)"} margin="normal"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">/valentine/</InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setValue("slug", generateRandomSlug())} size="small" tabIndex={-1}>
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
                <Controller name="campaignName" control={control} render={({ field }) => (
                    <TextField {...field} label="Campaign Name (e.g. Valentine's)" fullWidth margin="normal" />
                )} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Typography variant="body2">Status:</Typography>
                <Controller name="status" control={control} render={({ field }) => (
                    <Select {...field} size="small" sx={{ minWidth: 120 }}>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                )} />
                <FormControlLabel control={<Switch checked={watch("showGame")} onChange={(e) => setValue("showGame", e.target.checked)} />} label="Enable Game" />
            </Box>
            <Box>
                <Controller
                    name="disabledAt"
                    control={control}
                    render={({ field }) => (
                        <DateTimePicker
                            label="Expiration Date (วันหมดอายุการ์ด)"
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(newValue) => {
                                field.onChange(newValue ? newValue.toISOString() : "");
                            }}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    margin: "normal",
                                    helperText: "หากไม่ระบุ การ์ดจะไม่มีวันหมดอายุ"
                                }
                            }}
                        />
                    )}
                />
            </Box>
            <Box sx={{ gridColumn: '1 / -1', mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">Customer Information (Internal)</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Controller name="customerPhone" control={control} render={({ field }) => (
                        <TextField {...field} label="Customer Phone" fullWidth size="small" />
                    )} />
                    <Controller name="customerAddress" control={control} render={({ field }) => (
                        <TextField {...field} label="Customer Address" fullWidth size="small" multiline rows={2} />
                    )} />
                    <Box sx={{ gridColumn: '1 / -1' }}>
                        <Controller name="note" control={control} render={({ field }) => (
                            <TextField {...field} label="Internal Admin Note" fullWidth size="small" multiline rows={2} />
                        )} />
                    </Box>
                </Box>
            </Box>
            <Box sx={{ gridColumn: '1 / -1', mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Music size="18" variant="Bold" color="#D4AF37" /> Background Music & Style
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 3 }}>
                    <Box>
                        <Controller name="backgroundMusicYoutubeId" control={control} render={({ field }) => (
                            <TextField
                                {...field}
                                label="YouTube Video ID (เช่น dQw4w9WgXcQ)"
                                fullWidth
                                size="small"
                                margin="normal"
                                helperText="จะถูกใช้เมื่อไม่มีการอัปโหลดไฟล์ MP3"
                                InputProps={{
                                    endAdornment: field.value && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setValue("backgroundMusicYoutubeId", "")}>
                                                <CloseCircle size="18" variant="Bold" color="#FF6B6B" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )} />
                    </Box>
                    <Box>
                        <Controller name="backgroundColor" control={control} render={({ field }) => (
                            <TextField {...field} label="Background Color (HEX)" fullWidth size="small" margin="normal" placeholder="#FFF0F3" />
                        )} />
                    </Box>
                </Box>

                <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: '12px', bgcolor: '#fafafa', mb: 3 }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontWeight: 'bold' }}>
                        <Music size="16" variant="Bold" /> Upload MP3 File (แนะนำไฟล์ขนาดไม่เกิน 5MB)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <TextField
                            value={musicFile ? musicFile.name : (watch("backgroundMusicUrl")?.split('/').pop() || "")}
                            fullWidth
                            size="small"
                            disabled
                            placeholder="ยังไม่ได้อัปโหลดไฟล์เพลง"
                            sx={{
                                '& .MuiInputBase-root': { bgcolor: '#fff', height: 40 },
                                '& .MuiFormHelperText-root': { position: 'absolute', bottom: -20 }
                            }}
                            helperText={musicFile ? "ไฟล์ใหม่ (จะอัปโหลดเมื่อบันทึก)" : ""}
                            InputProps={{
                                endAdornment: (watch("backgroundMusicUrl") || musicFile) && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => {
                                            const currentUrl = watch("backgroundMusicUrl");
                                            if (currentUrl) {
                                                setUrlsToDelete(prev => [...prev, currentUrl]);
                                                setValue("backgroundMusicUrl", "");
                                            }
                                            setMusicFile(null);
                                        }}>
                                            <CloseCircle size="18" variant="Bold" color="#FF6B6B" />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            sx={{
                                minWidth: 100,
                                borderRadius: '8px',
                                height: 40,
                                borderColor: '#D4AF37',
                                color: '#D4AF37',
                                '&:hover': { borderColor: '#B8860B', bgcolor: 'rgba(212, 175, 55, 0.04)' }
                            }}
                        >
                            {watch("backgroundMusicUrl") || musicFile ? "Change" : "Select MP3"}
                            <input
                                type="file"
                                hidden
                                accept="audio/mpeg,audio/mp3"
                                onClick={(e) => {
                                    (e.target as HTMLInputElement).value = '';
                                }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setMusicFile(file);
                                }}
                            />
                        </Button>
                    </Box>
                    <Box sx={{ height: 10 }} /> {/* Space for absolute helper text */}
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                    <Controller name="swipeHintText" control={control} render={({ field }) => (
                        <TextField {...field} label="Swipe Hint Text" fullWidth size="small" />
                    )} />
                    <Controller name="swipeHintColor" control={control} render={({ field }) => (
                        <Select {...field} fullWidth size="small">
                            <MenuItem value="white">White Hint</MenuItem>
                            <MenuItem value="red">Red Hint</MenuItem>
                        </Select>
                    )} />
                </Box>
            </Box>
        </Box>
    );

    const renderOrderedProducts = () => {
        const groupedProducts = products.reduce((acc, product: any) => {
            const cat = product.category || 'General';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(product);
            return acc;
        }, {} as Record<string, any[]>);

        return (
            <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ color: '#D4AF37', mb: 3 }}>
                    เลือกสินค้าจาก Catalog ของร้าน
                </Typography>
                {Object.keys(groupedProducts).length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: '12px' }}>
                        <Typography color="textSecondary">ไม่พบสินค้าในระบบ</Typography>
                    </Box>
                ) : (
                    Object.entries(groupedProducts).map(([category, items]: [string, any]) => (
                        <Box key={category} sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#374151', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 4, height: 16, bgcolor: '#D4AF37', borderRadius: 4 }} />
                                {category.toUpperCase()}
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                                {items.map((product: any) => (
                                    <Box key={product.id}>
                                        <Controller
                                            name="productIds"
                                            control={control}
                                            render={({ field }) => {
                                                const isChecked = field.value?.includes(product.id);
                                                return (
                                                    <Card
                                                        variant="outlined"
                                                        onClick={() => {
                                                            const newValue = isChecked
                                                                ? field.value.filter((id: string) => id !== product.id)
                                                                : [...(field.value || []), product.id];
                                                            field.onChange(newValue);
                                                        }}
                                                        sx={{
                                                            p: 2,
                                                            cursor: 'pointer',
                                                            borderRadius: '12px',
                                                            transition: 'all 0.2s',
                                                            borderColor: isChecked ? '#D4AF37' : '#eee',
                                                            bgcolor: isChecked ? 'rgba(212, 175, 55, 0.04)' : '#fff',
                                                            '&:hover': { borderColor: '#D4AF37', transform: 'translateY(-2px)' }
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            {product.image && (
                                                                <Box
                                                                    component="img"
                                                                    src={product.image}
                                                                    sx={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover' }}
                                                                />
                                                            )}
                                                            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                                                <Typography variant="body2" fontWeight="600" noWrap title={product.title}>{product.title}</Typography>
                                                                <Typography variant="caption" color="textSecondary">฿{product.price.toLocaleString()}</Typography>
                                                            </Box>
                                                            <Checkbox
                                                                checked={isChecked}
                                                                size="small"
                                                                sx={{ color: '#D4AF37', '&.Mui-checked': { color: '#D4AF37' } }}
                                                            />
                                                        </Box>
                                                    </Card>
                                                );
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                            <Divider sx={{ mt: 3 }} />
                        </Box>
                    ))
                )}
            </Box>
        );
    };

    const renderDesign = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ p: 3, border: '1px solid #eee', borderRadius: '12px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" gutterBottom className="text-gray-700 font-bold mb-3 flex items-center gap-2">
                    <VideoPlay size="20" color="#D4AF37" variant="Bold" /> เพิ่มวิดีโอจาก Link (YouTube / TikTok)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
                    <Select value={videoTypeInput} onChange={(e) => setVideoTypeInput(e.target.value as any)} size="small" sx={{ minWidth: 120, height: 40 }}>
                        <MenuItem value="youtube">YouTube</MenuItem>
                        <MenuItem value="tiktok">TikTok</MenuItem>
                    </Select>
                    <TextField fullWidth size="small" placeholder={videoTypeInput === 'youtube' ? "วางลิงก์ YouTube ที่นี่..." : "วางลิงก์ TikTok ที่นี่..."} value={videoUrlInput} onChange={(e) => setVideoUrlInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVideoLink())} sx={{ '& .MuiOutlinedInput-root': { height: 40 } }} />
                    <TextField fullWidth size="small" placeholder="ใส่คำอธิบาย (Caption)" value={videoCaptionInput} onChange={(e) => setVideoCaptionInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVideoLink())} sx={{ '& .MuiOutlinedInput-root': { height: 40 } }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button onClick={handleAddVideoLink} variant="contained" size="small" disabled={!videoUrlInput} sx={{ bgcolor: '#D4AF37', '&:hover': { bgcolor: '#B8860B' }, minWidth: 80, height: 32 }}>เพิ่ม</Button>
                                </InputAdornment>
                            )
                        }} />
                </Box>
            </Box>
            <Box className="p-10 border-2 border-dashed border-gray-300 rounded-2xl text-center cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#D4AF37] transition-all" {...getRootProps()}>
                <input {...getInputProps()} />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <ImageIcon size="40" color="#999" variant="Bulk" />
                        <VideoPlay size="40" color="#D4AF37" variant="Bulk" />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ color: '#4b5563', fontWeight: 600 }}>Drag & Drop Images or MP4 Videos</Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>or Click to browse files from your device</Typography>
                    </Box>
                </Box>
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
                            <SortableMemoryItem key={memory.id || `memory-${index}`} memory={memory} index={index} onRemove={handleRemoveMemory} onChangeCaption={handleUpdateMemoryCaption} />
                        ))}
                    </SortableContext>
                </DndContext>
            </Box>
        </Box>
    );

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AdminLayout title={isNew ? "Create New Card" : "Edit Valentine Card"}>
                <Paper className="p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b pb-4">
                        <div className="flex items-center gap-4">
                            <IconButton component={Link} href="/admin/valentine"><ArrowLeft color="#9CA3AF" /></IconButton>
                            <Typography variant="h5" className="font-bold text-gray-800">{isNew ? "New Valentine Card" : "Edit Card"}</Typography>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isNew && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => window.open(`/valentine/${initialData.slug}`, '_blank')}
                                        startIcon={<Ticket size="20" variant="Bold" color="#D4AF37" />}
                                        sx={{ borderRadius: '12px', color: '#D4AF37', borderColor: '#D4AF37' }}
                                    >
                                        Preview
                                    </Button>
                                    <Button
                                        color="error"
                                        variant="outlined"
                                        startIcon={<Trash variant="Bold" size="20" color="#FF0000" />}
                                        onClick={() => setDeleteConfirmOpen(true)}
                                        sx={{ borderRadius: '12px' }}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            )}
                        </div>
                    </div>

                    <Box sx={{ mb: 4 }}>
                        {uploadProgress !== null && (
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="textSecondary" fontWeight="bold">กำลังอัปโหลดไฟล์...</Typography>
                                    <Typography variant="body2" color="textSecondary">{uploadProgress}%</Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={uploadProgress}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(212, 175, 55, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: '#D4AF37',
                                            borderRadius: 4
                                        }
                                    }}
                                />
                            </Box>
                        )}
                        <Tabs
                            value={activeTab}
                            onChange={(e, v) => setActiveTab(v)}
                            variant={isMobile ? "scrollable" : "standard"}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTab-root': { color: '#999', minHeight: '64px' },
                                '& .Mui-selected': { color: '#D4AF37 !important' },
                                '& .MuiTabs-indicator': { bgcolor: '#D4AF37' }
                            }}
                        >
                            <Tab label={isMobile ? "Info" : "Basic Info & Settings"} icon={<Heart size="18" color={activeTab === 0 ? "#D4AF37" : "#999"} />} iconPosition="start" />
                            <Tab label={isMobile ? "Design" : "Memories & Media"} icon={<ImageIcon size="18" color={activeTab === 1 ? "#D4AF37" : "#999"} />} iconPosition="start" />
                            <Tab label={isMobile ? "Products" : "Ordered Products"} icon={<Ticket size="18" color={activeTab === 2 ? "#D4AF37" : "#999"} />} iconPosition="start" />
                        </Tabs>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {activeTab === 0 && renderBasicInfo()}
                        {activeTab === 1 && renderDesign()}
                        {activeTab === 2 && renderOrderedProducts()}

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                            <Button variant="outlined" component={Link} href="/admin/valentine" sx={{ borderRadius: '50px' }}>Cancel</Button>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save2 variant="Bold" color="#fff" />}
                                sx={{ bgcolor: '#D4AF37', '&:hover': { bgcolor: '#B8860B' }, borderRadius: '50px', px: 4 }}
                            >
                                {loading ? "Saving..." : (isNew ? "Create Card" : "Save Changes")}
                            </Button>
                        </div>
                    </form>
                </Paper>

                <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                    <DialogTitle>Delete this card?</DialogTitle>
                    <DialogContent>This action cannot be undone.</DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                        <Button color="error" onClick={handleDelete}>Delete</Button>
                    </DialogActions>
                </Dialog>
            </AdminLayout>
        </LocalizationProvider>
    );
}
