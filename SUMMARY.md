# 📋 Project Summary - ShelfWise Library Management System

This document provides a detailed summary of every file and folder in the project, organized by purpose and functionality. Use this as a reference to understand what each file does and where to find specific features.

---

## 📁 Project Overview

**Project Name:** ShelfWise - Library Management System  
**Type:** Full-Stack Web Application  
**Architecture:** MERN Stack (MongoDB, Express, React, Node.js)  
**Purpose:** College/University library management with student and admin dashboards

---

## 🗂️ Root Directory Structure

```
Library-management-system/
├── backend/           # Node.js + Express + MongoDB backend
├── frontend/          # React + Vite frontend
├── README.md          # Comprehensive project documentation
└── SUMMARY.md         # This file - detailed file/folder descriptions
```

---

## 🔧 Backend (`/backend`)

### Purpose
Server-side application handling authentication, database operations, business logic, and API endpoints.

### Structure Overview

```
backend/
├── config/            # Configuration files
├── controllers/       # Business logic and request handlers
├── middlewares/       # Express middleware functions
├── models/           # Mongoose database schemas
├── routes/           # API endpoint definitions
├── utils/            # Utility functions and helpers
├── .env              # Environment variables (not in git)
├── .gitignore        # Files to exclude from git
├── package.json      # Node.js dependencies and scripts
├── package-lock.json # Locked dependency versions
└── server.js         # Express server entry point
```

---

### 📂 `/backend/config`

#### `db.js`
**Purpose:** MongoDB database connection configuration  
**What it does:**
- Establishes connection to MongoDB using Mongoose
- Handles connection success/failure events
- Exports connection function for use in server.js
- Uses MONGODB_URI from environment variables

**Key Functions:**
```javascript
connectDB() // Connects to MongoDB
```

**Dependencies:** mongoose, dotenv

**When it runs:** Called once when server starts in server.js

---

### 📂 `/backend/controllers`

Contains business logic for handling API requests.

#### `authController.js`
**Purpose:** Authentication and user management logic  
**Functions:** 8 core functions

**1. `registerUser(req, res)`**
- **What:** Step 1 of student registration
- **Process:**
  - Validates name, email, phone (10 digits), password
  - Checks if email already exists
  - Generates 6-digit OTP using otp-generator
  - Sends OTP to email via sendOTP utility
  - Hashes password with bcrypt (10 salt rounds)
  - Creates unique studentId (format: ST-XXXXXXXX)
  - Saves user with isVerified: false
- **Request Body:** `{ name, email, phone, password }`
- **Response:** Success message with OTP sent confirmation

**2. `verifyOtp(req, res)`**
- **What:** Step 2 of registration - OTP verification
- **Process:**
  - Finds user by email
  - Checks if OTP matches stored OTP
  - Verifies OTP hasn't expired (5 minute limit)
  - Sets isVerified: true
  - Clears OTP and otpExpiry from database
- **Request Body:** `{ email, otp }`
- **Response:** OTP verified success message

**3. `completeProfile(req, res)`**
- **What:** Step 3 of registration - academic details
- **Process:**
  - Validates user is verified
  - Updates department, stream, semester, year, rollNo
  - Sets isProfileComplete: true
- **Request Body:** `{ email, department, stream, semester, year, rollNo }`
- **Response:** Profile completed message

**4. `LoginUser(req, res)`**
- **What:** User login (students and admins)
- **Process:**
  - Finds user by email
  - Verifies password using bcrypt.compare()
  - Checks if user is verified
  - Generates JWT token with 7-day expiry
  - Token payload: { id: user._id, role: user.role }
- **Request Body:** `{ email, password }`
- **Response:** `{ success: true, token, user }`

**5. `getProfile(req, res)`**
- **What:** Get logged-in user's profile
- **Process:**
  - Extracts user from req.user (set by authMiddleware)
  - Excludes password from response
- **Authentication:** Required (JWT token)
- **Response:** User object without password

**6. `updateProfile(req, res)`**
- **What:** Update user profile
- **Process:**
  - Prevents students from changing email
  - Validates 10-digit phone number
  - Updates name, phone, department, stream, semester, year, rollNo
  - Returns updated user object
- **Authentication:** Required
- **Request Body:** `{ name, phone, department, stream, semester, academicYear, rollNo }`
- **Response:** Updated user object

**7. `getUsers(req, res)`**
- **What:** Get all verified students (admin only)
- **Process:**
  - Finds users with role: "user"
  - Filters isVerified: true and isProfileComplete: true
  - Excludes passwords
- **Authentication:** Admin only
- **Response:** Array of student objects

**8. `registerAdmin(req, res)`**
- **What:** Create admin account
- **Process:**
  - Validates required fields
  - Checks email uniqueness
  - Hashes password
  - Creates user with role: "admin", isVerified: true
- **Request Body:** `{ name, email, phone, password }`
- **Response:** Admin user object

---

#### `bookContoller.js` (typo in filename - should be bookController.js)
**Purpose:** Book issue, return, and fine management  
**Functions:** 8 core functions + 5 helper functions

**Helper Functions:**

**1. `getLocalIsoDate(value)`**
- Converts date to YYYY-MM-DD format
- Used for consistent date storage
- Example: `2024-08-16`

**2. `getStartOfDay(value)`**
- Returns start of day (00:00:00)
- Used in date comparisons

**3. `getDiffInDays(targetDateString)`**
- Calculates difference between today and target date
- Returns positive for future, negative for past
- Used to calculate overdue days

**4. `getOverdueUnits(overdueDays, interval)`**
- Converts overdue days to fine units
- Intervals: day (1), week (7), month (30), year (365)
- Uses Math.ceil() to round up partial units
- Example: 8 overdue days with "week" interval = 2 weeks

**5. `calculateFine(issue, fineRate, fineInterval)`**
- Main fine calculation logic
- Returns 0 if book returned or fine cleared
- Formula: (overdueUnits × fineRate) + manualFine
- Example: 15 days overdue, Rs. 10/week = 3 weeks × 10 = Rs. 30

**Controller Functions:**

**1. `issueManualBooks(req, res)`**
- **What:** Issue multiple books to a student
- **Process:**
  - Validates books array is not empty
  - Finds student by rollNo
  - Filters books with title, bookCode, and dueDate
  - Creates Issue records for each valid book
  - Applies current fine settings
  - Returns count of issued books
