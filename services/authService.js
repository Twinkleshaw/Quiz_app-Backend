import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { signupSchema, loginSchema } from "../Validations/userValidation.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

class AuthService {
  static async signup(userData) {
    // Validate input
    const validatedData = signupSchema.parse(userData);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    // Create user
    const user = new User(validatedData);
    await user.save();

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    user.verificationToken = verificationToken;
    await user.save();

    
    await sendVerificationEmail(user.email, verificationToken);
    console.log(`Verification token: ${verificationToken}`);

    return { user: user.toObject(), verificationToken };
  }

  static async verifyEmail(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error("Invalid token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return user;
  }

  static async login(credentials) {
    const validatedData = loginSchema.parse(credentials);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    if (!user.isVerified) {
      throw new Error("Please verify your email first");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return { token, user: user.toObject() };
  }
}

export default AuthService;
