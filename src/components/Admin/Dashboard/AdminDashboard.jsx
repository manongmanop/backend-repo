import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../../../firebase";
import { MdPeople, MdFitnessCenter, MdOutlineAdminPanelSettings, MdFormatListBulleted } from "react-icons/md";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';



function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalPrograms: 0, totalAdmins: 0, totalExercises: 0 });
    const [loading, setLoading] = useState(true);

    // New Data States
    const [monthlyUsers, setMonthlyUsers] = useState([]);
    const [newUsers, setNewUsers] = useState([]);
    const [popularPrograms, setPopularPrograms] = useState([]);
    const [activityLog, setActivityLog] = useState([]);

    const formatDate = (dateObj) => {
        if (!dateObj) return "-";
        try {
            const d = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
            return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("th-TH");
        } catch (e) {
            return "-";
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch users from Firestore
                const usersSnapshot = await getDocs(collection(db, "users"));
                // Fetch programs from MongoDB
                const programsRes = await axios.get(`/api/workout_programs`);
                // Fetch exercises from MongoDB
                const exercisesRes = await axios.get(`/api/exercises`);

                // Fetch admins from Firestore
                const adminSnapshot = await getDocs(collection(db, "admin"));

                setStats({
                    totalUsers: usersSnapshot.size || 0,
                    totalPrograms: programsRes.data.length || 0,
                    totalAdmins: adminSnapshot.size || 0,
                    totalExercises: exercisesRes.data.length || 0
                });

                // Process Users for Graph & List
                const usersList = [];
                usersSnapshot.forEach(doc => {
                    const data = doc.data();
                    usersList.push({ id: doc.id, ...data });
                });

                // 1. Sort users by newest
                usersList.sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                    return dateB - dateA;
                });

                setNewUsers(usersList.slice(0, 5));

                // 2. Group by Month for Graph (Last 6 months)
                const monthCounts = {};
                const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

                usersList.forEach(user => {
                    const d = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                    if (!isNaN(d.getTime())) {
                        const monthKey = d.getMonth();
                        monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
                    }
                });

                // Generate chart data for display (simply taking all months with data or generating a fixed set)
                const chartData = Object.keys(monthCounts).sort((a, b) => a - b).map(key => ({
                    name: monthNames[key],
                    users: monthCounts[key]
                }));
                setMonthlyUsers(chartData.length > 0 ? chartData : [{ name: "ไม่มีข้อมูล", users: 0 }]);

                // 3. Popular Programs (Just top 5 for now)
                const popular = [...programsRes.data].slice(0, 5);
                setPopularPrograms(popular);

                // 4. Activity Log (Simulating from recent new users + programs)
                // We'll interleave the newest users and programs chronologically if programs had dates, 
                // but since programs might not have createdAt, we just append activities.
                const activities = [];
                usersList.slice(0, 3).forEach(u => {
                    activities.push({
                        id: `u_${u.id}`,
                        title: `มีผู้ใช้งานใหม่สมัครสมาชิก: ${u.name || 'ไม่มีชื่อ'}`,
                        time: formatDate(u.createdAt),
                        type: 'user'
                    });
                });
                programsRes.data.slice(-2).reverse().forEach(p => {
                    activities.push({
                        id: `p_${p._id}`,
                        title: `มีการโปรแกรมใหม่เข้ามา: ${p.name || 'ไม่มีชื่อ'}`,
                        time: 'ล่าสุด',
                        type: 'program'
                    });
                });
                setActivityLog(activities);

            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>กำลังโหลดข้อมูลสรุปผล...</div>;

    return (
        <div>
            <h2 style={{ marginBottom: "20px", color: "#333", fontWeight: "bold" }}>Dashboard Overview</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>

                {/* Card 1: Users */}
                <div onClick={() => navigate('/admin/users')} style={{ cursor: "pointer", background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "transform 0.2s" }} className="admin-card">
                    <div>
                        <h4 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "1rem" }}>ผู้ใช้งานทั้งหมด</h4>
                        <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#1f2937" }}>{stats.totalUsers}</p>
                    </div>
                    <MdPeople style={{ fontSize: "3rem", color: "#bfdbfe" }} />
                </div>

                {/* Card 2: Programs */}
                <div onClick={() => navigate('/admin/programs')} style={{ cursor: "pointer", background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #10b981", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "transform 0.2s" }} className="admin-card">
                    <div>
                        <h4 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "1rem" }}>โปรแกรมทั้งหมด</h4>
                        <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#1f2937" }}>{stats.totalPrograms}</p>
                    </div>
                    <MdFitnessCenter style={{ fontSize: "3rem", color: "#a7f3d0" }} />
                </div>

                {/* Card 3: Exercises */}
                <div onClick={() => navigate('/admin/exercises')} style={{ cursor: "pointer", background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #8b5cf6", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "transform 0.2s" }} className="admin-card">
                    <div>
                        <h4 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "1rem" }}>ท่าออกกำลังกายรวม</h4>
                        <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#1f2937" }}>{stats.totalExercises}</p>
                    </div>
                    <MdFormatListBulleted style={{ fontSize: "3rem", color: "#ddd6fe" }} />
                </div>

                {/* Card 4: Admins */}
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #f59e0b", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "transform 0.2s" }} className="admin-card">
                    <div>
                        <h4 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "1rem" }}>ผู้ดูแลระบบ</h4>
                        <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#1f2937" }}>{stats.totalAdmins}</p>
                    </div>
                    <MdOutlineAdminPanelSettings style={{ fontSize: "3rem", color: "#fde68a" }} />
                </div>

            </div>

            {/* Bottom Section: Graph & Logs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "30px" }}>

                {/* Graph - Monthly Users */}
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", gridColumn: "1 / -1", minHeight: "350px" }}>
                    <h3 style={{ color: "#333", fontSize: "1.2rem", fontWeight: "bold", borderBottom: "2px solid #f3f4f6", paddingBottom: "10px", marginBottom: "20px" }}>กราฟสถิติผู้ใช้งานใหม่ (รายเดือน)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyUsers}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Bar dataKey="users" name="จำนวนผู้ใช้" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Latest Users */}
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ color: "#333", fontSize: "1.2rem", fontWeight: "bold", borderBottom: "2px solid #f3f4f6", paddingBottom: "10px", marginBottom: "20px" }}>ผู้ใช้ใหม่ล่าสุด</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {newUsers.length > 0 ? newUsers.map((u, i) => (
                            <li key={i} style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#bfdbfe", color: "#1e3a8a", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" }}>
                                        {u.name ? u.name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: "bold", color: "#374151" }}>{u.name || "ไม่มีชื่อ"}</p>
                                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{u.email}</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>{formatDate(u.createdAt)}</span>
                            </li>
                        )) : <li style={{ color: "#6b7280" }}>ยังไม่มีข้อมูลผู้ใช้</li>}
                    </ul>
                </div>

                {/* Popular Programs */}
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ color: "#333", fontSize: "1.2rem", fontWeight: "bold", borderBottom: "2px solid #f3f4f6", paddingBottom: "10px", marginBottom: "20px" }}>โปรแกรมล่าสุด</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {popularPrograms.length > 0 ? popularPrograms.map((p, i) => (
                            <li key={i} style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: "15px" }}>
                                {p.image ? (
                                    <img src={p.image.startsWith("http") ? p.image : p.image} alt={p.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />
                                ) : (
                                    <div style={{ width: "50px", height: "50px", backgroundColor: "#e5e7eb", borderRadius: "8px" }}></div>
                                )}
                                <div>
                                    <p style={{ margin: 0, fontWeight: "bold", color: "#374151" }}>{p.name || "ไม่มีชื่อโปรแกรม"}</p>
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{p.exercises?.length || 0} ท่า • {p.duration || 0} นาที</p>
                                </div>
                            </li>
                        )) : <li style={{ color: "#6b7280" }}>ยังไม่มีข้อมูลโปรแกรม</li>}
                    </ul>
                </div>

                {/* Activity Log */}
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ color: "#333", fontSize: "1.2rem", fontWeight: "bold", borderBottom: "2px solid #f3f4f6", paddingBottom: "10px", marginBottom: "20px" }}>Activity Log ล่าสุด</h3>
                    <div style={{ position: "relative", paddingLeft: "20px", borderLeft: "2px solid #e5e7eb" }}>
                        {activityLog.length > 0 ? activityLog.map((log, i) => (
                            <div key={i} style={{ position: "relative", marginBottom: "20px", paddingLeft: "15px" }}>
                                <div style={{
                                    position: "absolute",
                                    left: "-27px",
                                    top: "0",
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "50%",
                                    background: log.type === 'user' ? "#3b82f6" : "#10b981",
                                    border: "2px solid white"
                                }}></div>
                                <p style={{ margin: 0, color: "#374151", fontWeight: "500" }}>{log.title}</p>
                                <p style={{ margin: 0, fontSize: "0.85rem", color: "#9ca3af" }}>{log.time}</p>
                            </div>
                        )) : <p style={{ color: "#6b7280" }}>ยังไม่มีประวัติการเคลื่อนไหว</p>}
                    </div>
                </div>

            </div>

            <style>{`
                .admin-card:hover {
                    transform: translateY(-5px);
                }
            `}</style>
        </div>
    );
}

export default AdminDashboard;
