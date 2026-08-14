import { createTransport } from "nodemailer";

/*
This is a helper function. It receives only the data it needs:
email = where to send the OTP
otp   = the OTP that should be sent
*/
const sendOtp = async(email, otp)=>{

    // Create a transporter. The transporter is responsible for connecting to Gmail and sending the email.
    const transporter = createTransport({
        service : "gmail",

        // Gmail credentials are stored in the .env file.
        auth : {
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        
        from : process.env.EMAIL_USER, // Email address of the sender
        to : email, // Email address of the user receiving the OTP
        subject : "Your OTP Code", // Subject shown in the user's inbox
        html : `<h2>Your OTP is ${otp}</h2>` // Subject shown in the user's inbox
    })
}

export default sendOtp;


/*
1) It receives the user's email and generated OTP as parameters.
2) It creates a Gmail Nodemailer transporter using email credentials stored in the .env file.
3) It sends an email containing the OTP to the user's email address.
4) The function is exported so it can be used in the registration controller.
*/
