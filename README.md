# 📚 ShelfWise - Library Management System

A modern, full-stack library management system designed for college/university libraries. ShelfWise provides separate dashboards for students and administrators to efficiently manage book circulation, track overdue items, calculate fines, and maintain student records.

![Built with](https://img.shields.io/badge/Built%20with-React%20%7C%20Node.js%20%7C%20MongoDB-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [User Workflows](#-user-workflows)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [Testing Guide](#-testing-guide)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 👨‍🎓 Student Features
- **Three-Step Registration Process**
  - Account creation with name, email, phone, and password
  - Email verification via 6-digit OTP
  - Profile completion with academic details
  
- **Student Dashboard**
  - View total issued books, active loans, and overdue items
  - Track pending and cleared fines in real-time
  - Display student profile with ID, roll number, and department
  - Show semester and academic year information
  - Quick access to recent book history

- **Books Management**
  - View all issued books with detailed information
  - Search books by title, code, or author
  - Filter by status: All, Borrowed, Overdue, Returned
  - Color-coded status badges for quick identification
  - Automatic fine calculation based on overdue days

- **Profile Management**
  - Update personal information (name, phone)
  - Modify academic details (department, stream, semester, year)
  - Email protection (students cannot change email)
  - Real-time validation and error handling

### 👨‍💼 Admin Features
- **Comprehensive Dashboard**
  - View total issued books across all students
  - Track currently borrowed books
  - Monitor overdue items automatically
  - Display total cleared fines
  - Top 10 overdue students ranked by fine amount
  - Detailed student cards showing highest fine book

- **Book Issuing System**
  - Quick student search by roll number with autocomplete
  - Issue multiple books to a student in one transaction
  - Set custom due dates for each book
  - Pre-filled issue date (today's date)
  - Real-time validation of book entries
  - Automatic fine tracking after due date

- **Student Management**
  - View all registered and verified students
  - Search students by name, email, or roll number
  - Filter by department or status
  - View student borrowing history
  - Track individual student fines

- **Fine Management**
  - Configure fine amount (Rs. per unit)
  - Set fine interval (per day/week/month/year)
  - Automatic fine calculation based on overdue days
  - Apply manual fines to book records
  - Clear fines after payment
  - Track fine history

- **Book Returns**
  - Mark books as returned
  - Calculate final fine at return time
  - Automatic status updates
  - Return date tracking

### 🔐 Security & Authentication
- **JWT-Based Authentication**
  - 7-day token expiry
  - Secure token storage in localStorage
  - Automatic token refresh on page reload
  
- **Role-Based Access Control (RBAC)**
  - Two roles: `user` (student) and `admin`
  - Protected routes on frontend and backend
  - Middleware-based authorization
  - Route guards prevent unauthorized access

- **Password Security**
  - bcrypt hashing with 10 salt rounds
  - Passwords never stored in plain text
  - Passwords excluded from API responses

- **Email Verification**
  - OTP generation using otp-generator
  - 5-minute OTP expiry
  - Nodemailer integration for email delivery
  - Prevents unverified users from logging in

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.8 | UI library for building component-based interface |
| **React Router DOM** | 7.18.2 | Client-side routing and navigation |
| **Vite** | 8.2.0 | Fast build tool and dev server |
| **Tailwind CSS** | 4.3.3 | Utility-first CSS framework for styling |
| **Lucide React** | 1.31.0 | Beautiful icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | - | JavaScript runtime environment |
| **Express** | 5.2.1 | Web application framework |
| **MongoDB** | - | NoSQL database for data storage |
| **Mongoose** | 9.9.2 | MongoDB ODM for schema modeling |
| **JWT** | 9.0.3 | JSON Web Tokens for authentication |
| **bcryptjs** | 3.0.3 | Password hashing library |
| **Nodemailer** | 9.0.5 | Email sending for OTP verification |
| **otp-generator** | 4.0.1 | Generate secure OTP codes |
| **uuid** | 14.0.1 | Generate unique student IDs |
| **CORS** | 2.8.6 | Enable cross-origin resource sharing |
| **dotenv** | 17.4.2 | Environment variable management |

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Admin     │  │   Student    │  │    Public    │      │
│  │  Dashboard   │  │  Dashboard   │  │    Pages     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  React Router (Client-side routing)                          │
│  Protected Routes (Role-based access)                        │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js Server (Node.js)             │   │
│  │                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   │
│  │  │  Auth    │  │  Books   │  │ Students │         │   │
│  │  │  Routes  │  │  Routes  │  │  Routes  │         │   │
│  │  └──────────┘  └──────────┘  └──────────┘         │   │
│  │                                                      │   │
│  │  Middlewares:                                       │   │
│  │  • JWT Authentication                               │   │
│  │  • Role Authorization                               │   │
│  │  • CORS                                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    MongoDB                           │   │
│  │                                                      │   │
│  │  Collections:                                       │   │
│  │  • users (students + admins)                        │   │
│  │  • issues (book circulation records)                │   │
│  │  • finesettings (fine configuration)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Authentication Flow
```
User Input → Frontend Validation → API Request → 
Backend Validation → JWT Token Generation → 
Response with Token → Store in localStorage → 
Set Auth Context → Redirect to Dashboard
```

#### Book Issue Flow (Admin)
```
Search Student → Select Student → Add Book Details → 
Validate Inputs → API Request → Backend Validation → 
Create Issue Record → Update Fine Settings → 
Return Success → Refresh UI → Show Toast
```

#### Fine Calculation Flow
```
Fetch Issue Records → Calculate Days Overdue → 
Calculate Fine Units (based on interval) → 
Multiply by Fine Rate → Add Manual Fine → 
Subtract Cleared Fine → Display Total Fine
```

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (local or Atlas account) - [Download](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** package manager
- **Git** - [Download](https://git-scm.com/downloads)
- **Gmail account** (for OTP emails) with App Password enabled

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd Library-management-system
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# Windows
New-Item .env

# Mac/Linux
touch .env
```

#### 2.4 Configure Environment Variables

Add the following to `.env`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/library-management
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password

# Server Configuration
PORT=5000
```

#### 2.5 Setup Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Go to **App passwords**
4. Select **Mail** and your device
5. Copy the 16-digit password
6. Use this password in `EMAIL_PASS` (without spaces)

#### 2.6 Start Backend Server

```bash
npm start
```

Server will run on `http://localhost:5000`

**Expected Output:**
```
[nodemon] starting `node server.js`
Server running on port 5000
MongoDB Connected Successfully
```

### Step 3: Frontend Setup

#### 3.1 Open New Terminal & Navigate to Frontend

```bash
# From project root
cd frontend
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Start Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

**Expected Output:**
```
  VITE v8.2.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Create Admin Account

After both servers are running, create an admin account using PowerShell:

```powershell
$body = @{
    name = "Admin User"
    email = "admin@library.com"
    phone = "1234567890"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register-admin" -Method Post -Body $body -ContentType "application/json"
```

**Default Admin Credentials:**
- Email: `admin@library.com`
- Password: `admin123`

⚠️ **Important:** Change these credentials in production!

### Step 5: Verify Installation

1. Open browser and navigate to `http://localhost:5173`
2. You should see the ShelfWise landing page
3. Click **Login** and sign in with admin credentials
4. You should be redirected to the admin dashboard

---

## 📁 Project Structure

```
Library-management-system/
├── backend/                          # Backend Node.js application
│   ├── config/
│   │   └── db.js                     # MongoDB connection configuration
│   ├── controllers/
│   │   ├── authController.js         # Authentication & user management logic
│   │   ├── bookController.js         # Book issue/return/fine logic
│   │   └── studentController.js      # Student search logic
│   ├── middlewares/
│   │   └── authMiddleware.js         # JWT verification & role authorization
│   ├── models/
│   │   ├── User.js                   # User schema (students & admins)
│   │   ├── Issue.js                  # Book issue record schema
│   │   └── FineSetting.js            # Fine configuration schema
│   ├── routes/
│   │   ├── authRoutes.js             # Authentication endpoints
│   │   ├── bookRoutes.js             # Book management endpoints
│   │   └── studentRoutes.js          # Student search endpoints
│   ├── utils/
│   │   └── sendOTP.js                # Email OTP utility using Nodemailer
│   ├── .env                          # Environment variables (not in git)
│   ├── .gitignore                    # Files to ignore in git
│   ├── package.json                  # Backend dependencies
│   └── server.js                     # Express server entry point
│
├── frontend/                         # Frontend React application
│   ├── public/
│   │   ├── favicon.svg               # Browser tab icon
│   │   ├── icons.svg                 # SVG sprite icons
│   │   └── library-mark.svg          # Logo image
│   ├── src/
│   │   ├── admin/                    # Admin-only pages
│   │   │   ├── AdminLayout.jsx       # Admin wrapper with sidebar
│   │   │   ├── AdminDashboard.jsx    # Admin home with stats
│   │   │   ├── AdminBooksPage.jsx    # Issue books to students
│   │   │   ├── AdminUsersPage.jsx    # View all students
│   │   │   └── AdminFinesPage.jsx    # Configure fine settings
│   │   ├── assets/
│   │   │   ├── dummyStyles.jsx       # Tailwind CSS class mappings
│   │   │   └── library-mark.svg      # Logo file
│   │   ├── components/
│   │   │   └── Sidebar.jsx           # Reusable sidebar component
│   │   ├── data/
│   │   │   └── libraryData.js        # Static data (years, semesters)
│   │   ├── pages/                    # Public pages
│   │   │   ├── Homes.jsx             # Landing page
│   │   │   ├── Login.jsx             # Login page
│   │   │   └── Signup.jsx            # Student registration (3 steps)
│   │   ├── shared/                   # Shared utilities
│   │   │   ├── AuthContext.jsx       # Authentication state management
│   │   │   ├── LibraryContext.jsx    # Library data management
│   │   │   └── ProtectedRoute.jsx    # Route guard component
│   │   ├── user/                     # Student-only pages
│   │   │   ├── UserLayout.jsx        # Student wrapper with sidebar
│   │   │   ├── UserDashboardPage.jsx # Student home with stats
│   │   │   ├── UserBooksPage.jsx     # View issued books
│   │   │   ├── UserBookCard.jsx      # Book card component
│   │   │   └── UserEditProfilePage.jsx # Update profile
│   │   ├── App.jsx                   # Main app with routes
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global Tailwind CSS
│   ├── .gitignore                    # Files to ignore in git
│   ├── eslint.config.js              # ESLint configuration
│   ├── index.html                    # HTML template
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite configuration
│   └── tailwind.config.js            # Tailwind CSS configuration (if exists)
│
├── README.md                         # Project documentation (this file)
└── SUMMARY.md                        # Brief file/folder descriptions
```

---

## 🌐 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes (`/auth`)

| Method | Endpoint | Access | Description | Request Body | Response |
|--------|----------|--------|-------------|--------------|----------|
| POST | `/auth/register` | Public | Register new student (Step 1) | `{ name, email, phone, password }` | `{ message }` |
| POST | `/auth/verify-otp` | Public | Verify OTP (Step 2) | `{ email, otp }` | `{ message }` |
| POST | `/auth/complete-profile` | Public | Complete profile (Step 3) | `{ email, department, stream, semester, year, rollNo }` | `{ message }` |
| POST | `/auth/login` | Public | Login user | `{ email, password }` | `{ success, token, user }` |
| POST | `/auth/register-admin` | Public | Register admin | `{ name, email, phone, password }` | `{ success, message, user }` |
| GET | `/auth/me` | Protected | Get current user | - | `{ success, user }` |
| PUT | `/auth/update-profile` | Protected | Update user profile | `{ name, phone, department, stream, semester, academicYear, rollNo }` | `{ success, message, user }` |
| GET | `/auth/users` | Admin | Get all students | - | `{ success, users }` |

### Book Routes (`/books`)

| Method | Endpoint | Access | Description | Request Body | Response |
|--------|----------|--------|-------------|--------------|----------|
| POST | `/books/issue-manual` | Admin | Issue books to student | `{ studentDetails, books: [{ title, bookCode, dueDate }], fineRate, fineInterval }` | `{ success, message, count, issues }` |
| GET | `/books/issues` | Admin | Get all book issues | - | `{ success, issues }` |
| GET | `/books/issues/student` | Student | Get logged-in student issues | - | `{ success, issues }` |
| PUT | `/books/issues/:id/return` | Admin | Mark book as returned | - | `{ success, message }` |
| PUT | `/books/issues/:id/fine` | Admin | Apply manual fine | `{ amount }` | `{ success, message }` |
| PUT | `/books/issues/:id/clear-fine` | Admin | Clear fine | - | `{ success, message, issue }` |
| GET | `/books/fine-settings` | Protected | Get fine configuration | - | `{ success, settings }` |
| PUT | `/books/fine-settings` | Admin | Update fine configuration | `{ amount, interval }` | `{ success, message, settings }` |

### Student Routes (`/students`)

| Method | Endpoint | Access | Description | Query Params | Response |
|--------|----------|--------|-------------|--------------|----------|
| GET | `/students/search-by-roll` | Admin | Search students by roll | `roll=<rollNumber>` | `{ success, students }` |

### Request Headers

All protected routes require authentication header:
```
Authorization: Bearer <jwt_token>
```

### Error Responses

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 👤 User Workflows

### Student Registration Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: ACCOUNT                          │
│  User fills: Name, Email, Phone, Password                   │
│  ↓                                                           │
│  Frontend Validation (10-digit phone, email format)         │
│  ↓                                                           │
│  POST /api/auth/register                                    │
│  ↓                                                           │
│  Backend: Check existing email, Hash password               │
│  Generate OTP, Send email, Save to DB                       │
│  ↓                                                           │
│  OTP sent to email ✓                                        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    STEP 2: OTP VERIFICATION                 │
│  User enters 6-digit OTP from email                         │
│  ↓                                                           │
│  POST /api/auth/verify-otp                                  │
│  ↓                                                           │
│  Backend: Verify OTP matches and not expired               │
│  Set isVerified = true, Clear OTP                           │
│  ↓                                                           │
│  OTP verified ✓                                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    STEP 3: PROFILE                          │
│  User fills: Department, Stream, Semester, Year, Roll No   │
│  ↓                                                           │
│  POST /api/auth/complete-profile                            │
│  ↓                                                           │
│  Backend: Update user with academic info                    │
│  Set isProfileComplete = true                               │
│  ↓                                                           │
│  Registration Complete → Redirect to Login ✓                │
└─────────────────────────────────────────────────────────────┘
```

### Admin Book Issue Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Admin navigates to /admin/books                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Type student roll number in search box                  │
│     → Auto-search with 300ms debounce                       │
│     → GET /api/students/search-by-roll?roll=CS101           │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Select student from matching results                    │
│     → Form auto-fills student details                       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Add book entry (can add multiple)                       │
│     - Book Title (required)                                 │
│     - Book Code (required)                                  │
│     - Issue Date (auto-filled: today)                       │
│     - Due Date (required, min: today)                       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Click "Issue Manual Books"                              │
│     → POST /api/books/issue-manual                          │
│     → Backend creates Issue records                         │
│     → Applies current fine settings                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Success: "3 manual book(s) issued successfully!"        │
│     → Form resets                                           │
│     → Student can view books in their dashboard            │
└─────────────────────────────────────────────────────────────┘
```

### Fine Calculation Logic

```javascript
// Pseudo-code for fine calculation

function calculateFine(issue, fineRate, fineInterval) {
  // If book is returned or fine is cleared, no fine
  if (issue.returnedOn || issue.fineCleared) return 0;
  
  // Calculate overdue days
  const today = new Date();
  const dueDate = new Date(issue.dueDate);
  const overdueDays = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
  
  // If not overdue, no fine
  if (overdueDays <= 0) return 0;
  
  // Calculate fine units based on interval
  let fineUnits = 0;
  switch(fineInterval) {
    case 'day': fineUnits = overdueDays; break;
    case 'week': fineUnits = Math.ceil(overdueDays / 7); break;
    case 'month': fineUnits = Math.ceil(overdueDays / 30); break;
    case 'year': fineUnits = Math.ceil(overdueDays / 365); break;
  }
  
  // Calculate total fine
  const autoFine = fineUnits * fineRate;
  const totalFine = autoFine + (issue.manualFine || 0);
  
  return totalFine;
}
```

**Example:**
- Fine Settings: Rs. 10 per week
- Book issued: Jan 1, 2024
- Due date: Jan 15, 2024
- Today: Feb 5, 2024
- Overdue days: 21 days
- Fine units: Math.ceil(21 / 7) = 3 weeks
- Calculated fine: 3 × Rs. 10 = **Rs. 30**

---

## 🔐 Environment Variables

### Backend `.env` File

```env
# ============================================
# MongoDB Configuration
# ============================================
# Local MongoDB (Development)
MONGODB_URI=mongodb://localhost:27017/library-management

# MongoDB Atlas (Production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management?retryWrites=true&w=majority

# ============================================
# JWT Configuration
# ============================================
# Use a strong random string (minimum 32 characters)
# Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ============================================
# Email Configuration (Gmail)
# ============================================
# Your Gmail address
EMAIL_USER=your-email@gmail.com

# Gmail App Password (NOT your regular password)
# Get this from: https://myaccount.google.com/apppasswords
# Format: 16 characters without spaces
EMAIL_PASS=abcd efgh ijkl mnop

# ============================================
# Server Configuration
# ============================================
# Port for backend server (default: 5000)
PORT=5000

# Node environment (development/production)
NODE_ENV=development
```

### Frontend Configuration

No environment variables needed for frontend in development. For production:

**Create `.env` in frontend directory:**
```env
# API Base URL
VITE_API_URL=https://your-backend-domain.com/api
```

**Update API calls in frontend:**
```javascript
// src/shared/AuthContext.jsx or LibraryContext.jsx
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

---

## 🗄️ Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, indexed),
  phone: String (required, 10 digits),
  password: String (required, bcrypt hashed),
  otp: String (optional, 6 digits),
  otpExpiry: Date (optional),
  isVerified: Boolean (default: false),
  department: String (optional),
  stream: String (optional),
  semester: String (optional),
  year: String (optional),
  rollNo: String (optional),
  isProfileComplete: Boolean (default: false),
  studentId: String (unique, sparse, format: ST-XXXXXXXX),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `email`: unique, for login and uniqueness checks
- `studentId`: unique, sparse (only for students)

### Issue Collection

```javascript
{
  _id: ObjectId,
  source: String (default: 'manual'),
  bookCode: String (required),
  title: String (required),
  userEmail: String (required, indexed),
  userName: String (required),
  issuedOn: String (YYYY-MM-DD format),
  dueDate: String (YYYY-MM-DD format),
  returnedOn: String (YYYY-MM-DD format, optional),
  fineRate: Number (default: 10),
  fineInterval: String (enum: ['day', 'week', 'month', 'year'], default: 'day'),
  manualFine: Number (default: 0),
  fineCleared: Boolean (default: false),
  clearedFineAmount: Number (default: 0),
  department: String,
  stream: String,
  year: String,
  semester: String,
  rollNumber: String,
  studentId: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userEmail`: for filtering student-specific issues
- `createdAt`: for sorting by newest first

### FineSetting Collection

```javascript
{
  _id: ObjectId,
  amount: Number (required, default: 10),
  interval: String (enum: ['day', 'week', 'month', 'year'], default: 'day'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Note:** Only one document exists in this collection (singleton pattern)

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### 1. Student Registration Flow
- [ ] Navigate to `/signup`
- [ ] Fill in valid details (10-digit phone required)
- [ ] Submit → Should show "OTP sent" message
- [ ] Check email for 6-digit OTP
- [ ] Enter OTP → Should show "OTP verified"
- [ ] Fill academic details (department, stream, etc.)
- [ ] Submit → Should redirect to login with pre-filled email

#### 2. Student Login & Dashboard
- [ ] Login with student credentials
- [ ] Should redirect to `/user/dashboard`
- [ ] Verify profile card shows correct details
- [ ] Verify semester card displays academic info
- [ ] Check if stats cards show correct counts
- [ ] Verify "Recent Books" section (may be empty initially)

#### 3. Admin Login & Dashboard
- [ ] Login with admin credentials
- [ ] Should redirect to `/admin/dashboard`
- [ ] Verify stat cards show totals
- [ ] Check "Overdue Attention List" (may be empty)
- [ ] Verify "Most Fine Imposed" badge on top student

#### 4. Issue Books (Admin)
- [ ] Navigate to `/admin/books`
- [ ] Type roll number → Should show matching students
- [ ] Select a student → Form auto-fills
- [ ] Add book: title, code, due date
- [ ] Add multiple books using "+ Add Book"
- [ ] Submit → Should show success message
- [ ] Verify issue count increased in admin dashboard

#### 5. Student Views Books
- [ ] Login as the student who was issued books
- [ ] Navigate to `/user/books`
- [ ] Should see issued books with cards
- [ ] Verify status badges (Borrowed/Overdue/Returned)
- [ ] Test search by book name
- [ ] Test filter by status
- [ ] Check if fine shows for overdue books

#### 6. Fine Management (Admin)
- [ ] Navigate to `/admin/fines`
- [ ] Click edit icon
- [ ] Change fine amount (e.g., Rs. 20)
- [ ] Change interval (e.g., per week)
- [ ] Save → Should show success toast
- [ ] Refresh page → Settings should persist
- [ ] Verify new fines calculated with new settings

#### 7. Profile Update (Student)
- [ ] Navigate to `/user/profile`
- [ ] Click edit icon
- [ ] Update name, phone, or department
- [ ] Verify email is disabled (cannot be changed)
- [ ] Save → Should show success message
- [ ] Cancel → Should revert changes

#### 8. Return Book (Admin)
- [ ] (This feature needs admin return UI - currently backend only)
- [ ] Test via API: PUT `/api/books/issues/:id/return`

### Testing with Different Scenarios

#### Scenario 1: Overdue Fine Calculation
1. Set fine to Rs. 10 per day
2. Issue book with due date 3 days ago
3. Check student dashboard → Should show Rs. 30 fine
4. Change fine to Rs. 5 per week
5. Refresh → Fine should recalculate

#### Scenario 2: Multiple Books to One Student
1. Search and select student
2. Click "Add Book" 3 times
3. Fill all book details with different due dates
4. Submit → Should create 3 issue records
5. Student should see all 3 books

#### Scenario 3: Email Case Sensitivity
1. Register student with email: `Test@Example.com`
2. Try login with: `test@example.com`
3. Should work (emails normalized to lowercase)

### API Testing with Thunder Client / Postman

**Collection Import:**
```json
{
  "name": "ShelfWise API",
  "requests": [
    {
      "name": "Register Student",
      "method": "POST",
      "url": "http://localhost:5000/api/auth/register",
      "body": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "password": "password123"
      }
    }
    // Add more requests...
  ]
}
```

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. "Access Forbidden" Error

**Problem:** Getting 403 error when accessing admin routes

**Cause:** You're logged in as a student, but trying to access admin-only routes

**Solution:**
- Logout current session
- Login with admin credentials
- Or create admin account if not exists:
  ```powershell
  $body = '{"name":"Admin","email":"admin@library.com","phone":"1234567890","password":"admin123"}' | ConvertFrom-Json | ConvertTo-Json
  Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register-admin" -Method Post -Body $body -ContentType "application/json"
  ```

#### 2. OTP Not Received

**Problem:** OTP email not arriving in inbox

**Solutions:**
1. Check spam/junk folder
2. Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
3. Ensure App Password (not regular password) is used
4. Check backend console logs for OTP (development only):
   ```
   OTP for user@example.com: 123456
   ```
5. Test email configuration:
   ```javascript
   // In backend/utils/sendOTP.js, temporarily log the OTP
   console.log('Generated OTP:', otp);
   ```

#### 3. MongoDB Connection Error

**Problem:** `MongooseError: connect ECONNREFUSED`

**Solutions:**
1. **Ensure MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Verify connection string in `.env`:**
   ```env
   # Local
   MONGODB_URI=mongodb://localhost:27017/library-management
   
   # Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library-management
   ```

3. **Test connection:**
   ```bash
   mongosh "mongodb://localhost:27017/library-management"
   ```

#### 4. "Token is not valid" Error

**Problem:** Getting 401 Unauthorized error on protected routes

**Solutions:**
1. Clear browser localStorage:
   ```javascript
   // In browser console
   localStorage.clear();
   ```
2. Login again to get fresh token
3. Check JWT_SECRET matches in backend
4. Verify token expiry (7 days by default)

#### 5. Fine Not Calculating

**Problem:** Fine shows Rs. 0 for overdue books

**Causes & Solutions:**
1. **Book not overdue yet**
   - Verify due date is in the past
   - Check current date vs due date

2. **Fine cleared**
   - Check `fineCleared` flag in database
   - Use "Apply Fine" button to re-add

3. **Fine settings not loaded**
   - Verify fine settings exist in database
   - Check GET `/api/books/fine-settings`
   - Create default settings:
     ```javascript
     // In MongoDB
     db.finesettings.insertOne({ amount: 10, interval: "day" })
     ```

#### 6. Student Not Found When Issuing Books

**Problem:** Search by roll number returns empty

**Causes & Solutions:**
1. **Student not registered yet**
   - Create student account first
   - Complete all 3 registration steps

2. **Roll number mismatch**
   - Check exact roll number in database
   - Search is case-sensitive
   - Verify `rollNo` field is filled

3. **Student not verified**
   - Ensure `isVerified: true`
   - Complete OTP verification step

#### 7. Frontend Not Connecting to Backend

**Problem:** API calls fail with CORS or network error

**Solutions:**
1. **Verify backend is running on port 5000:**
   ```bash
   netstat -ano | findstr :5000
   ```

2. **Check CORS configuration in `server.js`:**
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   ```

3. **Verify API URL in frontend:**
   ```javascript
   // Should be http://localhost:5000/api
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

#### 8. Books Not Showing in Student Dashboard

**Problem:** Issued books not visible on `/user/books`

**Solutions:**
1. **Verify books were issued to correct student**
   - Check `userEmail` in Issue collection
   - Match with logged-in student email

2. **Check email case sensitivity**
   - All emails normalized to lowercase
   - Verify in MongoDB:
     ```javascript
     db.issues.find({ userEmail: "student@example.com" })
     ```

3. **Verify issue records exist**
   - Check admin dashboard → total issued count
   - Query database directly

4. **Check filter settings**
   - Reset status filter to "All"
   - Clear search box

---

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

#### Using Railway

1. **Create Railway Account:** [railway.app](https://railway.app)

2. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

3. **Login and Initialize:**
   ```bash
   railway login
   cd backend
   railway init
   ```

4. **Set Environment Variables:**
   ```bash
   railway variables set MONGODB_URI="mongodb+srv://..."
   railway variables set JWT_SECRET="your-secret"
   railway variables set EMAIL_USER="your-email@gmail.com"
   railway variables set EMAIL_PASS="app-password"
   railway variables set PORT="5000"
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Get Deployment URL:**
   ```bash
   railway domain
   # Example: https://library-backend.railway.app
   ```

#### Using Render

1. **Create account on [render.com](https://render.com)**

2. **Create New Web Service:**
   - Connect GitHub repository
   - Select `backend` folder
   - Build command: `npm install`
   - Start command: `npm start`

3. **Add Environment Variables:**
   - Go to Environment tab
   - Add all variables from `.env`

4. **Deploy automatically on git push**

### Frontend Deployment (Vercel/Netlify)

#### Using Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

3. **Create `.env` file:**
   ```env
   VITE_API_URL=https://your-backend-domain.railway.app/api
   ```

4. **Update API calls:**
   ```javascript
   // src/shared/AuthContext.jsx
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

6. **Access URL:**
   ```
   https://library-management.vercel.app
   ```

#### Using Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set environment variables in Netlify dashboard**

### Production Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Enable MongoDB authentication
- [ ] Set secure CORS origins (not wildcard `*`)
- [ ] Enable HTTPS for both frontend and backend
- [ ] Use proper email service (not personal Gmail)
- [ ] Add rate limiting to API endpoints
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Enable MongoDB backups
- [ ] Add monitoring (Uptime Robot, Pingdom)
- [ ] Configure proper environment variables
- [ ] Test all features in production
- [ ] Update README with production URLs

### Environment Variables in Production

**Backend (Railway/Render):**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/library-management
JWT_SECRET=<generate-32-char-random-string>
EMAIL_USER=library@yourdomain.com
EMAIL_PASS=<app-password>
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

**Frontend (Vercel/Netlify):**
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 🔮 Future Enhancements

### Phase 1: Core Features
- [ ] **Book Catalog Management**
  - Add, edit, delete books in catalog
  - ISBN integration for book data
  - Book categories and genres
  - Book availability tracking
  
- [ ] **Advanced Search & Filters**
  - Search books by author, ISBN, category
  - Filter by availability, genre
  - Sort by popularity, newest additions

- [ ] **Email Notifications**
  - Return reminder 2 days before due date
  - Overdue notification on due date
  - Fine payment reminders
  - Book reservation notifications

### Phase 2: Enhanced User Experience
- [ ] **Book Reservation System**
  - Students can reserve available books
  - Queue system for popular books
  - Automatic notification when book available

- [ ] **QR Code Integration**
  - Generate QR for each book
  - Scan QR for quick issue/return
  - Student ID cards with QR codes

- [ ] **Dashboard Analytics**
  - Charts for borrowing trends
  - Popular books statistics
  - Department-wise analytics
  - Monthly/yearly reports

- [ ] **Mobile Responsive Design**
  - Optimize UI for mobile devices
  - Touch-friendly interactions
  - Progressive Web App (PWA)

### Phase 3: Advanced Features
- [ ] **Payment Integration**
  - Online fine payment (Stripe/Razorpay)
  - Payment history tracking
  - Receipt generation

- [ ] **Multi-Branch Support**
  - Support multiple library branches
  - Inter-branch book transfer
  - Branch-specific catalogs

- [ ] **Recommendation System**
  - Suggest books based on borrowing history
  - Popular in your department
  - Machine learning recommendations

- [ ] **Admin Reports**
  - Export to PDF/Excel
  - Custom date range reports
  - Fine collection reports
  - Student activity reports

### Phase 4: Integration & Automation
- [ ] **Google Books API Integration**
  - Auto-fill book details from ISBN
  - Book cover images
  - Author information

- [ ] **SMS Notifications**
  - Twilio integration for reminders
  - OTP via SMS option

- [ ] **Automated Fine Calculation**
  - Background cron job for daily fine updates
  - Grace period configuration
  - Escalating fine rates

- [ ] **Barcode Scanner Support**
  - Webcam-based barcode scanning
  - USB barcode scanner integration
  - Quick check-in/check-out

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- **JavaScript:** Use ES6+ features
- **React:** Functional components with hooks
- **Naming:** camelCase for variables, PascalCase for components
- **Comments:** Explain "why", not "what"
- **Commits:** Use conventional commit messages
  ```
  feat: add book reservation system
  fix: resolve fine calculation bug
  docs: update API documentation
  style: format code with prettier
  refactor: simplify user authentication
  ```

### Bug Reports

When reporting bugs, include:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 ShelfWise

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support & Contact

For questions, issues, or suggestions:

- **GitHub Issues:** [Create an issue](https://github.com/yourusername/Library-management-system/issues)
- **Email:** support@shelfwise.com (if applicable)
- **Documentation:** Read this README and SUMMARY.md

---

## 🙏 Acknowledgments

- **React Team** - For the amazing UI library
- **Express Team** - For the robust backend framework
- **MongoDB** - For the flexible database
- **Lucide Icons** - For the beautiful icon library
- **Tailwind CSS** - For the utility-first CSS framework
- **Vercel** - For easy frontend deployment
- **Railway** - For seamless backend hosting

---

## 📊 Project Stats

- **Frontend Components:** 20+
- **Backend Endpoints:** 14+
- **Database Collections:** 3
- **Lines of Code:** ~8,000+
- **Dependencies:** 25+
- **Development Time:** [Your development time]

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**

**Version:** 1.0.0  
**Last Updated:** [Current Date]

---

## Quick Links

- [Installation](#-installation--setup)
- [API Docs](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [File Structure](./SUMMARY.md)
