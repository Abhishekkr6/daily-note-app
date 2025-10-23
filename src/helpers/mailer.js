import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Email (Production Ready using Resend)
 * @param {Object} options
 * @param {string} options.email - recipient email
 * @param {string} options.emailType - email type (RESET, TASK_REMINDER, etc.)
 * @param {string} [options.userId] - optional user ID
 * @param {string} [options.token] - optional token
 * @param {string} [options.resetUrl] - reset link (for RESET type)
 * @param {Object} [options.extraData] - additional template data
 */
export const sendEmail = async ({
  email,
  emailType,
  userId,
  token,
  resetUrl,
  extraData = {},
}) => {
  try {
    // 1️⃣ Prepare email subject and HTML (same as before)
    let htmlContent = "";
    let subject = "";

    switch (emailType) {
      case "RESET":
        subject = "Reset your password";
        htmlContent = `<p style="font-family:sans-serif;font-size:16px;">Click <a href="${resetUrl}">here</a> to reset your password<br>or copy and paste the link below in your browser.<br><br><span style='color:#555;'>${resetUrl}</span></p>`;
        break;
      case "LOGIN_SUCCESS":
        subject = "Login Successful 🎉";
        htmlContent = `<p style="font-family:sans-serif;font-size:16px;">Hi <b>${extraData.username || "User"}</b>,<br><br>You have successfully logged in to <b>Daily Note</b>.<br>Time: ${extraData.loginTime || "now"}</p>`;
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

    // 2️⃣ Send mail through Resend
    const data = await resend.emails.send({
      from: "Daily Note <onboarding@resend.dev>", // use this for testing
      // ✅ Once your domain is verified, replace it with your domain address:
      // from: "Daily Note <noreply@yourdomain.com>",
      to: email,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent:", data);
    return data;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw new Error(error.message);
  }
};