- **Authentication:** Admin only
- **Request Body:** 
  ```javascript
  {
    studentDetails: { rollNumber, department, stream, ... },
    books: [{ title, bookCode, dueDate }],
    fineRate: 10,
    fineInterval: "day"
  }
  ```
- **Response:** `{ success, message, count, issues }`

**2. `getIssues(req, res)`**
- **What:** Get all book issues (admin view)
- **Process:**
  - Fetches all Issue documents
  - Sorts by createdAt descending (newest first)
- **Authentication:** Admin only
- **Response:** Array of all issues

**3. `getStudentIssues(req, res)`**
- **What:** Get logged-in student's issues
- **Process:**
  - Filters by req.user.email (normalized to lowercase)
  - Sorts by createdAt descending
- **Authentication:** Student only
- **Response:** Array of student's issues

**4. `returnBook(req, res)`**
- **What:** Mark book as returned
- **Process:**
  - Finds issue by ID from URL params
  - Checks if already returned
  - Sets returnedOn to today's date
- **Authentication:** Admin only
- **Request:** PUT /issues/:id/return
- **Response:** Success message

**5. `applyFine(req, res)`**
- **What:** Apply manual fine to issue
- **Process:**
  - Validates fine amount is a number
  - Updates issue.manualFine
  - Sets fineCleared: false if amount > 0
- **Authentication:** Admin only
- **Request Body:** `{ amount }`
- **Response:** Success message

**6. `clearFine(req, res)`**
- **What:** Clear fine after payment
- **Process:**
  - Calculates final fine before clearing
  - Sets manualFine: 0
  - Sets fineCleared: true
  - Stores amount in clearedFineAmount
- **Authentication:** Admin only
- **Response:** Updated issue object

**7. `getFineSettings(req, res)`**
- **What:** Get current fine configuration
- **Process:**
  - Finds single FineSetting document
  - Creates default (Rs. 10/day) if none exists
- **Authentication:** Required
- **Response:** `{ success, settings }`

**8. `updateFineSettings(req, res)`**
- **What:** Update fine configuration
- **Process:**
  - Updates or creates FineSetting document
  - Only one document exists (singleton pattern)
  - Returns updated settings
- **Authentication:** Admin only
- **Request Body:** `{ amount, interval }`
- **Response:** `{ success, message, settings }`

---

#### `studentController.js`
**Purpose:** Student search functionality  
**Functions:** 1 function

**1. `searchStudentsByRoll(req, res)`**
- **What:** Search students by roll number
- **Process:**
  - Gets roll number from query params: ?roll=CS101
  - Case-insensitive partial match search
  - Regex: `/roll/i` (i = case-insensitive)
  - Filters verified and profile-complete students
  - Excludes passwords from results
- **Authentication:** Admin only
- **Request:** GET /students/search-by-roll?roll=CS101
- **Response:** `{ success, students: [...] }`

**Use Case:** Admin types in search box → debounced search → returns matching students

---

### 📂 `/backend/middlewares`

#### `authMiddleware.js`
**Purpose:** JWT authentication and role-based authorization  
**Functions:** 2 middleware functions

**1. `authenticateToken(req, res, next)`**
- **What:** Verify JWT token
- **Process:**
  1. Extracts token from Authorization header
  2. Format: "Bearer <token>"
  3. Verifies token with JWT_SECRET
  4. Finds user by decoded ID
  5. Attaches user to req.user
  6. Calls next() if valid
- **Errors:**
  - 400: No token provided
  - 401: Invalid or expired token
  - 404: User not found
- **Usage:** Applied to all protected routes

**2. `authorizeRoles(...roles)`**
- **What:** Check if user has required role
- **Process:**
  - Takes array of allowed roles: ["admin"]
  - Checks if req.user.role matches any allowed role
  - Returns 403 Forbidden if no match
- **Usage:** 
  ```javascript
  router.get('/admin-only', authenticateToken, authorizeRoles('admin'), handler)
  ```

**Middleware Chain Example:**
```
Request → authenticateToken (verify JWT) → 
authorizeRoles('admin') (check role) → 
Controller Function
```

---

### 📂 `/backend/models`

Mongoose schemas defining database structure.

#### `User.js`
**Purpose:** User (student + admin) schema  
**Collections:** `users`

**Schema Fields:**
```javascript
{
  name: String (required)                    // Full name
  email: String (required, unique)           // Unique email, indexed
  phone: String (required)                   // 10-digit phone number
  password: String (required)                // Bcrypt hashed password
  otp: String                                // 6-digit OTP code
  otpExpiry: Date                           // OTP expiration time (5 min)
  isVerified: Boolean (default: false)       // Email verified via OTP
  department: String                         // Academic department
  stream: String                            // Academic stream
  semester: String                          // Current semester
  year: String                              // Academic year (1st-4th)
  rollNo: String                            // Student roll number
  isProfileComplete: Boolean (default: false) // Profile filled
  studentId: String (unique, sparse)        // Format: ST-XXXXXXXX
  role: String (enum: ['user','admin'])     // user = student
  createdAt: Date (auto)                    // Account creation time
  updatedAt: Date (auto)                    // Last update time
}
```

**Indexes:**
- `email`: Unique index for login and registration
- `studentId`: Unique, sparse (only for students)

**Virtual Fields:** None

**Methods:** None (handled in controllers)

---

#### `Issue.js`
**Purpose:** Book issue/circulation record schema  
**Collections:** `issues`

**Schema Fields:**
```javascript
{
  source: String (default: 'manual')        // Source: manual or catalog
  bookCode: String (required)               // Unique book identifier
  title: String (required)                  // Book title
  userEmail: String (required)              // Student email (indexed)
  userName: String (required)               // Student name
  issuedOn: String (YYYY-MM-DD)            // Issue date
  dueDate: String (YYYY-MM-DD)             // Due date
  returnedOn: String (YYYY-MM-DD, optional) // Return date
  fineRate: Number (default: 10)           // Fine amount per unit
  fineInterval: String (default: 'day')    // day/week/month/year
  manualFine: Number (default: 0)          // Admin-applied fine
  fineCleared: Boolean (default: false)    // Payment status
  clearedFineAmount: Number (default: 0)   // Amount paid
  department: String                        // Student department
  stream: String                           // Student stream
  year: String                             // Academic year
  semester: String                         // Semester
  rollNumber: String                       // Student roll number
  studentId: String                        // Student ID
  createdAt: Date (auto)                   // Record creation time
  updatedAt: Date (auto)                   // Last update time
}
```

