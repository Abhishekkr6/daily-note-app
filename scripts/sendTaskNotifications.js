// Scheduled email notification sender for tasks
const mongoose = require('mongoose');
const Task = require('../src/models/taskModel').default || require('../src/models/taskModel');
const User = require('../src/models/userModel').default || require('../src/models/userModel');
const mailer = require('../src/helpers/mailer');
const dbConfig = require('../src/dbConfig/dbConfig');
const cron = require('node-cron');

async function connectDB() {
  await dbConfig.connect();
}

async function sendNotifications() {
  try {
    await connectDB();
    const now = new Date();
    const currentTime = now.toTimeString().slice(0,5); // "HH:MM"
    const todayStr = now.toISOString().slice(0,10);

    // Find all tasks for today with notificationTime matching current time
    const tasks = await Task.find({
      notificationTime: currentTime,
      status: 'today',
      dueDate: todayStr
    });

    for (const task of tasks) {
      if (!task.userId) {
        console.log(`Task ${task._id} has no userId.`);
        continue;
      }
      let user;
      try {
        user = await User.findById(task.userId);
      } catch (err) {
        console.error(`Error fetching user for task ${task._id}:`, err);
        continue;
      }
      if (!user || !user.email) {
        console.log(`User not found or missing email for task ${task._id}.`);
        continue;
      }
      // Send email
      try {
        await mailer.sendMail({
          to: user.email,
          subject: `Task Reminder: ${task.title}`,
          text: `This is a reminder for your task: ${task.title}\nDescription: ${task.description || ''}`
        });
        console.log(`Email sent to ${user.email} for task ${task.title}`);
      } catch (err) {
        console.error(`Error sending email to ${user.email} for task ${task._id}:`, err);
      }
      // Optionally, clear notificationTime so it doesn't send again
      // await Task.findByIdAndUpdate(task._id, { $unset: { notificationTime: "" } });
    }
  } catch (err) {
    console.error('General error in sendNotifications:', err);
  }
}

// Run every minute
cron.schedule('* * * * *', () => {
  sendNotifications().catch(console.error);
});

// For manual run/testing
if (require.main === module) {
  sendNotifications().then(() => {
    console.log('Notifications checked');
    process.exit(0);
  });
}
