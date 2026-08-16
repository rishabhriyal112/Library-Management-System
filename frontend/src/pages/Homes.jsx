import Sidebar from '../components/Sidebar';
import { BookCopy, ChartNoAxesCombined, Bell, ShieldCheck, UserRound, BookMarked, Users, ArrowRight } from "lucide-react";
import { useAuth } from '../shared/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { homeStyles as s } from '../assets/dummyStyles';
import { createElement } from 'react';

const iconMap = {
    dashboard: ChartNoAxesCombined,
    books: BookCopy,
    alerts: Bell,
    admin: ShieldCheck,
    users: UserRound
}

const navItems = [
    {
        label: "Student Dashboard",
        description: "Open issued books, fines, and profile details",
        href: "/user/dashboard",
        match: "/user",
        icon: "dashboard",
    },
    {
        label: "Admin Dashboard",
        description: "Manage student issues, returns, and fines",
        href: "/admin/dashboard",
        match: "/admin",
        icon: "admin",
    },
];

const features = [
    {
        icon: BookMarked,
        title: "Manual book issuing",
        text: "Track manual book issues, due dates, returns, and dynamic fine calculations in one workflow.",
    },
    {
        icon: Users,
        title: "Student self-service",
        text: "Students can review borrowed books, pending fines, academic details, and recent activity quickly.",
    },
    {
        icon: ShieldCheck,
        title: "Admin desk controls",
        text: "Library staff can manage student records, manual book issues, overdue items, and fine settings from the admin area.",
    },
];



function Homes() {

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
                    navigate("/");
                },
            },
        ]
        : [
            { label: "Login", href: "/login", icon: "login", kind: "primary" },
            {
                label: "Sign Up",
                href: "/signup",
                icon: "signup",
                kind: "secondary",
            },
        ];

    return (
        <div className={s.layoutContainer}>
            <Sidebar title="ShelfWise" subtitle="Library management portal" badge="Beautiful theme" navItems={navItems} footerItems={footerItems} />

            <main className={s.mainContent}>
                <div className={s.innerContainer}>
                    <section className={s.heroSection}>
                        <div className={s.heroGrid}>
                            <div>
                                <span className={s.heroBadge}>Library Management Website</span>
                                <h1 className={s.heroTitle}>
                                    Manage Students, books, returns, and fines in one library dashboard
                                </h1>
                                <p className={s.heroText}>
                                    This Library Management Portal gives students a focused borrowing dashboard and gives admins a practical workspace for manual circulation, user records and overdue tracking.
                                </p>

                                <div className={s.heroButtons}>
                                    {currentUser ? (
                                        <Link to={
                                            currentUser.role === "admin" ?
                                                "/admin/dashboard" : "/user/dashboard"
                                        } className={s.heroButtonPrimary} style={{color:'white'}}>
                                            Go To Dashboard
                                            <ArrowRight size={16} />
                                        </Link>
                                    ) : (
                                        <>
                                            <Link to="/signup" className={s.heroButtonPrimary} style={{color : "white"}}>
                                                Create Account
                                                <ArrowRight size={16} />
                                            </Link>

                                            <Link to="/login" className={s.heroButtonSecondary}>
                                                Login Now
                                                <ArrowRight size={16} />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className={s.infoCard}>
                                    <p className={s.infoCardLabel}>Library Workflow</p>
                                    <p className={s.infoCardTitle}>
                                        Separate student and admin dashboards built for daily library operations.
                                    </p>

                                    <p className={s.infoCardText}>
                                        Monitor issue activity, keep profile records updated, and track overdue follow-up without leaving
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={s.featuresGrid}>
                        {features.map(({ icon, title, text }) => {
                            return (
                                <article key={title} className={s.featureCard}>
                                    <span className={s.featureIconWrapper}>
                                        {createElement(icon, { size: 22 })}
                                    </span>

                                    <h2 className={s.featureTitle}>{title}</h2>
                                    <p className={s.featureText}>{text}</p>
                                </article>
                            )
                        })}
                    </section>
                </div>
            </main>
        </div>


    )
}

export default Homes
