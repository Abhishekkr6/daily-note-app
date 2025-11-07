import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export async function GET(req) {
  try {
    // Test 1: MongoDB Connection
    console.log("Testing MongoDB connection...");
    await connect();
    console.log("✅ MongoDB connected");
    
    // Test 2: Find a user
    const testEmail = new URL(req.url).searchParams.get('email');
    
    if (testEmail) {
      console.log("Looking for user with email:", testEmail);
      const user = await User.findOne({ email: testEmail });
      
      if (user) {
        return Response.json({
          success: true,
          message: "User found",
          user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            name: user.name
          }
        });
      } else {
        return Response.json({
          success: true,
          message: "User not found",
          user: null
        });
      }
    }
    
    // Test 3: Count users
    const userCount = await User.countDocuments();
    
    return Response.json({
      success: true,
      message: "Database connection successful",
      totalUsers: userCount,
      mongoURI: process.env.MONGO_URI ? "Set (hidden)" : "Missing",
      connectionStatus: "Connected"
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
      mongoURI: process.env.MONGO_URI ? "Set (hidden)" : "Missing"
    }, { status: 500 });
  }
}
