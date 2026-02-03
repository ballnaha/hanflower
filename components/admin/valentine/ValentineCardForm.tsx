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
    Select,
    MenuItem,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    useTheme,
    useMediaQuery,
    Tooltip,
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
    campaignName: string;
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

    const { control, handleSubmit, reset, watch, setValue, register, getValues, formState: { errors } } = useForm<ValentineCardFormData>({
        defaultValues: initialData || {
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
            campaignName: "Valentine's",
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
        fetchProducts();
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

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

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const url = isNew ? "/api/admin/valentine" : `/api/admin/valentine/${initialData.id}`;
            const method = isNew ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                router.push("/admin/valentine");
                router.refresh();
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Failed to save");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while saving");
        } finally {
            setLoading(false);
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

        const uploadPromises = acceptedFiles.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('slug', currentSlug);

            try {
                const res = await fetch('/api/upload/valentine', { method: 'POST', body: formData });
                if (res.ok) {
                    const data = await res.json();
                    return {
                        type: file.type.startsWith('video') ? 'video' : 'image',
                        url: data.url,
                        caption: file.name
                    };
                }
                return null;
            } catch (error) { return null; }
        });

        const results = await Promise.all(uploadPromises);
        const successfulMemories = results.filter(m => m !== null);
        if (successfulMemories.length > 0) appendMemory(successfulMemories);
    }, [appendMemory, getValues]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop: onDropMemory, accept: { 'image/*': [], 'video/*': [] } });

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
                <Controller name="campaignName" control={control} render={({ field }) => (
                    <TextField {...field} label="Campaign Name (e.g. Valentine's)" fullWidth margin="normal" />
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
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#FFF8F0', border: '1px dashed #D4AF37', borderRadius: '16px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Ticket size="48" variant="Bulk" color="#D4AF37" />
                </Box>
                <Typography variant="h6" color="#D4AF37" gutterBottom fontWeight="bold">พร้อมสำหรับเพิ่มรูปภาพและวิดีโอ</Typography>
                <Typography color="textSecondary" sx={{ mb: 3 }}>ระบบจะใช้ URL Slug: <strong>/valentine/{watch("slug")}</strong> ในการเก็บไฟล์</Typography>
            </Box>
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
            <Box className="p-6 border border-dashed border-gray-300 rounded-xl text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors" {...getRootProps()}>
                <input {...getInputProps()} />
                <Typography color="textSecondary" className="flex items-center justify-center gap-2"><ImageIcon size="24" color="#999" /> Drag & Drop Images/Videos here or Click to Upload</Typography>
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
                            <SortableMemoryItem key={memory.id || `memory-${index}`} memory={memory} index={index} onRemove={removeMemory} onChangeCaption={handleUpdateMemoryCaption} />
                        ))}
                    </SortableContext>
                </DndContext>
            </Box>
        </Box>
    );

    return (
        <AdminLayout title={isNew ? "Create New Card" : "Edit Valentine Card"}>
            <Paper className="p-6 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <div className="flex items-center gap-4">
                        <IconButton component={Link} href="/admin/valentine"><ArrowLeft color="#9CA3AF" /></IconButton>
                        <Typography variant="h5" className="font-bold text-gray-800">{isNew ? "New Valentine Card" : "Edit Card"}</Typography>
                    </div>
                    {!isNew && (
                        <Button color="error" startIcon={<Trash variant="Bold" />} onClick={() => setDeleteConfirmOpen(true)}>Delete</Button>
                    )}
                </div>

                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant={isMobile ? "scrollable" : "standard"} sx={{ mb: 4, '& .MuiTab-root': { color: '#999', minHeight: '64px' }, '& .Mui-selected': { color: '#D4AF37 !important' }, '& .MuiTabs-indicator': { bgcolor: '#D4AF37' } }}>
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

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                        <Button variant="outlined" component={Link} href="/admin/valentine" sx={{ borderRadius: '50px' }}>Cancel</Button>
                        <Button variant="contained" type="submit" disabled={loading} startIcon={<Save2 variant="Bold" color="#fff" />} sx={{ bgcolor: '#D4AF37', '&:hover': { bgcolor: '#B8860B' }, borderRadius: '50px', px: 4 }}>
                            {loading ? <CircularProgress size={24} /> : "Save Card"}
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
    );
}
