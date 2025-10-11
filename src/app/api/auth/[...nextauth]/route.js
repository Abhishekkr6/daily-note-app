import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connect as dbConnect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect();
        console.log("OAuth user data:", user, account, profile);
        if (account.provider === "google" || account.provider === "github") {
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            // Generate a valid, unique username
            let baseUsername = (user.name || user.email.split("@")[0] || "user").replace(/\s+/g, "");
            if (baseUsername.length < 3) baseUsername += Math.random().toString(36).slice(-3);
            let username = baseUsername;
            let attempts = 0;
            while (await User.findOne({ username })) {
              username = `${baseUsername}${Math.floor(Math.random()*10000)}`;
              attempts++;
              if (attempts > 10) throw new Error("Could not generate unique username");
            }
            // Generate random password for OAuth users
            const randomPassword = Math.random().toString(36).slice(-12);
            await User.create({
              email: user.email,
              username,
              avatarUrl: user.image,
              password: randomPassword,
              emailVerified: true,
              name: user.name || username,
            });
            console.log("OAuth user created:", user.email, username);
          }
        }
        return true;
      } catch (err) {
        console.error("OAuth signIn error:", err);
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      // Add user info to token on sign in
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token info to session
      if (token) {
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
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