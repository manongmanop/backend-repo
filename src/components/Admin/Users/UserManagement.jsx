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

    const formatDate = (dateObj) => {
        if (!dateObj) return "-";
        try {
            const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
            return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("th-TH");
        } catch (e) {
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

    const toggleAdmin = async (firebaseUid, isCurrentlyAdmin) => {
        if (!firebaseUid) {
            Swal.fire("ข้อผิดพลาด", "ไม่พบข้อมูลรหัสผู้ใช้ Firebase สำหรับบัญชีนี้", "error");
            return;
        }

        const actionText = isCurrentlyAdmin ? "ปลดออกจากผู้ดูแลระบบ" : "แต่งตั้งเป็นผู้ดูแลระบบ";
        const result = await Swal.fire({
            title: "ยืนยันการเปลี่ยนแปลง?",
            text: `คุณต้องการ${actionText}ใช่หรือไม่?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "อัปเดต",
            cancelButtonText: "ยกเลิก"
        });

        if (result.isConfirmed) {
            try {
                const docRef = doc(db, "admin", firebaseUid);
                if (isCurrentlyAdmin) {
                    await deleteDoc(docRef);
                } else {
                    await setDoc(docRef, { role: "admin" });
                }

                // Update local state
                const newAdminUids = new Set(adminUids);
                if (isCurrentlyAdmin) {
                    newAdminUids.delete(firebaseUid);
                } else {
                    newAdminUids.add(firebaseUid);
                }
                setAdminUids(newAdminUids);

                Swal.fire("สำเร็จ", "อัปเดตสถานะเรียบร้อยแล้ว", "success");
            } catch (error) {
                console.error("Error updating admin status:", error);
                Swal.fire("ข้อผิดพลาด", "ไม่สามารถอัปเดตสถานะได้", "error");
            }
        }
    };

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

    const handleSuspend = async (uid, isSuspended) => {
        const action = isSuspended ? "ปลดระงับ" : "ระงับ";
        const result = await Swal.fire({
            title: `ยืนยันการ${action}`,
            text: `คุณต้องการ${action}บัญชีผู้ใช้นี้หรือไม่?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: isSuspended ? "#10b981" : "#f59e0b",
            cancelButtonColor: "#6b7280",
            confirmButtonText: `ยืนยัน`,
            cancelButtonText: "ยกเลิก"
        });

        if (result.isConfirmed) {
            try {
                await updateDoc(doc(db, "users", uid), {
                    isSuspended: !isSuspended
                });
                Swal.fire("สำเร็จ", `ทำการ${action}บัญชีเรียบร้อยแล้ว`, "success");
                fetchData();
            } catch (err) {
                console.error("Error updating user status:", err);
                Swal.fire("ข้อผิดพลาด", "ไม่สามารถเปลี่ยนสถานะผู้ใช้งานได้", "error");
            }
        }
    };

    if (loading) return <div>กำลังโหลดรายชื่อ...</div>;

    return (
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            <h2 style={{ marginBottom: "20px", color: "#333" }}>จัดการผู้ใช้งาน</h2>

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
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>ไม่มีข้อมูลผู้ใช้งาน</td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "12px 15px" }}>{index + 1}</td>
                                    <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{user.name || "ไม่มีชื่อ"}</td>
                                    <td style={{ padding: "12px 15px" }}>{user.email || "-"}</td>
                                    <td style={{ padding: "12px 15px" }}>
                                        {user.isSuspended ? (
                                            <span style={{ padding: "4px 8px", backgroundColor: "#fee2e2", color: "#ef4444", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "bold" }}>ระงับการใช้งาน</span>
                                        ) : adminUids.has(user.firebaseUid) ? (
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
                                            onClick={() => handleSuspend(user.firebaseUid, user.isSuspended)}
                                            style={{
                                                padding: "6px 12px",
                                                backgroundColor: user.isSuspended ? "#10b981" : "#f59e0b",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                minWidth: "100px"
                                            }}
                                        >
                                            {user.isSuspended ? "ปลดระงับ" : "ระงับ"}
                                        </button>
                                        {!user.isSuspended && (
                                            <button
                                                onClick={() => toggleAdmin(user.firebaseUid, adminUids.has(user.firebaseUid))}
                                                style={{
                                                    padding: "6px 12px",
                                                    backgroundColor: adminUids.has(user.firebaseUid) ? "#6b7280" : "#10b981",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    minWidth: "120px"
                                                }}
                                            >
                                                {adminUids.has(user.firebaseUid) ? "ปลด Admin" : "ตั้งเป็น Admin"}
                                            </button>
                                        )}
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