**Indexes:**
- `userEmail`: For filtering student-specific issues
- `createdAt`: For sorting by newest

**Calculated Fields (in frontend):**
- `liveStatus`: Borrowed/Overdue/Returned
- `liveFine`: Current calculated fine

---

#### `FineSetting.js`
**Purpose:** Fine configuration schema (singleton)  
**Collections:** `finesettings`

**Schema Fields:**
```javascript
{
  amount: Number (required, default: 10)    // Fine amount (Rs.)
  interval: String (default: 'day')         // day/week/month/year
  createdAt: Date (auto)                    // Creation time
  updatedAt: Date (auto)                    // Last update time
}
```

**Pattern:** Singleton - only one document exists
- Created with default values if not exists
- Updated, never deleted
- Applies to all new book issues

---

### 📂 `/backend/routes`

API endpoint definitions and route handlers.

#### `authRoutes.js`
**Purpose:** Authentication and user management routes  
**Endpoints:** 8 routes

```javascript
// Public Routes
POST   /api/auth/register              // Student registration step 1
POST   /api/auth/verify-otp            // Student registration step 2
POST   /api/auth/complete-profile      // Student registration step 3
POST   /api/auth/login                 // Login (students + admins)
POST   /api/auth/register-admin        // Create admin account

// Protected Routes (JWT required)
GET    /api/auth/me                    // Get current user profile
PUT    /api/auth/update-profile        // Update profile

// Admin-only Routes
GET    /api/auth/users                 // Get all students
```

**Middleware Applied:**
- `authenticateToken`: Verify JWT on protected routes
- `authorizeRoles('admin')`: Check admin role on admin routes

---

#### `bookRoutes.js`
**Purpose:** Book management and fine configuration routes  
**Endpoints:** 8 routes

```javascript
// Protected Routes (any authenticated user)
GET    /api/books/fine-settings        // Get fine configuration

// Student-only Routes
GET    /api/books/issues/student       // Get my issued books

// Admin-only Routes
GET    /api/books/issues               // Get all issues
POST   /api/books/issue-manual         // Issue books to student
PUT    /api/books/issues/:id/return    // Mark book as returned
PUT    /api/books/issues/:id/fine      // Apply manual fine
PUT    /api/books/issues/:id/clear-fine // Clear fine
PUT    /api/books/fine-settings        // Update fine configuration
```

**Parameter Routes:**
- `:id` = MongoDB ObjectId of Issue document

---

#### `studentRoutes.js`
**Purpose:** Student search functionality  
**Endpoints:** 1 route

```javascript
// Admin-only Routes
GET    /api/students/search-by-roll?roll=CS101  // Search by roll number
```

**Query Parameters:**
- `roll`: Roll number to search (partial match, case-insensitive)

---

### 📂 `/backend/utils`

#### `sendOTP.js`
**Purpose:** Email OTP delivery using Nodemailer  
**Function:** `sendOtp(email, otp)`

**What it does:**
1. Creates Nodemailer transporter with Gmail configuration
2. Formats HTML email with OTP code
3. Sends email from EMAIL_USER to recipient
4. Includes sender info, subject, and styled HTML body

**Email Template:**
```
Subject: Your OTP Code for Library Management System

Your OTP code is: 123456

This code will expire in 5 minutes.
Please use this code to verify your email address.
```

**Configuration:**
- Service: Gmail
- Auth: EMAIL_USER and EMAIL_PASS (App Password)
- From: "Library Management System"

**Error Handling:**
- Throws error if email fails to send
- Caught by registerUser controller

---

### 📄 `/backend` Root Files

#### `server.js`
**Purpose:** Express server entry point and configuration  
**What it does:**

**1. Setup & Imports:**
```javascript
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
```

**2. Initialize App:**
```javascript
dotenv.config()              // Load .env variables
const app = express()        // Create Express app
const PORT = process.env.PORT || 5000
```

**3. Middleware:**
```javascript
app.use(cors())              // Enable CORS for frontend
app.use(express.json())      // Parse JSON request bodies
```

**4. Routes:**
```javascript
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/students', studentRoutes)
```

**5. Start Server:**
```javascript
connectDB()                  // Connect to MongoDB
app.listen(PORT)             // Start listening on port
```

**Execution Order:**
1. Load environment variables
2. Connect to MongoDB
3. Set up middleware
4. Register routes
5. Start server on port 5000

---

#### `package.json`
**Purpose:** Node.js project configuration and dependencies

**Key Fields:**
```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",              // Use ES6 imports
  "main": "server.js",
  "scripts": {
    "start": "nodemon server.js"  // Auto-restart on changes
  },
  "dependencies": { ... }
}
```

**Dependencies:**
- `bcryptjs`: Password hashing
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variables
- `express`: Web framework
- `jsonwebtoken`: JWT authentication
- `mongoose`: MongoDB ODM
- `nodemailer`: Email sending
- `otp-generator`: OTP generation
- `uuid`: Unique ID generation
- `nodemon`: Auto-restart dev server

---

#### `.env`
**Purpose:** Environment variables configuration  
**Not in git** (listed in .gitignore)

**Required Variables:**
```env
MONGODB_URI=mongodb://localhost:27017/library-management
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
```

**Security:** Never commit this file to git!

---

#### `.gitignore`
**Purpose:** Exclude files from git version control

**Ignored:**
```
node_modules/    # Dependencies (large, auto-generated)
.env             # Secrets and credentials
*.log            # Log files
.DS_Store        # Mac system files
```

---

## 🎨 Frontend (`/frontend`)

### Purpose
React-based single-page application providing user interface for students and admins.

### Structure Overview

```
frontend/
├── public/           # Static assets
├── src/              # Source code
│   ├── admin/        # Admin pages and components
│   ├── assets/       # Images and styles
│   ├── components/   # Reusable components
│   ├── data/         # Static data
│   ├── pages/        # Public pages
│   ├── shared/       # Contexts and utilities
│   └── user/         # Student pages and components
├── index.html        # HTML template
├── package.json      # Dependencies
└── vite.config.js    # Vite configuration
```

