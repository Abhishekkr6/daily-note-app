// Simple test to verify NextAuth configuration
import { authOptions } from "../[...nextauth]/route";

export async function GET(req) {
  try {
    const config = {
      hasGoogleProvider: !!authOptions.providers.find(p => p.id === 'google'),
      hasGitHubProvider: !!authOptions.providers.find(p => p.id === 'github'),
      hasSecret: !!authOptions.secret,
      trustHost: authOptions.trustHost,
      sessionStrategy: authOptions.session?.strategy,
      environment: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "Set" : "Missing",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Set" : "Missing",
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Missing",
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? "Set" : "Missing",
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? "Set" : "Missing",
        NODE_ENV: process.env.NODE_ENV
      },
      expectedCallbackUrls: {
        google: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        github: `${process.env.NEXTAUTH_URL}/api/auth/callback/github`
      }
    };
    
    return Response.json(config);
  } catch (error) {
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
