import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, deleteDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase";



function UserManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [adminUids, setAdminUids] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ทั้งหมด");

    const formatDate = (dateObj) => {
        if (!dateObj) return "-";

        try {
            let d;
            // 1) Is it a Firebase Timestamp (has .toDate())?
            if (dateObj.toDate && typeof dateObj.toDate === 'function') {
                d = dateObj.toDate();
            }
            // 2) Is it already a Date object?
            else if (dateObj instanceof Date) {
                d = dateObj;
            }
            // 3) Is it a String? (e.g. from manual Firestore entry "March 4, 2026 at 8:46:29 PM UTC+7")
            else if (typeof dateObj === 'string') {
                // Remove the " at " which breaks JS Date parsing
                const cleanString = dateObj.replace(" at ", " ");
                d = new Date(cleanString);
            }
            // 4) Fallback (e.g. numbers / timestamps)
            else {
                d = new Date(dateObj);
            }

            // Return "-" if parsing failed
            if (isNaN(d.getTime())) return "-";

            // Format successfully
            return d.toLocaleDateString("th-TH");

        } catch (e) {
            console.error("Error formatting date:", e);
            return "-";
        }
    };

    const fetchData = async () => {
        try {
            const [usersSnapshot, adminsSnapshot] = await Promise.all([
                getDocs(collection(db, "users")),
                getDocs(collection(db, "admin"))
            ]);

            const usersData = [];
            usersSnapshot.forEach(doc => {
                usersData.push({ _id: doc.id, firebaseUid: doc.id, ...doc.data() });
            });
            setUsers(usersData);

            const adminSet = new Set();
            adminsSnapshot.forEach(doc => {
                if (doc.data().role === 'admin') {
                    adminSet.add(doc.id);
                }
            });
            setAdminUids(adminSet);
        } catch (err) {
            console.error("Error fetching data:", err);
            Swal.fire("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id, uid) => {
        const result = await Swal.fire({
            title: "แน่ใจหรือไม่?",
            text: "บัญชีผู้ใช้นี้จะถูกลบถาวร รวมถึงข้อมูลประวัติการออกกำลังกาย",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก"
        });

        if (result.isConfirmed) {
            try {
                await deleteDoc(doc(db, "users", uid));
                Swal.fire("ลบสำเร็จ", "ผู้ใช้ถูกลบออกจากระบบฐานข้อมูลแล้ว", "success");
                fetchData(); // Refresh list
            } catch (err) {
                console.error("Error deleting user:", err);
                Swal.fire("ข้อผิดพลาด", "ไม่สามารถลบผู้ใช้งานได้", "error");
            }
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (filterStatus === "แอดมิน (Admin)") {
            matchesStatus = adminUids.has(user.firebaseUid);
        } else if (filterStatus === "ผู้ใช้งานทั่วไป") {
            matchesStatus = !adminUids.has(user.firebaseUid);
        }

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div>กำลังโหลดรายชื่อ...</div>;

    return (
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ color: "#333", marginBottom: "20px" }}>จัดการผู้ใช้งาน</h2>

            {/* แถบค้นหา และ ตัวกรอง สถานะ */}
            <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                <input
                    type="text"
                    placeholder="🔍 ค้นหาชื่อ หรือ อีเมล..."
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
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
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
                    <option value="ทั้งหมด">ผู้ใช้ทั้งหมด</option>
                    <option value="แอดมิน (Admin)">แอดมิน (Admin)</option>
                    <option value="ผู้ใช้งานทั่วไป">ผู้ใช้งานทั่วไป</option>
                </select>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>ลำดับ</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>ชื่อ</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>อีเมล</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>สถานะ</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>วันที่สมัคร</th>
                            <th style={{ padding: "12px 15px", color: "#4b5563" }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>ไม่พบข้อมูลผู้ใช้ที่ค้นหา</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, index) => (
                                <tr key={user._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "12px 15px" }}>{index + 1}</td>
                                    <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{user.name || "ไม่มีชื่อ"}</td>
                                    <td style={{ padding: "12px 15px" }}>{user.email || "-"}</td>
                                    <td style={{ padding: "12px 15px" }}>
                                        {adminUids.has(user.firebaseUid) ? (
                                            <span style={{ padding: "4px 8px", backgroundColor: "#fef3c7", color: "#d97706", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "bold" }}>Admin</span>
                                        ) : (
                                            <span style={{ padding: "4px 8px", backgroundColor: "#e0e7ff", color: "#4338ca", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "bold" }}>User</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "12px 15px" }}>{formatDate(user.createdAt)}</td>
                                    <td style={{ padding: "12px 15px", display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() => navigate(`/admin/users/progress/${user.firebaseUid}`)}
                                            style={{
                                                padding: "6px 12px",
                                                backgroundColor: "#3b82f6",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                minWidth: "100px"
                                            }}
                                        >
                                            ดู Progress
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id, user.firebaseUid)}
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

export default UserManagement;