---

### 📂 `/frontend/public`

#### `favicon.svg`
- Browser tab icon
- Displayed in bookmarks and history

#### `icons.svg`
- SVG sprite containing multiple icons
- Optimized for performance
- Not currently used (using Lucide React instead)

#### `library-mark.svg`
- Logo image displayed in sidebar
- Used in both admin and student layouts

---

### 📂 `/frontend/src/admin`

Admin-only pages accessible at `/admin/*` routes.

#### `AdminLayout.jsx`
**Purpose:** Admin dashboard wrapper with sidebar  
**Route:** `/admin`

**What it does:**
- Renders sidebar with admin navigation items
- Navigation items:
  - Admin Dashboard (`/admin/dashboard`)
  - Issue Books (`/admin/books`)
  - Manage Students (`/admin/users`)
  - Fine Settings (`/admin/fines`)
- Displays logged-in admin's name
- Provides logout functionality
- Wraps child routes with `<Outlet />` (React Router)

**Components Used:**
- `Sidebar`: Reusable sidebar component
- `Outlet`: Renders nested routes

**State:**
- `currentUser` from AuthContext
- `logout` function from AuthContext

---

#### `AdminDashboard.jsx`
**Purpose:** Admin home page with statistics and overdue students  
**Route:** `/admin/dashboard`

**Sections:**

**1. Hero Section:**
- Page title: "Manage issued books..."
- Subtitle: "Admin area focuses on visual trend graphs..."
- Badge: "College administration workspace"

**2. Stats Grid (4 cards):**
- **Total Issued:** All book issue records
- **Currently Borrowed:** Active (not returned) books
- **Overdue Books:** Books past due date
- **Cleared Fine:** Total fines collected

Each card shows:
- Icon (UserRound, Activity, ShieldEllipsis, AlertTriangle)
- Label
- Value (count or amount)
- Descriptive note

**3. Overdue Attention List:**
- Shows top 10 overdue students by total fine
- Each card displays:
  - Student name and email
  - Student ID and department
  - Total pending fine
  - Highest fine book details (title, code, fine amount)
  - "Most Fine Imposed" badge on first card
- Empty state: "No overdue records found"

**Data Source:**
- `adminStats` from LibraryContext
- `studentSummaries` filtered by overdue status

---

#### `AdminBooksPage.jsx`
**Purpose:** Issue books to students  
**Route:** `/admin/books`

**Features:**

**1. Header:**
- Title: "Issue Book to Student"
- Current fine rule badge: "Rs. X per Y"

**2. Student Search Section:**
- Search by roll number input
- Auto-search with 300ms debounce
- Displays matching students as clickable cards
- Selected student highlights in blue
- Auto-fills form when student selected
- "Clear selection" button

**3. Student Details Form:**
- Student Name (read-only)
- Department, Stream, Year, Semester
- Roll Number
- All fields populated from selected student

**4. Book Entries Section:**
- Add multiple books with "+ Add Book" button
- Each book card has:
  - Book Title (required)
  - Book Code (required)
  - Issue Date (auto-filled: today, disabled)
  - Due Date (required, must be >= today)
  - Delete button (if more than 1 book)
- Validation: At least one valid book entry required

**5. Submit:**
- "Issue Manual Books" button
- Creates Issue records for all valid books
- Shows success message with count
- Resets form after success

**State:**
- `issueForm`: Form fields and book entries
- `selectedStudent`: Currently selected student
- `matchingStudents`: Search results
- `searchError`: Search error messages
- `formMessage`: Success/error messages
- `isSearching`: Loading state

**API Calls:**
- GET `/api/students/search-by-roll?roll=X`
- POST `/api/books/issue-manual`

---

#### `AdminUsersPage.jsx`
**Purpose:** View and manage all students  
**Route:** `/admin/users`

**Features:**

**1. Header:**
- Title: "Registered Students"
- Subtitle: "View and manage student accounts..."

**2. Search & Filter:**
- Search input: Filter by name, email, roll number
- Department filter dropdown
- Status filter: All/Active/Inactive

**3. Students Grid:**
- Card layout showing each student:
  - Name and student ID
  - Email and phone
  - Department and stream
  - Semester and academic year
  - Roll number
  - Total books issued
  - Active books count
  - Pending fine amount
- Empty state: "No students match your search"

**State:**
- `students`: All registered students
- `filters`: { search, department, status }
- `filteredStudents`: Computed filtered list

**Data Source:**
- Fetches from GET `/api/auth/users` (admin only)

---

#### `AdminFinesPage.jsx`
**Purpose:** Configure fine calculation settings  
**Route:** `/admin/fines`

**Features:**

**1. Header:**
- Title: "Fine Settings"
- Edit button (pencil icon)
- Only shows when not editing

**2. Form:**
- **Fine Amount:**
  - Number input (min: 0)
  - Example: Rs. 10, Rs. 20, Rs. 50
  
- **Fine Interval:**
  - Dropdown select
  - Options: Per Day, Per Week, Per Month, Per Year
  
- Disabled when not in edit mode
- "Save Fine Rule" button (only in edit mode)

**3. Read-only Display:**
- Shows current rule when not editing
- Format: "Rs. X per Y"

**4. Success Toast:**
- "Fine settings saved successfully"
- Auto-dismisses after 2.2 seconds

**Workflow:**
1. Click edit button
2. Modify amount or interval
3. Click "Save Fine Rule"
4. Settings update globally
5. All new calculations use new settings

**State:**
- `form`: { amount, interval }
- `isEditing`: Edit mode toggle
- `toast`: Success message

**API Call:**
- PUT `/api/books/fine-settings`

---

### 📂 `/frontend/src/assets`

#### `dummyStyles.jsx`
**Purpose:** Tailwind CSS class mappings organized by component

**Structure:**
```javascript
export const componentNameStyles = {
  className: "tailwind classes here",
  anotherClass: "more tailwind classes",
}
```

**Why this approach:**
- Centralized styling
- Reusable class combinations
- Easy to update styling
- Avoids long className strings in JSX

**Example:**
```javascript
export const buttonStyles = {
  primary: "bg-blue-600 text-white px-4 py-2 rounded",
  secondary: "bg-gray-200 text-gray-800 px-4 py-2 rounded"
}

// Usage in component:
<button className={buttonStyles.primary}>Click me</button>
```

