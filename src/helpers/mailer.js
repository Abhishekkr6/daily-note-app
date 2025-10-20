import nodemailer from "nodemailer";


export const sendEmail = async ({ email, emailType, userId, token, resetUrl, extraData = {} }) => {
  try {
    // 1. Gmail SMTP transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    });

    // 2. Prepare email HTML and subject for each notification type
    let htmlContent = "";
    let subject = "";
    switch (emailType) {
      case "RESET":
        subject = "Reset your password";
        htmlContent = `<p style="font-family:sans-serif;font-size:16px;">Click <a href="${resetUrl}">here</a> to reset your password<br>or copy and paste the link below in your browser.<br><br><span style='color:#555;'>${resetUrl}</span></p>`;
        break;
      case "TASK_REMINDER":
        subject = "Task Reminder: Stay on Track!";
        htmlContent = `<p style="font-family:sans-serif;font-size:16px;">Dear User,<br><br>This is a friendly reminder about your upcoming task: <b>${extraData.taskTitle || "Task"}</b>.<br>Due: <b>${extraData.dueDate || "soon"}</b>.<br><br>Stay productive!<br><br>Best regards,<br>Daily Note Team</p>`;
        break;
      case "DAILY_DIGEST":
        subject = "Your Daily Progress Summary";
        htmlContent = `<p style="font-family:sans-serif;font-size:16px;">Hello,<br><br>Here's your daily summary:<br>${extraData.summary || "No activity today."}<br><br>Keep up the great work!<br>Daily Note Team</p>`;
        break;
      case "WEEKLY_REPORT":
        subject = "Your Weekly Productivity Report";
        htmlContent = `<p style="font-family:sans-serif;font-size:16px;">Hi,<br><br>Your weekly report is here:<br>${extraData.report || "No data available."}<br><br>Wishing you a productive week ahead!<br>Daily Note Team</p>`;
        break;
      case "STREAK_ALERT":
        subject = "Streak Alert: Keep Your Momentum!";
        htmlContent = `<p style="font-family:sans-serif;font-size:16px;">Congratulations!<br><br>You are on a <b>${extraData.streakCount || 1}-day</b> productivity streak.<br>Keep it going!<br><br>Best,<br>Daily Note Team</p>`;
        break;
      case "FOCUS_BREAK":
        subject = "Time for a Break!";
        htmlContent = `<p style="font-family:sans-serif;font-size:16px;">Hi,<br><br>It's time to take a short break and recharge.<br>Remember, regular breaks help maintain focus and productivity.<br><br>Take care,<br>Daily Note Team</p>`;
        break;
      default:
        subject = "Notification from Daily Note";
        htmlContent = `<p style="font-family:sans-serif;font-size:16px;">You have a new notification.</p>`;
    }

    // 3. Send mail
    const mailOptions = {
      from: `"Daily Note" <${process.env.EMAIL_SMTP_USER}>`,
      to: email,
      subject,
      html: htmlContent,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error.message);
  }
};
