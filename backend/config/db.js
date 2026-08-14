import mongoose from "mongoose";

export const connectDB = async () => {
    mongoose.connect("mongodb+srv://riyalrishabh22_db_user:CKrCLnBI52RaLFb4@cluster0.k5hyt9z.mongodb.net/LibraryManagement")
    .then(() =>{console.log("DB Connected")})
}