**Included Style Sets:**
- `sidebarStyles`: Sidebar component styles
- `adminDashboardStyles`: Admin dashboard layout
- `adminBooksPageStyles`: Book issue page
- `userDashboardPageStyles`: Student dashboard
- `userBooksPageStyles`: Student books page
- `signupStyles`: Registration page
- `loginStyles`: Login page
- And many more...

---

#### `library-mark.svg`
**Purpose:** Logo image file  
**Used in:** Sidebar component (both admin and user layouts)

---

### 📂 `/frontend/src/components`

#### `Sidebar.jsx`
**Purpose:** Reusable sidebar navigation component

**Props:**
```javascript
{
  title: String,           // Sidebar title (e.g., "ShelfWise")
  subtitle: String,        // Subtitle text
  badge: String,          // Badge label
  navItems: Array,        // Navigation items
  footerItems: Array,     // Footer items (logout button)
  accent: String,         // Color scheme: "admin" or "user"
  logoSrc: String         // Logo image path
}
```

**navItems Format:**
```javascript
[
  {
    label: "Dashboard",
    description: "View statistics",
    href: "/admin/dashboard",
    match: "/admin",        // Active route matching
    icon: "dashboard"       // Lucide icon name
  }
]
```

**Features:**
- Mobile responsive with hamburger menu
- Active route highlighting
- Icon support via Lucide React
- Click anywhere outside to close (mobile)
- Smooth transitions

**State:**
- `open`: Mobile menu open/close

**Used By:**
- AdminLayout (admin sidebar)
- UserLayout (student sidebar)

---

### 📂 `/frontend/src/data`

#### `libraryData.js`
**Purpose:** Static data arrays for dropdowns

**Exports:**

**1. `studentYears`:**
```javascript
["1st Year", "2nd Year", "3rd Year", "4th Year"]
```
- Used in: Signup, Profile edit
- Dropdown options for academic year

**2. `studentSemesters`:**
```javascript
["Semester 1", "Semester 2", ..., "Semester 8"]
```
- Used in: Signup, Profile edit
- Dropdown options for current semester

**Why separate file:**
- Avoid duplicating data
- Single source of truth
- Easy to update (add 5th year, etc.)

---

### 📂 `/frontend/src/pages`

Public pages accessible without authentication.

#### `Homes.jsx`
**Purpose:** Landing page  
**Route:** `/`

**Sections:**

**1. Hero Section:**
- Sidebar with navigation:
  - Student Dashboard link
  - Admin Dashboard link
  - Login/Logout buttons
- Main content:
  - Badge: "Library Management Website"
  - Title: "Manage Students, books, returns..."
  - Description paragraph
  - Buttons:
    - "Go To Dashboard" (if logged in)
    - "Create Account" + "Login Now" (if logged out)

**2. Info Card:**
- "Library Workflow" description
- Explains separate dashboards

**3. Features Grid:**
Three feature cards:
- **Manual book issuing:** Track issues, returns, fines
- **Student self-service:** View borrowed books, fines
- **Admin desk controls:** Manage records, fines

Each card shows:
- Icon (BookMarked, Users, ShieldCheck)
- Title
- Description text

**Dynamic Content:**
- Shows different buttons based on login status
- Redirects to appropriate dashboard based on role

---

#### `Login.jsx`
**Purpose:** User login page  
**Route:** `/login`

**Form Fields:**
- Email (type: email, required)
- Password (type: password, required)
  - Eye icon to toggle visibility

**Features:**
- Remember email from signup (via location.state)
- Auto-login if coming from signup (optional)
- Error message display
- Loading state during authentication
- "Back to Home" link

**Workflow:**
1. User enters email and password
2. Click "Login" button
3. POST to `/api/auth/login`
4. Receives JWT token
5. Stores token in localStorage
6. Sets AuthContext currentUser
7. Redirects:
   - Admin → `/admin/dashboard`
   - Student → `/user/dashboard`

**State:**
- `form`: { email, password }
- `error`: Error message
- `showPassword`: Toggle visibility
- `loading`: Button disabled during API call

---

#### `Signup.jsx`
**Purpose:** Student registration (3-step process)  
**Route:** `/signup`

**Step 1: Account**
- Full Name
- Email Address
- Mobile Number (10 digits, auto-formatted)
- Password (with visibility toggle)
- "Continue" button

**Step 2: OTP Verification**
- Info box: "OTP sent to [email]"
- 6-digit OTP input
- "Continue" button

**Step 3: Profile**
- Department (text input)
- Stream (text input)
- Semester (dropdown: Semester 1-8)
- Year (dropdown: 1st-4th Year)
- Roll Number (text input)
- "Complete profile" button

**Features:**
- Step indicators at top (1, 2, 3)
- Active step highlighted
- "Back" button (from step 2 onwards)
- Real-time validation
- Error messages below form
- Success toasts for each step
- Auto-redirect to login after completion

**Info Panel (Right Side):**
- Badge: "Step wise signup"
- Title: "Create account, verify OTP..."
- Three highlights:
  - Email checking
  - OTP verification
  - Profile details

**State:**
- `step`: 1, 2, or 3
- `form`: All registration fields
- `error`: Validation errors
- `toast`: Success messages
- `showPassword`: Toggle visibility
- `loading`: Button state

**API Calls:**
- Step 1: POST `/api/auth/register`
- Step 2: POST `/api/auth/verify-otp`
- Step 3: POST `/api/auth/complete-profile`

---

### 📂 `/frontend/src/shared`

Shared utilities, contexts, and components.

#### `AuthContext.jsx`
**Purpose:** Authentication state management using React Context

**What it provides:**
- Global authentication state
- User login/logout functions
- Profile update functions
- All authentication-related API calls

**Context Values:**
```javascript
{
  currentUser: Object | null,        // Logged-in user or null
  ready: Boolean,                    // Auth initialization complete
  accounts: Array,                   // All users (for admin)
  registerStudent: Function,         // Register new student
  verifyOtpCode: Function,          // Verify OTP
  completeProfileData: Function,    // Complete profile
  loginUser: Function,              // Login
  logout: Function,                 // Logout
  updateProfile: Function           // Update profile
}
```

**Functions Explained:**

