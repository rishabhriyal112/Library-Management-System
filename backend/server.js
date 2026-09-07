import express from "express";
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import studentRouter from "./routes/studentRoutes.js";
import bookRouter from "./routes/bookRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, /\.vercel\.app$/]
        : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

app.use(express.json());

// DB Connection
connectDB();

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/students", studentRouter);
app.use('/api/books', bookRouter);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: "Library Management System API",
        status: "Running",
        version: "1.0.0"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
    });
});

// Only start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel
export default app;
