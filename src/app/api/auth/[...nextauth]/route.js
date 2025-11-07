import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

export const authOptions = {
  // Enable debug logging to help diagnose OAuthCallback issues
  debug: true,
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
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
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
          NODE_ENV: process.env.NODE_ENV
        });
        await dbConnect();
        console.log("OAuth user data:", { user, account, profile });
        if (account && (account.provider === "google" || account.provider === "github")) {
          // Robust email extraction: NextAuth/provider shapes vary, check multiple places
          const userEmail = user && user.email;
          const profileEmail = profile && profile.email;
          const oauthProfileEmail = profile && profile.OAuthProfile && profile.OAuthProfile.email;
          const githubEmail = profile && profile.emails && profile.emails[0] && profile.emails[0].value;

          let email = userEmail || profileEmail || oauthProfileEmail || githubEmail || null;
          console.log("Resolved email sources:", { userEmail, profileEmail, oauthProfileEmail, githubEmail, resolved: email });
          if (!email) {
            console.warn("OAuth provider did not return an email; skipping DB user create.");
            return true;
          }
          const existingUser = await User.findOne({ email });
          if (!existingUser) {
            // Generate a valid, unique username
            let baseUsername = (user && user.name) || (email ? email.split("@")[0] : "user");
            baseUsername = baseUsername.replace(/\s+/g, "");
            if (baseUsername.length < 3) baseUsername += Math.random().toString(36).slice(-3);
            let username = baseUsername;
            let attempts = 0;
            while (await User.findOne({ username })) {
              username = `${baseUsername}${Math.floor(Math.random() * 10000)}`;
              attempts++;
              if (attempts > 10) throw new Error("Could not generate unique username");
            }
            // Create user for OAuth provider WITHOUT storing a local password
            const newUserPayload = {
              email,
              username,
              avatarUrl: (user && user.image) || (profile && profile.picture) || null,
              // password intentionally omitted for OAuth-only users
              emailVerified: true,
              name: (user && user.name) || (profile && profile.name) || username,
            };
            console.log("Creating user with payload:", newUserPayload);
            const created = await User.create(newUserPayload);
            console.log("OAuth user created successfully:", {
              id: created._id.toString(),
              email: created.email,
              username: created.username
            });
            
            // Verify user was created
            const verifyUser = await User.findOne({ email });
            if (!verifyUser) {
              console.error("CRITICAL: User creation verification failed!");
              return false;
            }
            console.log("User creation verified:", verifyUser._id.toString());
          } else {
            console.log("Existing user found:", {
              id: existingUser._id.toString(),
              email: existingUser.email
            });
          }
        }
        return true;
      } catch (err) {
        // Returning false causes NextAuth to redirect with error=OAuthCallback.
        // In an OAuth-only app we prefer to allow sign-in even if DB write fails
        // (admins can reconcile users later). This avoids a broken UX.
        console.error("OAuth signIn error (continuing sign-in):", err);
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
      // Always redirect to /home after login/signup
      return baseUrl + "/home";
    }
  }
};

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);