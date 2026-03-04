import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";



function ExerciseManagement() {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchExercises = async () => {
        try {
            const res = await axios.get(`/api/exercises`);
            setExercises(res.data);
        } catch (err) {
            console.error("Error fetching exercises:", err);
            Swal.fire("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลท่าออกกำลังกายได้", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: "ลบท่าออกกำลังกาย?",
            text: `คุณต้องการลบ "${name}" หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/exercises/${id}`);
                Swal.fire("สำเร็จ", "ลบท่าออกกำลังกายเรียบร้อยแล้ว", "success");
                fetchExercises();
            } catch (err) {
                console.error("Error deleting exercise:", err);
                Swal.fire("ข้อผิดพลาด", "ไม่สามารถลบท่าออกกำลังกายได้", "error");
            }
        }
    };

    if (loading) return <div>กำลังโหลดรายชื่อท่าออกกำลังกาย...</div>;

    return (
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#333", margin: 0 }}>จัดการท่าออกกำลังกาย</h2>
                <button
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                    onClick={() => navigate('/admin/exercises/add')}
                >
                    + เพิ่มท่าออกกำลังกายใหม่
                </button>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>ลำดับ</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>รูป/วิดีโอ</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>ชื่อท่า</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>ประเภท</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exercises.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>ไม่มีข้อมูลท่าออกกำลังกาย</td>
                            </tr>
                        ) : (
                            exercises.map((exercise, index) => (
                                <tr key={exercise._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "12px 15px" }}>{index + 1}</td>
                                    <td style={{ padding: "12px 15px" }}>
                                        {exercise.imageUrl ? (
                                            <img src={exercise.imageUrl.startsWith("http") ? exercise.imageUrl : exercise.imageUrl} alt="Exercise" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }} />
                                        ) : (
                                            <div style={{ width: "50px", height: "50px", backgroundColor: "#e5e7eb", borderRadius: "5px" }}></div>
                                        )}
                                    </td>
                                    <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{exercise.name || "ไม่มีชื่อ"}</td>
                                    <td style={{ padding: "12px 15px" }}>{exercise.type === "reps" ? "จำนวนครั้ง (Reps)" : "จับเวลา (Time)"}</td>
                                    <td style={{ padding: "12px 15px", display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() => navigate(`/admin/exercises/edit/${exercise._id}`)}
                                            style={{
                                                padding: "6px 12px",
                                                backgroundColor: "#f59e0b",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            แก้ไข
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exercise._id, exercise.name)}
                                            style={{
                                                padding: "6px 12px",
                                                backgroundColor: "#ef4444",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ExerciseManagement;
