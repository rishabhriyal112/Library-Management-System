import express from "express";
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import studentRouter from "./routes/studentRoutes.js";
import bookRouter from "./routes/bookRoutes.js";

const PORT = 5000;
const app = express();


//MIDDLEWARES
app.use(cors());
app.use(express.json());

//DB
connectDB();

//ROUTES
app.use("/api/auth",authRouter);
app.use("/api/students",studentRouter);
app.use('/api/books',bookRouter); 

app.get('/',(req,res)=>{
    res.send("API Working");
})

app.listen(PORT, (()=>{
    console.log(`Server running on http://localhost:${PORT}`);
}))
