import React, { useEffect, useState } from "react";
import axios from "axios";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase";
import { MdPeople, MdFitnessCenter, MdOutlineAdminPanelSettings, MdFormatListBulleted } from "react-icons/md";



function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, totalPrograms: 0, totalAdmins: 0, totalExercises: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch users from MongoDB (or Firebase depending on your structure)
                const usersRes = await axios.get(`/api/users`);
                const programsRes = await axios.get(`/api/workout_programs`);

                // Fetch admins from Firestore
                const adminSnapshot = await getDocs(collection(db, "admin"));

                let exercisesCount = 0;
                if (programsRes.data && Array.isArray(programsRes.data)) {
                    programsRes.data.forEach(p => {
                        exercisesCount += (p.exercises?.length || p.workoutList?.length || 0);
                    });
                }

                setStats({
                    totalUsers: usersRes.data.length || 0,
                    totalPrograms: programsRes.data.length || 0,
                    totalAdmins: adminSnapshot.size || 0,
                    totalExercises: exercisesCount
                });
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
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "transform 0.2s" }} className="admin-card">
                    <div>
                        <h4 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "1rem" }}>ผู้ใช้งานทั้งหมด</h4>
                        <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#1f2937" }}>{stats.totalUsers}</p>
                    </div>
                    <MdPeople style={{ fontSize: "3rem", color: "#bfdbfe" }} />
                </div>

                {/* Card 2: Programs */}
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #10b981", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "transform 0.2s" }} className="admin-card">
                    <div>
                        <h4 style={{ margin: "0 0 10px 0", color: "#6b7280", fontSize: "1rem" }}>โปรแกรมทั้งหมด</h4>
                        <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#1f2937" }}>{stats.totalPrograms}</p>
                    </div>
                    <MdFitnessCenter style={{ fontSize: "3rem", color: "#a7f3d0" }} />
                </div>

                {/* Card 3: Exercises */}
                <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", borderLeft: "5px solid #8b5cf6", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "transform 0.2s" }} className="admin-card">
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

            <style>{`
                .admin-card:hover {
                    transform: translateY(-5px);
                }
            `}</style>
        </div>
    );
}

export default AdminDashboard;
