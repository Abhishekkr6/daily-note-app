import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export const authOptions = {
  // Enable debug logging to help diagnose OAuthCallback issues
  debug: true,
  // CRITICAL for Vercel deployment
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Simplified cookie configuration for Vercel
  useSecureCookies: process.env.NODE_ENV === 'production',
  pages: { signIn: "/login" },
  // Surface NextAuth internal errors to server logs so we can triage OAuth failures
  events: {
    error(message) {
      console.error("NextAuth event error:", message);
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("=== OAuth SignIn Callback Started ===");
        console.log("Environment:", {
          NEXTAUTH_URL: process.env.NEXTAUTH_URL,
          NODE_ENV: process.env.NODE_ENV,
          hasMongoDB: !!process.env.MONGO_URI
        });
        console.log("OAuth user data:", { 
          email: user?.email, 
          name: user?.name,
          provider: account?.provider 
        });
        
        // Connect to database
        try {
          await dbConnect();
          console.log("✅ Database connected successfully");
        } catch (dbError) {
          console.error("❌ Database connection failed:", dbError);
          // IMPORTANT: Allow sign-in even if DB fails (user won't be saved but can still use the app)
          return true;
        }
        
        if (account && (account.provider === "google" || account.provider === "github")) {
          // Robust email extraction: NextAuth/provider shapes vary, check multiple places
          const userEmail = user && user.email;
          const profileEmail = profile && profile.email;
          const oauthProfileEmail = profile && profile.OAuthProfile && profile.OAuthProfile.email;
          const githubEmail = profile && profile.emails && profile.emails[0] && profile.emails[0].value;

          let email = userEmail || profileEmail || oauthProfileEmail || githubEmail || null;
          console.log("Resolved email sources:", { userEmail, profileEmail, oauthProfileEmail, githubEmail, resolved: email });
          
          if (!email) {
            console.warn("⚠️ OAuth provider did not return an email; allowing sign-in without DB save.");
            return true;
          }
          
          try {
            const existingUser = await User.findOne({ email });
            
            if (!existingUser) {
              console.log("📝 Creating new user for:", email);
              
              // Generate a valid, unique username
              let baseUsername = (user && user.name) || (email ? email.split("@")[0] : "user");
              baseUsername = baseUsername.replace(/\s+/g, "");
              if (baseUsername.length < 3) baseUsername += Math.random().toString(36).slice(-3);
              let username = baseUsername;
              let attempts = 0;
              
              while (await User.findOne({ username })) {
                username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
                attempts++;
                if (attempts > 10) {
                  console.error("❌ Could not generate unique username after 10 attempts");
                  throw new Error("Could not generate unique username");
                }
              }
              
              // Create user for OAuth provider WITHOUT storing a local password
              const newUserPayload = {
                email,
                username,
                avatarUrl: (user && user.image) || (profile && profile.picture) || null,
                emailVerified: true,
                name: (user && user.name) || (profile && profile.name) || username,
              };
              
              console.log("Creating user with payload:", newUserPayload);
              const created = await User.create(newUserPayload);
              console.log("✅ OAuth user created successfully:", {
                id: created._id.toString(),
                email: created.email,
                username: created.username
              });
              
              // Verify user was created
              const verifyUser = await User.findOne({ email });
              if (!verifyUser) {
                console.error("❌ CRITICAL: User creation verification failed!");
                // Still allow sign-in, but log the issue
                return true;
              }
              console.log("✅ User creation verified:", verifyUser._id.toString());
            } else {
              console.log("✅ Existing user found:", {
                id: existingUser._id.toString(),
                email: existingUser.email
              });
            }
          } catch (userError) {
            console.error("❌ Error in user find/create:", userError);
            console.error("Error details:", {
              message: userError.message,
              code: userError.code,
              name: userError.name
            });
            // Allow sign-in even if DB operation fails
            return true;
          }
        }
        
        console.log("✅ SignIn callback completed successfully");
        return true;
      } catch (err) {
        console.error("❌ OAuth signIn error:", err);
        console.error("Error stack:", err.stack);
        // Allow sign-in even if there are errors
        return true;
      }
    },
    async jwt({ token, user, account, profile, trigger }) {
      try {
        console.log("=== JWT Callback ===");
        console.log("Trigger:", trigger);
        console.log("Token before:", { id: token.id, email: token.email });
        
        // Add user info to token on sign in
        if (user) {
          token.email = user.email || token.email;
          token.name = user.name || token.name;
          token.picture = user.image || token.picture;
          console.log("User object present:", { email: user.email, name: user.name });
        }

        // CRITICAL: Always ensure token has the DB user id
        // This runs on every token refresh and initial sign-in
        if (token.email) {
          try {
            await dbConnect();
            // Load user from DB by email
            const dbUser = await User.findOne({ email: token.email }).select("_id avatarUrl name username email");
            
            if (dbUser) {
              // IMPORTANT: Set the id in token
              token.id = dbUser._id.toString();
              token.picture = dbUser.avatarUrl || token.picture;
              token.name = dbUser.name || token.name;
              token.username = dbUser.username || token.username;
              
              console.log("DB user found and token updated:", {
                id: token.id,
                email: token.email,
                name: token.name,
                username: token.username
              });
            } else {
              console.error("CRITICAL: No DB user found for email:", token.email);
            }
          } catch (e) {
            console.error("JWT callback DB lookup failed:", e);
          }
        }
        
        console.log("Token after:", { id: token.id, email: token.email });
      } catch (err) {
        console.error("JWT callback error (non-blocking):", err);
      }
      return token;
    },
    async session({ session, token }) {
      try {
        console.log("=== Session Callback ===");
        console.log("Token:", { id: token.id, email: token.email });
        
        // Ensure session.user exists
        session.user = session.user || {};
        
        if (token) {
          // CRITICAL: Add id to session.user so API routes can access it
          session.user.id = token.id;
          session.user.email = token.email || session.user.email;
          session.user.name = token.name || session.user.name;
          session.user.image = token.picture || session.user.image;
          session.user.username = token.username || session.user.username;
        }
        
        console.log("Session user:", {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        });
      } catch (err) {
        console.error("Session callback error (non-blocking):", err);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("=== Redirect Callback ===");
      console.log("URL:", url);
      console.log("Base URL:", baseUrl);
      
      // If already going to home, keep it
      if (url.includes('/home')) {
        return url;
      }
      
      // Always redirect to /home after login/signup
      const homeUrl = `${baseUrl}/home`;
      console.log("Redirecting to:", homeUrl);
      return homeUrl;
    }
  }
};

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);