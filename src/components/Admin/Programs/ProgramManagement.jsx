import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";



function ProgramManagement() {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");

    const categories = ["ทั้งหมด", "โปรแกรมช่วงบน", "โปรแกรมช่วงล่าง", "โปรแกรมหน้าท้อง", "ลดไขมัน", "เพิ่มกล้าม", "กระชับก้น & ขา"];

    const fetchPrograms = async () => {
        try {
            const res = await axios.get(`/api/workout_programs`);
            setPrograms(res.data);
        } catch (err) {
            console.error("Error fetching programs:", err);
            Swal.fire("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลโปรแกรมได้", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: "ลบโปรแกรม?",
            text: `คุณต้องการลบโปรแกรม "${name}" หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/workout_programs/${id}`);
                Swal.fire("สำเร็จ", "ลบโปรแกรมเรียบร้อยแล้ว", "success");
                fetchPrograms();
            } catch (err) {
                console.error("Error deleting program:", err);
                Swal.fire("ข้อผิดพลาด", "ไม่สามารถลบโปรแกรมได้", "error");
            }
        }
    };

    const filteredPrograms = programs.filter(program => {
        const matchesSearch = (program.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "ทั้งหมด" || program.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div>กำลังโหลดรายชื่อโปรแกรม...</div>;

    return (
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ color: "#333", margin: 0 }}>จัดการโปรแกรม</h2>
                <button
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold"
                    }}
                    onClick={() => navigate('/admin/programs/add')}
                >
                    + เพิ่มโปรแกรมใหม่
                </button>
            </div>

            {/* แถบค้นหา และ ตัวกรอง Tag */}
            <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="🔍 ค้นหาชื่อโปรแกรม..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: "10px 15px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        flex: "1",
                        minWidth: "250px",
                        outline: "none"
                    }}
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                        padding: "10px 15px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        outline: "none",
                        backgroundColor: "white",
                        cursor: "pointer",
                        minWidth: "200px"
                    }}
                >
                    {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>ลำดับ</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>รูปโปรแกรม</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>ชื่อโปรแกรม</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>หมวดหมู่ (Tag)</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>จำนวนท่า</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPrograms.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>ไม่พบข้อมูลโปรแกรมที่ค้นหา</td>
                            </tr>
                        ) : (
                            filteredPrograms.map((program, index) => (
                                <tr key={program._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "12px 15px" }}>{index + 1}</td>
                                    <td style={{ padding: "12px 15px" }}>
                                        {program.image ? (
                                            <img src={program.image.startsWith("http") ? program.image : program.image} alt="Program" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }} />
                                        ) : (
                                            <div style={{ width: "50px", height: "50px", backgroundColor: "#e5e7eb", borderRadius: "5px" }}></div>
                                        )}
                                    </td>
                                    <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{program.name || "ไม่มีชื่อ"}</td>
                                    <td style={{ padding: "12px 15px" }}>
                                        {program.category ? (
                                            <span style={{
                                                backgroundColor: "#e0e7ff",
                                                color: "#4f46e5",
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                fontSize: "0.85em",
                                                fontWeight: "bold",
                                                display: "inline-block"
                                            }}>
                                                {program.category}
                                            </span>
                                        ) : (
                                            <span style={{ color: "#9ca3af", fontStyle: "italic" }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "12px 15px" }}>{program.exercises ? program.exercises.length : (program.workoutList ? program.workoutList.length : "0")} ท่า</td>
                                    <td style={{ padding: "12px 15px", display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() => navigate(`/admin/programs/edit/${program._id}`)}
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
                                            onClick={() => handleDelete(program._id, program.name)}
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

export default ProgramManagement;
