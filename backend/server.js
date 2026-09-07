import express from "express";
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import studentRouter from "./routes/studentRoutes.js";
import bookRouter from "./routes/bookRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: explicit allowed origins for separate Vercel deployments
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://library-management-system-vikr.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, mobile apps, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
    },
    credentials: true
}));

app.use(express.json());

// DB Connection
connectDB();

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/students", studentRouter);
app.use('/api/books', bookRouter);

// Health check
app.get('/', (req, res) => {
    res.json({
        message: "Library Management System API",
        status: "Running",
        version: "1.0.0"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Only start listener in local development
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Required export for Vercel serverless
export default app;
