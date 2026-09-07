import mongoose from "mongoose";

export const connectDB = async () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => { console.log("DB Connected") })
    .catch((err) => { console.error("DB Connection Failed:", err.message) })
}