**1. `registerStudent({ name, email, phone, password })`**
- Validates input
- POST to `/api/auth/register`
- Returns: `{ ok: Boolean, error?: String }`

**2. `verifyOtpCode({ email, otp })`**
- POST to `/api/auth/verify-otp`
- Returns: `{ ok: Boolean, error?: String }`

**3. `completeProfileData({ email, department, stream, semester, academicYear, rollNumber })`**
- POST to `/api/auth/complete-profile`
- Returns: `{ ok: Boolean, error?: String }`

**4. `loginUser({ email, password })`**
- POST to `/api/auth/login`
- Receives JWT token and user object
- Stores token in localStorage (key: "library-auth-token")
- Stores user in localStorage (key: "library-auth-user")
- Sets currentUser state
- Returns: `{ ok: Boolean, error?: String, user?: Object }`

**5. `logout()`**
- Clears localStorage
- Sets currentUser to null
- Redirects to home

**6. `updateProfile(updates)`**
- PUT to `/api/auth/update-profile`
- Updates currentUser in state and localStorage
- Returns: `{ ok: Boolean, error?: String }`

**Initialization:**
- On mount, checks localStorage for token and user
- If exists, fetches fresh profile from `/api/auth/me`
- Sets `ready: true` when initialization complete

**Storage Keys:**
- `library-auth-token`: JWT token
- `library-auth-user`: User object

---

#### `LibraryContext.jsx`
**Purpose:** Library data management (books, issues, fines, students)

**What it provides:**
- Book issue records
- Student summaries
- Fine settings
- Admin statistics
- Functions to manipulate data

**Context Values:**
```javascript
{
  books: Array,                      // All book records
  adminStats: Array,                 // Dashboard statistics
  studentSummaries: Array,           // All students with stats
  currentUserSummary: Object,        // Logged-in student's data
  currentUserHistory: Array,         // Logged-in student's books
  fineSettings: Object,              // Fine configuration
  returnIssuedRecord: Function,      // Mark book as returned
  applyFineToRecord: Function,       // Apply manual fine
  clearFineForRecord: Function,      // Clear fine
  issueManualBooksToStudent: Function, // Issue books
  saveFineSettings: Function         // Update fine config
}
```

**Key Functions:**

**1. `fetchManualIssues()`**
- Determines API URL based on role:
  - Admin: GET `/api/books/issues`
  - Student: GET `/api/books/issues/student`
- Fetches and formats issue records
- Updates `manualIssues` state

**2. `issueManualBooksToStudent({ userEmail, studentDetails, books })`**
- POST to `/api/books/issue-manual`
- Creates multiple Issue records
- Applies current fine settings
- Refreshes issue list
- Returns: `{ ok: Boolean, count: Number, error?: String }`

**3. `returnIssuedRecord({ recordId })`**
- Optimistically updates UI (sets returnedOn)
- PUT to `/api/books/issues/:id/return`
- Reverts if API fails
- Returns: `{ ok: Boolean }`

**4. `applyFineToRecord({ recordId, amount })`**
- PUT to `/api/books/issues/:id/fine`
- Refreshes issues
- Returns: `{ ok: Boolean }`

**5. `clearFineForRecord({ recordId })`**
- Optimistically clears fine
- PUT to `/api/books/issues/:id/clear-fine`
- Reverts if API fails
- Returns: `{ ok: Boolean }`

**6. `saveFineSettings({ amount, interval })`**
- Updates localStorage first (optimistic)
- PUT to `/api/books/fine-settings`
- Updates from server response

**Calculated Data:**

**`adminStats` (4 items):**
1. Total Issued: All Issue records
2. Currently Borrowed: Issues without returnedOn
3. Overdue Books: Issues past dueDate and not returned
4. Cleared Fine: Sum of all clearedFineAmount

**`studentSummaries` (per student):**
```javascript
{
  ...userObject,                     // Student details
  borrowedCount: Number,             // Active books count
  totalIssued: Number,              // All-time issues
  totalFine: Number,                // Current pending fine
  totalClearedFine: Number,         // Paid fines
  status: String,                   // "Overdue"/"Borrowing"/"Clear"
  activeBooks: Array,               // Not returned
  history: Array                    // All issues
}
```

**`currentUserHistory`:**
- Filtered issues for logged-in student
- Used in UserBooksPage and UserDashboard

**Fine Calculation Logic:**
```javascript
// For each issue:
if (returnedOn || fineCleared) return 0;

overdueDays = max(0, daysBetween(today, dueDate));
if (overdueDays <= 0) return 0;

fineUnits = ceil(overdueDays / intervalDays);
// day=1, week=7, month=30, year=365

autoFine = fineUnits * fineRate;
totalFine = autoFine + manualFine;
```

**Initialization:**
- Loads fine settings from localStorage
- Fetches issues on mount if user logged in
- Recalculates all data when issues change

---

#### `ProtectedRoute.jsx`
**Purpose:** Route guard component for authentication and authorization

**How it works:**
```
User navigates to protected route
    ↓
ProtectedRoute checks:
1. Is auth ready? → No → Show loading screen
2. Is user logged in? → No → Redirect to /login
3. Does user role match? → No → Redirect to /login
4. All checks passed → Render child routes with <Outlet />
```

**Props:**
```javascript
{ allowedRole: "admin" | "user" }
```

**Loading States:**

**1. Auth not ready:**
```jsx
<div>Loading your library workspace...</div>
```

**2. Token exists but user not loaded:**
```jsx
<div>Syncing your workspace...</div>
```

**3. Access granted:**
```jsx
<Outlet />  // Renders nested routes
```

**Usage in App.jsx:**
```jsx
<Route element={<ProtectedRoute allowedRole="admin" />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route path="dashboard" element={<AdminDashboard />} />
  </Route>
</Route>
```

**Security:**
- Prevents unauthorized route access
- Handles edge cases (token without user)
- Preserves original URL for redirect-after-login

---

### 📂 `/frontend/src/user`

Student-only pages accessible at `/user/*` routes.

#### `UserLayout.jsx`
**Purpose:** Student dashboard wrapper with sidebar  
**Route:** `/user`

**Similar to AdminLayout but with:**
- Title: "Student Desk"
- Subtitle: "College library access"
- Badge: "Student section"
- Navigation items:
  - Student Dashboard (`/user/dashboard`)
  - Books Page (`/user/books`)
  - Edit Profile (`/user/profile`)
