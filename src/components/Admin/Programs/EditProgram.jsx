import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";



function EditProgram() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [caloriesBurned, setCaloriesBurned] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    // To keep track of the existing image URL to show if no new image is selected
    const [existingImageUrl, setExistingImageUrl] = useState("");

    useEffect(() => {
        const fetchProgram = async () => {
            try {
                const res = await axios.get(`/api/programs/${id}`);
                const data = res.data;
                setName(data.name || "");
                setDescription(data.description || "");
                setDuration(data.duration || "");
                setCaloriesBurned(data.caloriesBurned || "");
                setExistingImageUrl(data.imageUrl || data.image || "");
            } catch (error) {
                console.error("Error fetching program:", error);
                Swal.fire("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลโปรแกรมได้", "error");
                navigate("/admin/programs");
            } finally {
                setFetching(false);
            }
        };
        fetchProgram();
    }, [id, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !description || !duration) {
            Swal.fire("ข้อผิดพลาด", "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", "error");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("duration", duration);
            formData.append("caloriesBurned", caloriesBurned || 0);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const res = await axios.put(`/api/programs/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.status === 200) {
                Swal.fire("สำเร็จ", "แก้ไขข้อมูลโปรแกรมเรียบร้อยแล้ว", "success");
                navigate("/admin/programs");
            }
        } catch (error) {
            console.error("Error updating program:", error);
            Swal.fire("ข้อผิดพลาด", "ไม่สามารถแก้ไขโปรแกรมได้", "error");
        } finally {
            setLoading(false);
        }
    };

    const getMediaDisplayUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return url;
    };

    if (fetching) return <div style={{ padding: "20px" }}>กำลังโหลดข้อมูล...</div>;

    return (
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#333", margin: 0 }}>แก้ไขโปรแกรม</h2>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: "8px 16px", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                    กลับ
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>ชื่อโปรแกรม *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>รายละเอียด</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db", minHeight: "100px" }}
                        required
                    />
                </div>

                <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>ระยะเวลา (นาที) *</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>แคลอรี่ที่เผาผลาญ (kcal)</label>
                        <input
                            type="number"
                            value={caloriesBurned}
                            onChange={(e) => setCaloriesBurned(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>รูปภาพปกโปรแกรม</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                    />

                    <div style={{ marginTop: "10px", display: "flex", gap: "20px" }}>
                        {imagePreview ? (
                            <div>
                                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 5px 0" }}>รูปภาพใหม่ที่จะอัปโหลด:</p>
                                <img src={imagePreview} alt="New Preview" style={{ maxWidth: "200px", borderRadius: "8px" }} />
                            </div>
                        ) : existingImageUrl ? (
                            <div>
                                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 5px 0" }}>รูปภาพเดิม:</p>
                                <img src={getMediaDisplayUrl(existingImageUrl)} alt="Existing" style={{ maxWidth: "200px", borderRadius: "8px" }} />
                            </div>
                        ) : null}
                    </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#f59e0b",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "bold",
                            width: "100%"
                        }}
                    >
                        {loading ? "กำลังปรับปรุง..." : "ปรับปรุงโปรแกรม"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditProgram;
