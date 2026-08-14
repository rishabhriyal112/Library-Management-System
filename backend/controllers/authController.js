import { User } from "../models/User.js";
import { generate } from "otp-generator";
import sendOtp from "../utils/sendOTP.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

//registration of a student step 1 : register user and send otp
export async function registerUser(req, res) {
    /*
    1) It validates the user's name, email, phone, and password, and ensures the phone number has exactly 10 digits.
    2) It checks whether the email already exists. Verified users are rejected, while unverified users are deleted so they can register again.
    3) It generates a 6-digit OTP, sends it to the user's email, and sets the OTP to expire in 5 minutes.
    4) It hashes the password using bcrypt and generates a unique student ID.
    5) Finally, it saves the user in the database and returns a success response.
    */
    try {
        const { name, email, phone, password } = req.body;

        // If email is empty
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are Required"
            });
        }

        /*
        --Check if 'phone' has a value.
        --If it exists, convert it to a string and remove all non-digit characters -   "/\D/g"   is a regular expression:
        \D = matches any character that is NOT a digit (0-9)
        g  = global, so it finds ALL non-digit characters
        "" = replace those non-digit characters with nothing
        Example: "+91 (987)-654" becomes "91987654".
       -- If it doesn't exist (null, undefined, empty string, etc.), use an empty string.
        
        */
        const cleanPhone = phone ? phone.toString().replace(/\D/g, "") : "";

        //If phone number is not equal to 10 digits then it show this
        if (cleanPhone.length !== 10) {
            return res.status(400).json({ message: "Mobile Number must be exactly of 10 digits" })
        }

        // Find the first user with the given email
        const existingUser = await User.findOne({ email });

        // If the user exists and is already verified (isVerified is a field inside the User model that checks if the user is verified), return an error
        if (existingUser) {
            if (existingUser?.isVerified)
                return res.status(400).json({ message: "User already exists" });

            // User has an account but never verified it
            await User.deleteOne({ email });
        }

        /*
        Generate a 6-character OTP
        Don't include uppercase,lowercase letters and special characters
        Because all letters and special characters are disabled, the OTP will contain only numbers.
        */
        const otp = generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        //to send otp
        try {
            // Try to send the OTP to the user's email
            // email and otp are passed to the sendOtp() function from utils 
            await sendOtp(email, otp);
        } catch (emailError) {
            console.error("Error sending OTP email : ", emailError)
            return res.status(500).json({
                message: "Failed to send OTP email. Please try again"
            })
        }

        //Using bcrypt to hash the plain password with 10 salt rounds
        const hashedPassword = await bcrypt.hash(password, 10);

        /* Create an expiry time for the OTP.
        Date.now() = current time in milliseconds.
        5 * 60 * 1000 = 5 minutes in milliseconds.
        So the OTP will expire after 5 minutes. */
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);


        /*  
        Generate a unique student ID.
        uuidv4() generates a unique ID.
        slice(0, 8) takes the first 8 characters.
        toUpperCase() converts them to uppercase.
        Example: "ST-A7F29C81"            
        */
        const studentId = `ST-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Create a new user in the User collection/database
        // The values come from the variables created earlier
        const user = await User.create({
            name,
            email,
            phone: cleanPhone,
            password: hashedPassword,
            otp,
            otpExpiry,
            studentId
        });

        // Send a success response to the frontend
        // 201 means the resource/user was successfully created
        res.status(201).json({
            message: "User Registered Successfully, OTP sent to email"
        })


    } catch (error) {
        // If something goes wrong while registering the user, print the actual error in the server console
        console.error("Error Registering user : ", error);

        // Send an error response to the frontend
        // 500 means Internal Server Error
        res.status(500).json({
            message: "Error registering user ", error: error.message
        })
    }
}

//Step2 : Verify the OTP
export async function verifyOtp(req, res) {

    /*
    1) It gets the email and OTP from the frontend and checks that the email is provided.
    2) It finds the user in the database using their email.
    3) It checks whether the entered OTP matches the stored OTP and whether it has not expired.
    4) If valid, it marks the user as verified (isVerified: true) and clears the OTP and expiry time.
    5) Finally, it saves the updated user and sends a success response.
*/
    try {

        // Get the email and OTP entered by the user from the frontend
        const { email, otp } = req.body;

        // Check if email is provided
        // If email is missing, stop the function and send an error
        if (!email) return res.status(400).json({ message: "Email is Required." });

        // Find the user in the database using their email
        // await waits for MongoDB to return the user
        const user = await User.findOne({ email });

        // If no user is found with this email,
        // stop the function and tell the frontend
        if (!user) return res.status(400).json({ message: "User Not found" });

        // Check if the OTP entered by the user is different
        // from the OTP stored in the User model
        //--------------------------------------------------------
        // Also check if the current time is greater than
        // the OTP expiry time
        //--------------------------------------------------------
        // If either condition is true, the OTP is invalid or expired
        if (user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP is correct and has not expired
        //----------------------------------------
        // isVerified is a field inside the User model.
        // Set it to true because the user successfully verified their OTP.
        //------------------------------------------
        // OTP and otpExpiry are no longer needed,
        // so set them to null.
        Object.assign(user, { isVerified: true, otp: null, otpExpiry: null });

        // Save the updated user in the database
        await user.save();
        res.status(200).json({ message: "OTP verified Successfully" });

    } catch (error) {
        console.error("Error verifying OTP ", error);

        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
}

//Setp3 : Complete profile
export async function completeProfile(req, res) {
    try {
        const { email, department, stream, semester, year, rollNo } = req.body;

        if (!email || !department || !stream || !semester || !year || !rollNo) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find the user in the database using their email
        // await waits for MongoDB to return the user
        const user = await User.findOne({ email });

        // If no user is found with this email,
        // stop the function and tell the frontend
        if (!user) return res.status(400).json({ message: "User Not found" });
        if (!user.isVerified) return res.status(400).json({ message: "User not verified" });

        // User is verified, so add/update their profile information.
        // These fields are taken from the request and added to the user.
        Object.assign(user, { department, stream, semester, year, rollNo, isProfileComplete: true });

        // Save the updated profile information in the database.
        await user.save();
        return res.status(200).json({ message: "Profile Compeleted Successfully" });

    } catch (error) {
        console.error("Error while Completing the Profile : ", error);
        res.status(500).json({ message: "Error while Completing Profile", error: error.message });
    }
}

//Step4 : Login as a Student
export async function LoginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: "Please verify your email with OTP before logged In" })
        }

        // Compare the password entered by the user with the hashed password
        // stored in the database.
        //--------------------------------------------------------------
        // password = password entered during login
        // user.password = hashed password stored in User model
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" });
        }

        // If the password is correct,
        // create a JWT token for the logged-in user.
        //
        // id = user's MongoDB _id
        // role = user's role (for example: student/admin)
        // JWT_SECRET = secret key stored in .env
        // expiresIn: "7d" = token will expire after 7 days
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Remove the password from the user object before sending it
        // to the frontend.
        //-------------------------------------------------------------
        // password: _ means rename password to "_".
        // ...userResponse means copy all the remaining user information.
        // .toObject() converts the Mongoose user document into a normal JavaScript object.
        const { password: _, ...userResponse } = user.toObject();

        // Send token and user details to the frontend.
        res.status(200).json({ success: true, token, user: userResponse });


    } catch (error) {
        console.error("Error during Login : ", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Step 5 : Fetch Logged-In User Profile
export async function getProfile(req, res) {
    try {

        // req.user._id contains the ID of the logged-in user.
        // This user information is usually added to req.user
        // by the authentication middleware after checking the JWT token.
        //
        // findById() finds that user in MongoDB.
        // select("-password") means don't include the password
        // in the result.
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        // User was found.
        // Send the user's profile information to the frontend.
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching User Profile : ", error);
        res.status(500).json({ message: "Error fetching user profile ", error: error.message })
    }
}

//Step 6 : Update User Profile
export async function updateProfile(req, res) {
    try {
        const { name, email, phone, department, stream, semester, academicYear, rollNo } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(400).json({ message: "User not found" });

        if (email) {
            // Remove extra spaces from email and convert it to lowercase
            // Example: " Rahul@GMAIL.COM " → "rahul@gmail.com"
            const normalizedEmail = email.trim().toLowerCase();

            // Check if the new email is different from the current user's email
            if (normalizedEmail !== user.email.toLowerCase()) {

                // Check if the logged-in user is a student
                // Students are not allowed to change their email
                if (user.role === "user") {
                    return res.status(400).json({ message: "Students are not allowed to change their email address" });
                }

                // Check if another user already has this email
                // $ne means "not equal to"
                // So, ignore the current user's own ID while checking
                const emailExists = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });

                // If another user already has this email,
                // stop the update and send an error
                if (emailExists) {
                    return res.status(400).json({ message: "Email Already in Use" });
                }

                // If the email is available,
                // update the user's email
                user.email = normalizedEmail;
            }
        }

        if (phone) {

            // Convert the phone number to a string
            // and remove all characters that are not digits.
            // Example: "+91-98765 43210" → "919876543210"
            const cleanPhone = phone.toString().replace(/\D/g, "");

            // Check if the phone number has exactly 10 digits
            if (cleanPhone.length !== 10) {
                return res.status(400).json({ message: "Mobile must be exactly 10 digits" });
            }

            //update the user phone number
            user.phone = cleanPhone;
        }

        if (name) user.name = name;
        if (department) user.department = department;
        if (stream) user.stream = stream;
        if (semester) user.semester = semester;
        if (academicYear) user.year = academicYear;
        if (rollNumber) user.rollNo = rollNumber;

        await user.save(); //updated Profile

        res.status(200).json({ success: true, message: "Profile Updated Successfully", user });
    } catch (error) {
        console.error("Error updating Profile : ", error);
        res.status(500).json({ message: "Error updating Profile ", error: error.message });
    }
}


//to get all student account ( by admin)
export async function getUsers(req, res) {
    try {
        const users = await User.find({ role: "user", isVerified: true, isProfileComplete: true }).select("-password");
        res.status(200).json({ success: true, users })
    } catch (error) {
        console.error("Error fetching Students : ", error);
        res.status(500).json({ message: "Error fetching Students", error: error.message });
    }
}

//for admin registration
export async function registerAdmin(req, res) {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: "User Already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create(
            {
                name,
                email: email.trim().toLowerCase(),
                phone,
                password: hashedPassword,
                role: "admin",
                isVerified: true
            });

        const {password: _ , ...adminResponse} = admin.toObject();
        res.status(200).json({success: true, message : "Admin Registered Successfully", user: adminResponse });
    } catch (error) {
        console.error("Error registering admin : ", error);
        res.status(500).json({message : "Error registering admin", error : error.message});
    }
}