- Uses "user" accent color (different from admin)

---

#### `UserDashboardPage.jsx`
**Purpose:** Student home page with overview  
**Route:** `/user/dashboard`

**Sections:**

**1. Hero Section:**
- Badge: "Student Dashboard"
- Title: "[Name] profile, semester status, and latest books"
- Subtitle: Dashboard description

**2. Profile Cards (Right Side):**

**Student Profile Card:**
- Name
- Student ID
- Roll Number
- Department

**Semester Details Card:**
- Current Semester
- Stream
- Academic Year

**3. Overview Stats Grid (5 cards):**
- **Total Issues:** All books ever issued
- **Active Books:** Currently borrowed
- **Overdue Books:** Past due date
- **Pending Fine:** Amount owed
- **Fine Cleared:** Amount paid

Each card shows:
- Icon with colored background
- "Live" badge
- Label, value, and note

**4. Recent Books Section:**
- Shows last 3 issued books
- Uses `UserBookCard` component
- "View More" link to `/user/books`
- Empty state: "No recent books found"

**Data Source:**
- `currentUser` from AuthContext
- `currentUserHistory` from LibraryContext
- `currentUserSummary` from LibraryContext

---

#### `UserBooksPage.jsx`
**Purpose:** View all issued books with search and filters  
**Route:** `/user/books`

**Sections:**

**1. Header:**
- Badge: "Student books page"
- Title: "Book cards with richer content..."
- Description of card layout

**2. Search & Filters:**
- **Search Box:**
  - Placeholder: "Search by book name, code, borrower, or author"
  - Searches across multiple fields
  - Real-time filtering
  
- **Status Filter:**
  - Dropdown with options:
    - All Status
    - Borrowed (currently active)
    - Overdue (past due date)
    - Returned (returned books)

**3. Books Grid:**
- Shows `UserBookCard` for each book
- Responsive grid layout
- Empty state: "No issued books matched your search"

**Filtering Logic:**
```javascript
filteredBooks = books.filter(book => {
  // Search filter
  matchesSearch = search matches title, code, or author
  
  // Status filter
  matchesStatus = status === "All" || status === book.liveStatus
  
  return matchesSearch && matchesStatus
})
```

**State:**
- `filters`: { search: "", status: "All" }
- `filteredIssuedBooks`: Computed filtered array

**Data Source:**
- `currentUserHistory` from LibraryContext

---

#### `UserBookCard.jsx`
**Purpose:** Reusable book card component

**Props:**
```javascript
{
  record: Object,          // Book issue record
  borrowerName: String     // Student name
}
```

**Card Layout:**

**Header:**
- Book icon
- Status badge (Borrowed/Overdue/Returned)
  - Green for Borrowed
  - Red for Overdue
  - Gray for Returned

**Body:**
- Book title (bold, large)
- Book code (smaller, gray)
- Details grid:
  - Issued date
  - Due date
  - Returned date (if returned)

**Fine Alert (if applicable):**
- Yellow alert box
- Shows: "Fine: Rs. X"
- Only displayed if liveFine > 0

**Cleared Fine Info (if applicable):**
- Green info box
- Shows: "✓ Fine Cleared: Rs. X"
- Only displayed if fineCleared is true

**Footer:**
- Borrower name
- Department (if available)

**Styling:**
- Status-based color coding
- Responsive card layout
- Icons for dates

---

#### `UserEditProfilePage.jsx`
**Purpose:** Update student profile  
**Route:** `/user/profile`

**Features:**

**1. Header:**
- Title: "Edit Profile"
- Subtitle: "Update your student details..."
- Edit button (pencil icon, only when not editing)

**2. Form Fields:**
- **Name:** Text input (editable)
- **Email:** Text input (disabled, cannot be changed)
  - Helper text: "Email address cannot be changed"
- **Mobile Number:** Text input (editable, 10 digits)
- **Department:** Text input (editable)
- **Stream:** Text input (editable)
- **Semester:** Dropdown (Semester 1-8, editable)
- **Year:** Dropdown (1st-4th Year, editable)
- **Roll Number:** Text input (editable)

**3. Edit Mode:**
- Initially all fields disabled
- Click edit button to enable
- Two buttons appear:
  - "Save Profile" (submit)
  - "Cancel" (revert changes)

**4. Validation:**
- Phone must be exactly 10 digits
- Shows error message below form

**5. Success Toast:**
- "Profile updated successfully"
- Auto-dismisses after 2.4 seconds

**Workflow:**
1. Click edit button
2. Modify fields
3. Click "Save Profile"
4. PUT to `/api/auth/update-profile`
5. Updates currentUser in AuthContext
6. Shows success toast
7. Exits edit mode

**State:**
- `form`: All editable fields
- `isEditing`: Edit mode toggle
- `error`: Validation errors
- `loading`: Submit button state
- `toast`: Success message

---

### 📄 `/frontend` Root Files

#### `App.jsx`
**Purpose:** Main app component with route definitions

**Route Structure:**
```
/ (Home)
/login (Login)
/signup (Signup)

/admin (Protected - Admin)
  ├── /admin/dashboard
  ├── /admin/books
  ├── /admin/users
  └── /admin/fines

/user (Protected - Student)
  ├── /user/dashboard
  ├── /user/books
  └── /user/profile

* (404 - Redirect to /)
```

**Components:**
- `Routes`: React Router container
- `Route`: Individual route definitions
- `Navigate`: Redirect component
- `ProtectedRoute`: Auth guard

**Protected Route Pattern:**
```jsx
<Route element={<ProtectedRoute allowedRole="admin" />}>
  <Route path="/admin" element={<AdminLayout />}>
    {/* Nested admin routes */}
  </Route>
</Route>
```

---

#### `main.jsx`
**Purpose:** React application entry point

**What it does:**
1. Imports React and ReactDOM
2. Imports App component
3. Imports BrowserRouter (React Router)
4. Imports global CSS
5. Wraps App with providers:
   - `BrowserRouter`: Routing
   - `AuthProvider`: Authentication
   - `LibraryProvider`: Library data
6. Renders to DOM element with id "root"

**Provider Hierarchy:**
```
<BrowserRouter>
  <AuthProvider>
    <LibraryProvider>
      <App />
    </LibraryProvider>
  </AuthProvider>
</BrowserRouter>
```

