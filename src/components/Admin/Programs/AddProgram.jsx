import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";



function AddProgram() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState("");
    const [caloriesBurned, setCaloriesBurned] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // Minimal form structure without complex workoutList for MVP, can add workoutList if needed later

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

            // Just sending an empty array as a JSON string if the backend expects it, or ignore for now.
            // formData.append("workoutList", JSON.stringify([])); 

            if (imageFile) {
                formData.append("image", imageFile); // 'image' is commonly used by multer
            }

            // Optional: specify token if backend requires Admin Auth.
            // Assuming the axios interceptor or standard setup handles it, or public for now.
            const res = await axios.post(`${API_BASE}/api/programs`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.status === 201 || res.status === 200) {
                Swal.fire("สำเร็จ", "เพิ่มโปรแกรมเรียบร้อยแล้ว", "success");
                navigate("/admin/programs");
            }
        } catch (error) {
            console.error("Error creating program:", error);
            Swal.fire("ข้อผิดพลาด", "ไม่สามารถเพิ่มโปรแกรมได้", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#333", margin: 0 }}>เพิ่มโปรแกรมใหม่</h2>
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
                        placeholder="เช่น สร้างกล้ามเนื้อหน้าอกเบื้องต้น"
                        required
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#4b5563" }}>รายละเอียด</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #d1d5db", minHeight: "100px" }}
                        placeholder="คำอธิบายโปรแกรม..."
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
                            placeholder="เช่น 30"
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
                            placeholder="เช่น 250"
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
                    {imagePreview && (
                        <div style={{ marginTop: "10px" }}>
                            <img src={imagePreview} alt="Preview" style={{ maxWidth: "200px", borderRadius: "8px" }} />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: "20px" }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "bold",
                            width: "100%"
                        }}
                    >
                        {loading ? "กำลังบันทึก..." : "บันทึกโปรแกรม"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddProgram;
