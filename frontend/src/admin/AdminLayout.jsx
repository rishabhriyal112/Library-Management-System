import React from 'react';
import { adminLayoutStyles as s } from '../assets/dummyStyles';
import logoSrc from "../assets/library-mark.svg";
import Sidebar from '../components/Sidebar';
import { useAuth } from '../shared/AuthContext';
import { Outlet, useNavigate } from 'react-router-dom';


const navItems = [
  {
    label: "Admin Dashboard",
    description: "Library office analytics",
    href: "/admin/dashboard",
    match: "/admin/dashboard",
    icon: "dashboard",
  },
  {
    label: "Books Page",
    description: "Inventory, fines, and returns",
    href: "/admin/books",
    match: "/admin/books",
    icon: "books",
  },
  {
    label: "Users Page",
    description: "Student-wise issue history",
    href: "/admin/users",
    match: "/admin/users",
    icon: "users",
  },
  {
    label: "Fine Page",
    description: "Overdue fine rules and settings",
    href: "/admin/fines",
    match: "/admin/fines",
    icon: "alerts",
  },
];


function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const footerItems = currentUser
    ? [
      {
        label: "Logout",
        icon: "login",
        kind: "primary",
        action: () => {
          logout();
          navigate("/login");
        },
      },
    ]
    : [];

  return (
    <div className={s.layoutContainer}>
      <Sidebar title="Library Office"
        subtitle="College admin controls"
        badge="Admin section"
        navItems={navItems}
        footerItems={footerItems}
        accent="admin"
        logoSrc={logoSrc} 
      />

      <main className={s.mainContent}>
        <div className={s.innerContainer}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
