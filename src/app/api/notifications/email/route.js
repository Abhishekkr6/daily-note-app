import { NextResponse } from "next/server";
import { sendEmail } from "@/helpers/mailer";

// POST /api/notifications/email
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, notificationType, extraData } = body;
    if (!email || !notificationType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    // Map notificationType to mailer emailType
    let emailType = "";
    switch (notificationType) {
      case "taskReminders":
        emailType = "TASK_REMINDER";
        break;
      case "dailyDigest":
        emailType = "DAILY_DIGEST";
        break;
      case "weeklyReport":
        emailType = "WEEKLY_REPORT";
        break;
      case "streakAlerts":
        emailType = "STREAK_ALERT";
        break;
      case "focusBreaks":
        emailType = "FOCUS_BREAK";
        break;
      default:
        emailType = "GENERIC";
    }
    await sendEmail({ email, emailType, extraData });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
