import express from 'express';
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware.js";
import { searchStudentsByRoll } from "../controllers/studentController.js";

const studentRouter = express.Router();

/*
GET request - GET is generally used when the client wants to retrieve/fetch data from the server. Example:
GET /search-by-roll?roll=CS101
The "roll=CS101" is called a query parameter.
It can be accessed in the controller using:
req.query.roll
-----------------------------------------
URL: /search-by-roll
Middleware runs from LEFT → RIGHT:
1. authenticateToken - middleware1 → Check whether the user has a valid JWT token
2. authorizeRoles("admin") - middleware2 → Check whether the logged-in user's role is "admin"
3. searchStudentsByRoll -middleare3→ If authentication + authorization succeed, execute the actual student search
*/
studentRouter.get("/search-by-roll", authenticateToken, authorizeRoles("admin"), searchStudentsByRoll);

export default studentRouter;
