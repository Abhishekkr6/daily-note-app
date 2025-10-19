import { connect } from "@/dbConfig/dbConfig";
import Template from "@/models/templateModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

// GET: fetch all templates for logged-in user
export async function GET(req) {
  await connect();
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const templates = await Template.find({ userId });
  return Response.json(templates);
}

// POST: create new template for logged-in user
export async function POST(req) {
  await connect();
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.name || !body.category || !body.type) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const template = await Template.create({
    ...body,
    userId,
  });
  return Response.json(template);
}

// PUT: update template by id
export async function PUT(req) {
  await connect();
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) return Response.json({ error: "Missing template id" }, { status: 400 });
  const updated = await Template.findOneAndUpdate(
    { _id: body.id, userId },
    { ...body },
    { new: true }
  );
  return Response.json(updated);
}

// DELETE: delete template by id
export async function DELETE(req) {
  await connect();
  let userId;
  try {
    userId = getDataFromToken(req);
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing template id" }, { status: 400 });
  await Template.deleteOne({ _id: id, userId });
  return Response.json({ success: true });
}
