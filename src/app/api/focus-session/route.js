import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/dbConfig/dbConfig';
import Task from '@/models/taskModel';
import User from '@/models/userModel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Zod schemas
const startSessionSchema = z.object({
  taskId: z.string(),
  duration: z.number().min(1).max(180), // 1-180 minutes
});

const completeSessionSchema = z.object({
  taskId: z.string(),
  sessionId: z.string(),
});

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parse = startSessionSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { taskId, duration } = parse.data;
  // Find task and check ownership
  const task = await Task.findById(taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  if (String(task.user) !== String(session.user._id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Add new focus session
  const newSession = {
    startedAt: new Date(),
    duration,
    completed: false,
  };
  task.focusSessions = task.focusSessions || [];
  task.focusSessions.push(newSession);
  await task.save();
  return NextResponse.json({ session: task.focusSessions[task.focusSessions.length - 1] });
}

export async function PATCH(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const parse = completeSessionSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { taskId, sessionId } = parse.data;
  // Find task and check ownership
  const task = await Task.findById(taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }
  if (String(task.user) !== String(session.user._id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // Find session
  const focusSession = task.focusSessions?.id(sessionId);
  if (!focusSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  if (focusSession.completed) {
    return NextResponse.json({ error: 'Session already completed' }, { status: 400 });
  }
  focusSession.completed = true;
  focusSession.completedAt = new Date();
  await task.save();
  // Mark task as complete (optional, can be conditional)
  task.completed = true;
  await task.save();
  // Update user stats
  const user = await User.findById(session.user._id);
  if (user) {
    user.totalFocusSessions = (user.totalFocusSessions || 0) + 1;
    user.minutesFocused = (user.minutesFocused || 0) + focusSession.duration;
    user.lastFocusSessionAt = new Date();
    await user.save();
  }
  return NextResponse.json({ success: true });
}
