import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function EditExercise() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form fields
    const [name, setName] = useState("");
    const [type, setType] = useState("reps");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [caloriesBurned, setCaloriesBurned] = useState("");
    const [value, setValue] = useState("");
    const [muscles, setMuscles] = useState("");

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [existingImageUrl, setExistingImageUrl] = useState("");

    const [videoFile, setVideoFile] = useState(null);
    const [existingVideoUrl, setExistingVideoUrl] = useState("");

    useEffect(() => {
        const fetchExercise = async () => {
            try {
                const res = await axios.get(`/api/exercises/${id}`);
                const data = res.data;
                setName(data.name || "");
                setType(data.type || "reps");
                setDescription(data.description || "");
                setDuration(data.duration || "");
                setCaloriesBurned(data.caloriesBurned || "");
                setValue(data.value || "");
                setMuscles(Array.isArray(data.muscles) ? data.muscles.join(", ") : "");

                setExistingImageUrl(data.imageUrl || data.image || "");
                setExistingVideoUrl(data.videoUrl || data.video || "");
            } catch (error) {
                console.error("Error fetching exercise:", error);
                Swal.fire("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลท่าออกกำลังกายได้", "error");
                navigate("/admin/exercises");
            } finally {
                setFetching(false);
            }
        };
        fetchExercise();
    }, [id, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || (!duration && !value)) {
            Swal.fire("ข้อผิดพลาด", "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", "error");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("type", type);
            formData.append("description", description);
            formData.append("duration", duration || 60);
            formData.append("caloriesBurned", caloriesBurned || 0);
            formData.append("value", value || 0);

            const musclesArray = muscles.split(",").map(m => m.trim()).filter(Boolean);
            formData.append("muscles", JSON.stringify(musclesArray));

            if (imageFile) formData.append("image", imageFile);
            if (videoFile) formData.append("video", videoFile);

            const res = await axios.put(`/api/exercises/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.status === 200) {
                Swal.fire("สำเร็จ", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
                navigate("/admin/exercises");
            }
        } catch (error) {
            console.error("Error updating exercise:", error);
            Swal.fire("ข้อผิดพลาด", "ไม่สามารถแก้ไขท่าออกกำลังกายได้", "error");
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
                <h2 style={{ color: "#333", margin: 0 }}>แก้ไขท่าออกกำลังกาย</h2>
                <button
                    onClick={() => navigate(-1)}
                    style={{ padding: "8px 16px", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                    กลับ
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>ชื่อท่า *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                        required
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>ประเภท *</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                    >
                        <option value="reps">จำนวนครั้ง (Reps)</option>
                        <option value="time">จับเวลา (Time)</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>รายละเอียด (วิธีเล่น)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db", minHeight: "100px" }}
                        required
                    />
                </div>

                <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>
                            {type === "reps" ? "จำนวนครั้งเป้าหมาย *" : "ระยะเวลาที่ใช้ต่อเซ็ต (วินาที) *"}
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>ระยะเวลาเล่นรวม (duration: วินาที)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>แคลอรี่ที่เผาผลาญ (kcal)</label>
                        <input
                            type="number"
                            value={caloriesBurned}
                            onChange={(e) => setCaloriesBurned(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>กล้ามเนื้อเป้าหมาย (คั่นด้วยลูกน้ำ)</label>
                        <input
                            type="text"
                            value={muscles}
                            onChange={(e) => setMuscles(e.target.value)}
                            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                            placeholder="อก, ไหล่, หลังแขน"
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>เปลี่ยนรูปภาพสาธิตท่า</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                    />
                    <div style={{ marginTop: "10px", display: "flex", gap: "20px" }}>
                        {imagePreview ? (
                            <div>
                                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 5px 0" }}>รูปภาพใหม่:</p>
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

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>เปลี่ยนวิดีโอสาธิตท่า</label>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                    />
                    <div style={{ marginTop: "10px" }}>
                        {existingVideoUrl && !videoFile && (
                            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 5px 0" }}>ไฟล์วิดีโอเดิม: {existingVideoUrl.split("/").pop()}</p>
                        )}
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
                        {loading ? "กำลังปรับปรุง..." : "ปรับปรุงท่าออกกำลังกาย"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditExercise;
