import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,       
    pass: process.env.GMAIL_APP_PASSWORD  
  }
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error with SMTP configuration:', error);
  } else {
    console.log("Server is ready to send emails");
  }
});

const sendEmail = async (options: nodemailer.SendMailOptions): Promise<{success: boolean}> => {
  try {
    await transporter.sendMail(options);
    console.log("Email sent successfully to:", options.to);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false };
  }
};

export default sendEmail