import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";
import { db } from "../../../../firebase";
import { MdArrowBack, MdAccessTime, MdLocalFireDepartment, MdFitnessCenter } from "react-icons/md";

function UserProgress() {
    const { uid } = useParams();
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [summary, setSummary] = useState({ totalWorkouts: 0, totalTime: 0, totalCalories: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatTime = (seconds) => {
        if (!seconds) return "0 นาที";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h} ชม. ${m} นาที`;
        return `${m} นาที`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("th-TH", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const fetchUserProgress = async () => {
            try {
                // 1. Fetch User Info
                const userDoc = await getDoc(doc(db, "users", uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                } else {
                    setUserData({ name: "ไม่พบข้อมูลผู้ใช้" });
                }

                // 2. Fetch Summary
                const summaryQuery = query(collection(db, "user_summary"), where("userId", "==", uid));
                const summarySnapshot = await getDocs(summaryQuery);
                if (!summarySnapshot.empty) {
                    setSummary(summarySnapshot.docs[0].data());
                }

                // 3. Fetch History
                const historyQuery = query(collection(db, "user_history"), where("userId", "==", uid), orderBy("date", "desc"));
                const historySnapshot = await getDocs(historyQuery);
                const historyList = [];
                historySnapshot.forEach((doc) => {
                    historyList.push({ id: doc.id, ...doc.data() });
                });
                setHistory(historyList);

            } catch (error) {
                console.error("Error fetching user progress:", error);
            } finally {
                setLoading(false);
            }
        };

        if (uid) {
            fetchUserProgress();
        }
    }, [uid]);

    if (loading) return <div>กำลังโหลดข้อมูลความคืบหน้า...</div>;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <button
                onClick={() => navigate(-1)}
                style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: "#3b82f6", fontWeight: "bold", marginBottom: "20px" }}
            >
                <MdArrowBack size={20} /> กลับไปหน้าจัดการผู้ใช้งาน
            </button>

            <h2 style={{ color: "#1f2937", marginBottom: "10px" }}>
                ความคืบหน้าของ: <span style={{ color: "#4f46e5" }}>{userData?.name || "ไม่ระบุ"}</span>
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "30px" }}>อีเมล: {userData?.email || "ไม่ระบุ"}</p>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #10b981", display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ background: "#d1fae5", pdding: "10px", borderRadius: "50%", width: "50px", height: "50px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <MdFitnessCenter size={25} color="#059669" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>จำนวนครั้งที่เล่นจบ</p>
                        <h3 style={{ margin: 0, color: "#1f2937" }}>{summary.totalWorkouts || 0} ครั้ง</h3>
                    </div>
                </div>

                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #3b82f6", display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ background: "#dbeafe", padding: "10px", borderRadius: "50%", width: "50px", height: "50px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <MdAccessTime size={25} color="#2563eb" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>เวลาทั้งหมด</p>
                        <h3 style={{ margin: 0, color: "#1f2937" }}>{formatTime(summary.totalTime)}</h3>
                    </div>
                </div>

                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #ef4444", display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ background: "#fee2e2", pdding: "10px", borderRadius: "50%", width: "50px", height: "50px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <MdLocalFireDepartment size={25} color="#dc2626" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>เผาผลาญทั้งหมด</p>
                        <h3 style={{ margin: 0, color: "#1f2937" }}>{summary.totalCalories ? summary.totalCalories.toFixed(0) : 0} kcal</h3>
                    </div>
                </div>
            </div>

            {/* History List */}
            <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: "#333", fontSize: "1.2rem", fontWeight: "bold", borderBottom: "2px solid #f3f4f6", paddingBottom: "10px", marginBottom: "20px" }}>ประวัติการออกกำลังกาย</h3>

                {history.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                    <th style={{ padding: "12px", color: "#4b5563" }}>วันที่ / เวลา</th>
                                    <th style={{ padding: "12px", color: "#4b5563" }}>โปรแกรม</th>
                                    <th style={{ padding: "12px", color: "#4b5563" }}>เวลาที่ใช้</th>
                                    <th style={{ padding: "12px", color: "#4b5563" }}>เผาผลาญ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((record) => (
                                    <tr key={record.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "12px", color: "#4b5563" }}>{formatDate(record.date)}</td>
                                        <td style={{ padding: "12px", fontWeight: "bold", color: "#1f2937" }}>{record.programName || "Unknown"}</td>
                                        <td style={{ padding: "12px", color: "#4b5563" }}>{formatTime(record.duration)}</td>
                                        <td style={{ padding: "12px", color: "#ef4444", fontWeight: "500" }}>{record.calories ? record.calories.toFixed(0) : 0} kcal</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: "30px", textAlign: "center", color: "#6b7280" }}>
                        <p>ผู้ใช้นี้ยังไม่มีประวัติการออกกำลังกาย</p>
                    </div>
                )}
            </div>

        </div>
    );
}

export default UserProgress;
