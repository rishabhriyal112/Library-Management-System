import { User } from "../models/User.js";

//To search student by Rollno.
export async function searchStudentsByRoll(req, res) {
    try {
        // Get the "roll" value from the URL query parameter
        // Example URL:
        // students/search?roll=CS101
        // req.query.roll → "CS101"
        // String() makes sure the value is treated as a string
        // || "" means if roll doesn't exist, use an empty string
        // trim() removes extra spaces from the beginning and end
        // Example:
        // "   CS101   " → "CS101"
        const roll = String(req.query.roll || "").trim();

        // Check whether the user actually provided a roll number, !roll means:
        // "roll is empty / doesn't have a value"
        // If no roll number was provided,
        // return an empty students array instead of searching the database
        if (!roll) {
            return res.status(200).json({ success: true, students: [] })
        }

        // Create a Regular Expression (Regex) from the roll number, "i" means case-insensitive
        // Example: Searching for "cs101" can match:
        // "CS101",  "cs101" , "Cs101"
        const rollRegex = new RegExp(roll, "i");

        /*
        User.find() looks for users that satisfy ALL of the following conditions:
        1. role must be "user" → Only student accounts
        2. isProfileComplete must be true → Only students who completed their profile
        3. rollNo must match the regex → Find students whose roll number matches the search
        $regex is used for pattern matching. Example:
        Search: "CS10" .It can match:
        CS101, CS102, CS103
        4. Only select the fields that we actually need. This prevents unnecessary fields such as password, OTP, etc. from being returned
        5. Return maximum 12 students
        If 50 students match, only the first 12 are returned
        */
        const students = await User.find({
            role: "user",
            isProfileComplete: true,
            rollNo: { $regex: rollRegex }
        }).select("name email department stream semester year rollNo")
            .limit(12);

            
        // Convert the MongoDB documents into a simpler object
        // that is suitable for sending to the frontend
        const mappedStudents = students.map((student) => ({
            name: student.name,
            email: student.email,
            department: student.department || "",
            stream: student.stream || "",
            academicYear: student.year || "",
            semester: student.semester || "",
            rollNumber: student.rollNo || "",
        }));

        res.status(200).json({ success: true, students: mappedStudents });
    }

    catch (error) {
        console.log("Error searching student by rollno : ", error);
        res.status(500).json({ success: false, message: "Error searching students by rollno ", error : error.message})
    }
}
