import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function GET(req) {
  try {
    // Get token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Get session
    const session = await getServerSession(authOptions);
    
    return Response.json({
      hasToken: !!token,
      hasSession: !!session,
      token: token ? {
        id: token.id,
        email: token.email,
        name: token.name,
        sub: token.sub,
      } : null,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
        }
      } : null,
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NODE_ENV: process.env.NODE_ENV,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
      }
    });
  } catch (error) {
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
