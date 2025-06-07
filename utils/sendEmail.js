
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);

export async function sendVerificationEmail(to, token) {
  const url = `http://localhost:5000/api/auth/verify-email/${token}`;
  await transporter.sendMail({
    from: `"Quiz System" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your email",
    html: `<p>Please click the link to verify your email: <a href="${url}">${url}</a></p>`,
  });
}
