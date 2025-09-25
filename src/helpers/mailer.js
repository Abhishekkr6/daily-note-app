import nodemailer from "nodemailer";


export const sendEmail = async ({ email, emailType, userId, token, resetUrl }) => {
  try {
    // 1. Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });

    // 2. Prepare email HTML with provided resetUrl
    let htmlContent = "";
    if (emailType === "RESET") {
      htmlContent = `<p>Click <a href="${resetUrl}">here</a> to reset your password
      or copy and paste the link below in your browser.<br>
      ${resetUrl}
      </p>`;
    }

    // 3. Send mail
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
