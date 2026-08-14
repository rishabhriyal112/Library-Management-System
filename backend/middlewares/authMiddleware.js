import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

//to authenticate JWT Token
export const authenticateToken = async (req, res, next) => {
    try {
        // Get the value of the "Authorization" header from the request
        // Example: "Bearer eyJhbGciOiJIUzI1NiIs..."
        const authHeader = req.headers["authorization"];

        // Split the header by space and take the second part (the actual token)
        // "Bearer eyJhbGciOi..." → ["Bearer", "eyJhbGciOi..."]
        // [1] gives us: "eyJhbGciOi..."
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(400).json({ message: "No Token Provided, authorization denied" });
        }

        // Verify the JWT token using the secret key from .env
        // If the token is valid, jwt.verify() returns the data stored inside the token
        // Example decoded data: { id: "12345", role: "user", iat: ..., exp: ... }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        // Find the user in MongoDB using the ID stored inside the JWT
        // decoded.id = user's MongoDB _id
        // .select("-password") = don't include the password in the result
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(400).json({
                message: "Token is not valid or no longer exists"
            })
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("JWT auth error : ", error);
        return res.status(401).json({ message: "Token is not valid" });
    }
}

//middleware to authorize specific roles
export const authorizeRoles = (...roles) => {
    // roles contains the roles that are allowed
    // Example: authorizeRoles("admin")
    // roles = ["admin"]
    return (req, res, next) => {
        // req.user was created by the protect middleware. Check:
        // 1. Does req.user exist?
        // 2. Is the user's role included in the allowed roles?
        // If user doesn't have permission, stop the request
        if (!req.user || !roles.includes(req.user.roles)) {
            return res.status(403).json({ message: "Access Forbidden" });
        }
        next()
    }
}
