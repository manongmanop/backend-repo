import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../../App.css";
import "./AdminLayout.scss";

function AdminLayout() {
    return (
        <div className="admin-layout">
            {/* Sidebar เฉพาะของ Admin */}
            <AdminSidebar />

            {/* พื้นที่ของ Content แตกต่างกันไปตาม Route ที่เรียก (เช่น Dashboard, Users, Programs) */}
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;
