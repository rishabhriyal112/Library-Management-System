import { Issue } from "../models/Issue.js";
import { User } from "../models/User.js";
import { FineSetting } from "../models/FineSetting.js";

//Helper Functions
// 1. Convert a date into YYYY-MM-DD format
const getLocalIsoDate = (value = new Date()) => {
    // Convert the given value into a JavaScript Date object. If no value is provided, use the current date/time.
    const d = new Date(value);

    // Return the date in this format: YYYY-MM-DD. Example: 2026-08-14
    // getFullYear() → 2026, getMonth() + 1 → 8, getDate() → 14
    //padStart(2, "0") makes:
    // 8  → "08", 14 → "14"
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// 2. Get the START of a particular day
// Convert the value into a Date object and set the time to:
// Hours   = 0, Minutes = 0, Seconds = 0, Milliseconds = 0
// So: 14 August 2026, 6:30 PM becomes: 14 August 2026, 12:00 AM
const getStartOfDay = (value) => new Date(new Date(value).setHours(0, 0, 0, 0));

// 3. Calculate difference between two dates in DAYS
const getDiffInDays = (targetDateString) =>
    // 86,400,000 milliseconds = 1 day. Example:
    //Today       = August 14 || Target date = August 20
    // Difference = +6 days
    // If target date is August 10:
    // Difference = -4 days
    // Negative means the target date is in the PAST.
    Math.round((getStartOfDay(targetDateString) - getStartOfDay(new Date())) / 86400000);

// 4. Convert the number of overdue DAYS into fine units.
// Example:
// - If interval = "week", every 7 overdue days = 1 fine unit.
// - If interval = "month", every 30 overdue days = 1 fine unit.
// - If interval = "year", every 365 overdue days = 1 fine unit.
const getOverdueUnits = (overdueDays, interval) => {
    if (overdueDays <= 0) return 0; // If the book isn't overdue,  there are zero fine units.

    // Define how many days make up one fine unit depending on the selected interval.
    // week  -> 7 days || month -> 30 days || year  -> 365 days
    // If an unknown interval is provided, use 1 day as the default.
    const divisor = { week: 7, month: 30, year: 365 }[interval] || 1;

    // Divide overdue days by the interval's number of days.
    // Math.ceil() rounds UP so that even a partial unit
    // counts as one complete fine unit.
    //
    // Examples:
    // 8 overdue days / 7 = 1.14 -> 2 weeks (because of ceil)
    // 30 overdue days / 30 = 1 -> 1 month
    // 31 overdue days / 30 = 1.03 -> 2 months
    return Math.ceil(overdueDays / divisor);
};

// 5. Calculate the total fine for a book issue.
const calculateFine = (issue, fineRate = 10, fineInterval = "day") => {
    if (!issue || issue.fineCleared || issue.returnedOn) return 0;

    // Calculate how many days the book is overdue.
    // getDiffInDays(issue.dueDate) presumably calculates the difference between the due date and today.
    // The minus sign converts a negative value into positive overdue days.
    // Math.max(0, ...) ensures we never get negative overdue days.
    // Example:
    // Due 5 days ago -> -5 -> 5 overdue days
    // Due today      ->  0 -> 0 overdue days
    // Due tomorrow   ->  1 -> 0 overdue days
    const overdueDays = Math.max(0, -getDiffInDays(issue.dueDate));
    return getOverdueUnits(overdueDays, fineInterval) * fineRate + (Number(issue.manualFine) || 0);
};


//1) Issue manual books to a student
export async function issueManualBooks(req, res) {
    try {
        const { studentDetails, books } = req.body;

        // Make sure books is an array and at least one book is provided.
        if (!Array.isArray(books) || books.length === 0) {
            return res.status(400).json({ message: "No book were entered" });
        }

        // Find the student using their roll number.
        const student = await User.findOne({ rollNo: studentDetails.rollNumber })
        if (!student) return res.status(404).json({
            success: false,
            message: "Student not Found"
        });


        // Get today's date in local ISO format.
        const todayIso = getLocalIsoDate();

        // Keep only books with title, book code, and due date.
        const validBooks = books.filter(b => b.title && b.bookCode && b.dueDate);

        // Make sure at least one valid book was entered.
        if (validBooks.length === 0) {
            return res.status(400).json({
                message: "Please add at least one valid manual book entry with book code and  a due date"
            })
        }

        // Create an Issue record for every valid book at the same time.
        const createdIssues = await Promise.all(validBooks.map(book => Issue.create({
            source: "manual", // Mark the issue as manually entered.
            bookCode: book.bookCode.trim(), // Store the book code without extra spaces.
            title: book.title.trim(),   // Store the book title without extra spaces.
            userEmail: student.email,
            userName: student.name,
            issuedOn: todayIso,  // Store today's date as the issue date.
            dueDate: book.dueDate,   // Store the book's due date.
            returnedOn: null,  // Book has not been returned yet.
            fineRate: Number(book.fineRate ?? req.body.fineRate ?? 10),
            fineInterval: book.fineInterval ?? req.body.fineInterval ?? "day",
            manualFine: 0,  // No manual fine when the book is issued.
            fineCleared: false,
            clearedFineAmount: 0,
            department: studentDetails.department?.trim() || student.department || "General",
            stream: studentDetails.stream?.trim() || student.stream || "General",
            year: studentDetails.academicYear?.trim() || student.year || "1st Year",
            semester: studentDetails.semester?.trim() || student.semester || "Semester 1",
            rollNumber: studentDetails.rollNumber?.trim() || student.rollNo || "Not assigned",
            // Use the student's roll number as ID; if unavailable,
            // create a short ID from the student's MongoDB ID.
            studentId: student.rollNo || `ST-${student._id.toString().slice(-4)}`
        })));

        res.status(201).json({
            success: true,
            message: `${createdIssues.length} manual books issued successfully !`,
            count: createdIssues.length,
            issues: createdIssues
        });
    } catch (error) {
        console.error("Error issuing manual books : ", error);
        res.status(500).json({
            message: "Error issuing manual books", error: error.message
        })
    }
}

// 2) Get all manual issues(Admin)
export async function getIssues(req, res) {
    try {
        // Fetch all issues and sort newest issues first.
        const issues = await Issue.find({}).sort({ createdAt: -1 });
        // Send the fetched issues with a success response.
        res.status(200).json({
            success: true,
            issues
        });
    } catch (error) {
        console.error("Error fetching manual Issues : ", error);
        res.status(500).json({
            message: "Error fetching manual Issues ", error: error.message
        })
    }
}

//3) Get manual issues for logged-in Student
export async function getStudentIssues(req, res) {
    try {
        // Find only the issues belonging to the logged-in student.
        // using their email after converting it to lowercase and removing extra spaces.
        // Sort the results by creation date, with the newest issues first.
        const issues = await Issue.find({
            userEmail: req.user.email.toLowerCase().trim()
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, issues });
    } catch (error) {
        console.error("Error fetching Student Issues : ", error);
        res.status(500).json({ message: "Error fetching Student Issues ", error: error.message });
    }
}

// 4) Return issued manual book
export async function returnBook(req, res) {
    try {
        // Get the issue ID from the URL. Example route: /return-book/:id
        // If the URL is /return-book/64abc123, then req.params.id will contain "64abc123".
        const issue = await Issue.findById(req.params.id);
        if (!issue) return res.status(404).json({ message: "Issue record not found" });

        // Check if the book has already been returned.
        // returnedOn will contain a date if the book was already returned.
        // If it has a value, don't allow the same book to be returned again.
        if (issue.returnedOn) return res.status(400).json({
            message: "Book already returned"
        });

        issue.returnedOn = getLocalIsoDate(); // Set the current date as the book's return date. getLocalIsoDate() returns today's date in the required format.
        await issue.save();
        res.status(200).json({ success: true, message: "Book Returned Successfully !" });
    } catch (error) {
        console.error("Error returning manual book : ", error);
        res.status(500).json({
            message: "Error returning manual book", error: error.message
        });
    }
}

//5)Apply manual fine
export async function applyFine(req, res) {
    try {
        const fineAmount = Number(req.body.amount);
        if (Number.isNaN(fineAmount)) return res.status(400).json({ message: "Invalid fine amount" });

        const issue = await Issue.findById(req.params.id)
        if (!issue) return res.status(404).json({ message: "Issues Record not Found" });

        issue.manualFine = fineAmount;
        if (fineAmount > 0) issue.fineCleared = false
        await issue.save();

        res.status(200).json({
            success: true,
            message: "Manual fine applied successfully !"
        })
    } catch (error) {
        console.error("Error applying manual fine : ", error);
        res.status(500).json({
            message: "Error applying manual fine ", error: error.message
        });
    }
}

//6) Clear manual fine
export async function clearFine(req, res) {
    try {
        const issue = await Issue.findById(req.params.id)
        if (!issue) return res.status(404).json({ message: "Issues Record not Found" });

        Object.assign(issue, {
            manualFine: 0,
            fineCleared: true,
            clearedFineAmount: calculateFine(issue, issue.fineRate, issue.fineInterval)
        });
        await issue.save();

        res.status(200).json({
            success: true,
            message: "Fine Cleared Successfully !",
            issue
        })
    } catch (error) {
        console.error("Error clearing the manual fine", error);
        res.status(500).json({ message: "Error applying manual fine ", error: error.message });
    }
}

// 7) Get Active fine settings
export async function getFineSettings(req, res) {
    try {
        const settings = (await FineSetting.findOne({}) || (await FineSetting.create({ amount: 10, interval: "day" })));

        res.status(200).json({success : true, settings});
    } catch (error) {
        console.error("Error fetching fine settings : ",error);
        res.status(500).json({
            message : "Error clearing manual fine ", error : error.message
        });
    }
}

//8) To update the fine settings
export async function updateFineSettings(req,res){
    try {
        const {amount, interval} =req.body;
        let settings = await FineSetting.findOne({});

        if(settings){
            if(amount !== undefined) settings.amount = Number(amount);
            if(interval !== undefined) settings.interval = interval;
            await settings.save();
        }
        else{
            settings = await FineSetting.create({
                amount : Number(amount) || 10,
                interval : interval || "day"
            });
        }

        res.status(200).json({success: true, message : "Fine Settings updated successfully", settings});
    } catch (error) {
        console.error("Error updating fine settings : ", error);
        res.status(500).json({
            message : "Error updating fine settings ",error : error.message
        })
    }
}
