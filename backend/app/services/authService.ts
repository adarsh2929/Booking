import { NextFunction,Request, Response } from "express";
import { DefaultResponse } from "../helper/defaultResponse";
import { CustomError } from "../helper/customError";
import { authRepo } from "../repository/authRepo";
import sendEmail from "../helper/emailHelper";
import { comparePassword, hashPassword } from "../helper/passwordHelper";
import { generateAccessToken, verifyAccessToken } from "../helper/tokenHelper";


const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, email, password } = req.body;
  
      // Check if email already exists
      const emailExists = await authRepo.checkEmailExists(email);
      if (emailExists) {
        throw new CustomError(400, "Email already exists");
      }
  
      // Hash password
      const hashedPassword = await hashPassword(password);
  
      // Create user
      

      const accessToken = generateAccessToken({
        email
      });

  
      // Send verification email
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationLink = `${frontendUrl}/verify?accessToken=${accessToken}`;
      
      const emailResponse = await sendEmail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        html: `
          <h1>Welcome to our application!</h1>
          <p>Hi ${firstName},</p>
          <p>Thank you for registering. Please verify your email by clicking the link below:</p>
          <a href="${verificationLink}">Verify Email</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });

      if(emailResponse.success == true){
        const user = await authRepo.createUser({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          accessToken
        });
        return DefaultResponse(res, 201, "User created successfully. Verification email sent.");
      }else{
        throw new CustomError(500, "Failed to send verification email");
      }
  
    } catch (err) {
      next(err);
    }
  };


  const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      
      // Check if user exists
      const user = await authRepo.checkEmailExists(email);
      if (!user) {
        throw new CustomError(401, "Invalid email or password");
      }
      
      // Check if user verified email
      if (!user.isVerified) {
        throw new CustomError(403, "Please verify your email before logging in");
      }
      
      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError(401, "Invalid email or password");
      }

      const accessToken = generateAccessToken({
        id: user.id,
      });
      
      // Create user object without password to return
      const data = {
        id: user.id,
        accessToken,
      };
      
      return DefaultResponse(res, 200, "Login successful", data);
    } catch (err) {
      next(err);
    }
  };

  const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken,email } = req.body;

      const verified:any = verifyAccessToken(accessToken);
      if(!verified){
        throw new CustomError(401, "Invalid access token");
      }



      const verifiedEmail = verified.email;

      const verifyEmail = await authRepo.checkEmailExists(verifiedEmail);
      if(!verifyEmail){
        throw new CustomError(400, "Invalid email");
      }

      if(verifyEmail.accessToken !== accessToken){
        throw new CustomError(400, "Token expired");
      }
      
      // Check if email matches
      if (verifyEmail.email !== email) {
        throw new CustomError(400, "Invalid email");
      }

     

      await authRepo.updateUserVerification(verifyEmail.id);


      return DefaultResponse(res, 200, "Email verified successfully");
    } catch (err) {
      next(err);
    }
  }
  



export const authService = {
    createUser,
    loginUser,
    verifyEmail
}