---

#### `index.css`
**Purpose:** Global Tailwind CSS styles

**Contents:**
```css
@tailwind base;        /* Base Tailwind styles */
@tailwind components;  /* Component classes */
@tailwind utilities;   /* Utility classes */

/* Custom global styles (if any) */
```

---

#### `index.html`
**Purpose:** HTML template

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="/favicon.svg">
  <title>ShelfWise - Library Management</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

#### `vite.config.js`
**Purpose:** Vite build tool configuration

**Configuration:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,           // Dev server port
    open: true            // Auto-open browser
  }
})
```

---

#### `package.json`
**Purpose:** Frontend dependencies and scripts

**Scripts:**
```json
{
  "dev": "vite",              // Start dev server
  "build": "vite build",      // Build for production
  "preview": "vite preview",  // Preview production build
  "lint": "eslint ."          // Run ESLint
}
```

**Dependencies:**
- `react`: UI library
- `react-dom`: React DOM renderer
- `react-router-dom`: Routing
- `lucide-react`: Icons
- `tailwindcss`: CSS framework
- `vite`: Build tool

---

## 🔄 Data Flow Diagrams

### Authentication Flow

```
User enters credentials
    ↓
LoginUser component
    ↓
loginUser(email, password) from AuthContext
    ↓
POST /api/auth/login
    ↓
Backend: authenticateToken
    ↓
Backend: authController.LoginUser
    ↓
Verify password with bcrypt
    ↓
Generate JWT token (7 days)
    ↓
Response: { success, token, user }
    ↓
Frontend: Store token in localStorage
    ↓
Frontend: Set currentUser in AuthContext
    ↓
Frontend: Redirect to dashboard based on role
```

### Book Issue Flow

```
Admin searches student by roll number
    ↓
AdminBooksPage: searchByRoll
    ↓
GET /api/students/search-by-roll?roll=X
    ↓
Backend: studentController.searchStudentsByRoll
    ↓
Returns matching students
    ↓
Admin selects student → form auto-fills
    ↓
Admin adds book details (title, code, due date)
    ↓
Admin clicks "Issue Manual Books"
    ↓
AdminBooksPage: issueManualBooksToStudent
    ↓
POST /api/books/issue-manual
    ↓
Backend: bookController.issueManualBooks
    ↓
Validates: student exists, books have required fields
    ↓
Creates Issue records with current fine settings
    ↓
Response: { success, count, issues }
    ↓
Frontend: Shows success message
    ↓
Frontend: Fetches updated issues
    ↓
Student sees books in their dashboard
```

### Fine Calculation Flow

```
LibraryContext loads Issue records
    ↓
For each issue:
  ↓
  createManualRecord(issue, fineSettings)
      ↓
      If returnedOn exists → Fine = 0
      If fineCleared → Fine = 0
      ↓
      Calculate overdue days:
        today - dueDate = X days
      ↓
      If X <= 0 → Fine = 0
      ↓
      Calculate fine units based on interval:
        day: X days
        week: ceil(X / 7)
        month: ceil(X / 30)
        year: ceil(X / 365)
      ↓
      Calculate auto fine:
        fineUnits × fineRate
      ↓
      Add manual fine:
        autoFine + manualFine
      ↓
      Return total fine
    ↓
Display fine in student dashboard and books page
```

---

## 🎯 Key Concepts Summary

### Authentication Strategy
- **JWT tokens** with 7-day expiry
- **Role-based access:** admin vs user (student)
- **bcrypt hashing** for passwords
- **Email verification** via OTP

### Data Architecture
- **User collection:** Students and admins
- **Issue collection:** Book circulation records
- **FineSetting collection:** Global fine config (singleton)

### Fine System
- **Automatic calculation:** Based on overdue days and interval
- **Manual fines:** Admin can add extra charges
- **Fine clearing:** Track paid fines separately
- **Flexible intervals:** Per day, week, month, or year

### Frontend Architecture
- **Context API:** Global state management
- **Protected routes:** Authentication guards
- **Role-based UI:** Different dashboards for admin/student
- **Optimistic updates:** UI updates before API confirmation

### API Design
- **RESTful endpoints:** Standard HTTP methods
- **JWT authentication:** Bearer token in header
- **Consistent responses:** { success, data/error }
- **Middleware chain:** Auth → Authorization → Controller

---

## 📚 Glossary

**Terms Used in Project:**

- **Issue:** A book circulation record (borrow transaction)
- **Manual Issue:** Book issued by admin (vs. catalog-based)
- **Live Status:** Current status: Borrowed, Overdue, or Returned
- **Live Fine:** Real-time calculated fine amount
- **Manual Fine:** Additional fine applied by admin
- **Cleared Fine:** Fine that has been paid
- **Fine Unit:** Interval multiplier (e.g., 3 weeks = 3 units)
- **Role:** User type (user = student, admin = administrator)
- **OTP:** One-Time Password for email verification
- **JWT:** JSON Web Token for authentication
- **Context:** React Context API for global state
- **Middleware:** Express function that processes requests
- **Controller:** Function that handles API endpoints
- **Schema:** Mongoose database model definition
- **Protected Route:** Route requiring authentication
- **Optimistic Update:** Update UI before server confirms

---

## 📞 File Location Quick Reference

**Need to modify...**

| Task | File(s) to Edit |
|------|----------------|
| Add new API endpoint | `backend/routes/*.js` + `backend/controllers/*.js` |
| Change database schema | `backend/models/*.js` |
| Modify authentication | `backend/middlewares/authMiddleware.js` |
| Update fine calculation | `backend/controllers/bookContoller.js` (calculateFine) |
| Change email template | `backend/utils/sendOTP.js` |
| Add admin page | `frontend/src/admin/*.jsx` + `frontend/src/App.jsx` |
| Add student page | `frontend/src/user/*.jsx` + `frontend/src/App.jsx` |
| Modify sidebar | `frontend/src/components/Sidebar.jsx` |
| Update styles | `frontend/src/assets/dummyStyles.jsx` |
| Change API calls | `frontend/src/shared/AuthContext.jsx` or `LibraryContext.jsx` |
| Add new form | Create new component in appropriate folder |
| Modify routes | `frontend/src/App.jsx` |

---

**End of Summary**

For more detailed information, refer to the main README.md file.
