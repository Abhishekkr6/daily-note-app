import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import User from "../models/userModel.js";

export const sendEmail = async ({ email, emailType, userId }) => {
  try {
    // 1. Generate plain random token
    const plainToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash token for DB
    const hashedToken = await bcryptjs.hash(plainToken, 10);

    // 3. Save hashed token in DB
    if (emailType === "RESET") {
      await User.findByIdAndUpdate(userId, {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: Date.now() + 3600000,
        },
      });
    }

    // 4. Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SMTP_USER, 
        pass: process.env.EMAIL_SMTP_PASS, 
      },
    });

    // 5. Prepare email HTML with PLAIN token
    let htmlContent = "";
    if (emailType === "RESET") {
      htmlContent = `<p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${plainToken}&email=${email}">here</a> to reset your password
      or copy and paste the link below in your browser.<br>
      ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${plainToken}&email=${email}
      </p>`;
    }

    // 6. Send mail
    const mailOptions = {
      from: `"Daily Note" <${process.env.EMAIL_SMTP_USER}>`,
      to: email,
    subject: "Reset your password",
      html: htmlContent,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error.message);
  }
};
