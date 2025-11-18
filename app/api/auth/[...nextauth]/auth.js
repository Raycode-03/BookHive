import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb_auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { sendmessage } from "@/components/auth/message";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 3 * 24 * 60 * 60, // 3 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
      },
    },
  },
  providers: [GitHub, Google],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        const client = await clientPromise;
        const db = client.db();

        // Attempt to insert the user if not exists
        const result = await db.collection("users").findOneAndUpdate(
          { email: user.email },
          {
            $setOnInsert: {
              name: user.name,
              email: user.email,
              isAdmin: false,
              packageType: "free",
              createdAt: new Date(),
            },
          },
          { upsert: true, returnDocument: "after" }
        );

        // Check if the user was truly new
        if (result.lastErrorObject?.updatedExisting === false) {
          // Send welcome email only once
          await sendmessage(user.email, user.name);
          console.log("Welcome email sent to:", user.email);
        }
      } catch (err) {
        console.error("Sign-in error:", err);
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Set token on initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image ?? "";
        token.isAdmin = user.isAdmin ?? false;
        token.packageType = user.packageType ?? "free";
        token.exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      }

      // Refresh user data from DB on each request
      if (token.sub) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const dbUser = await db.collection("users").findOne({ email: token.email });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.image = dbUser.image ?? "";
            token.isAdmin = dbUser.isAdmin ?? false;
            token.packageType = dbUser.packageType ?? "free";
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }

      // Update token if session update trigger
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.isAdmin = token.isAdmin;
        session.user.packageType = token.packageType;
      }
      return session;
    },

    async redirect({ url }) {
      const redirectBaseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      if (url.startsWith("/")) return `${redirectBaseUrl}${url}`;
      else if (new URL(url).origin === redirectBaseUrl) return url;
      return redirectBaseUrl;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
});