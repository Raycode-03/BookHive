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

        // First, check if there's an existing account with this email but different provider
        if (account) {
          const existingUser = await db.collection("users").findOne({ 
            email: user.email 
          });

          if (existingUser) {
            // Check if this provider is already linked to this user
            const existingAccount = await db.collection("accounts").findOne({
              userId: existingUser._id,
              provider: account.provider
            });

            if (!existingAccount) {
              // Email exists but with different provider - link the new provider
              await db.collection("accounts").insertOne({
                userId: existingUser._id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
                expires_at: account.expires_at,
              });

              // Update user name/image if they're logging in for the first time with this provider
              await db.collection("users").updateOne(
                { _id: existingUser._id },
                { 
                  $set: { 
                    name: user.name || existingUser.name,
                    image: user.image || existingUser.image,
                    updatedAt: new Date()
                  } 
                }
              );

              return true;
            }
          }
        }

        // If no existing user or account exists, create/update the user
        const result = await db.collection("users").findOneAndUpdate(
          { email: user.email },
          {
            $setOnInsert: {
              name: user.name,
              email: user.email,
              image: user.image,
              isAdmin: false,
              packageType: "free",
              createdAt: new Date(),
            },
            $set: {
              updatedAt: new Date(),
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
        return false;
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
      if (token.email) {
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

    async redirect({ url, baseUrl }) {
      // Use only NEXTAUTH_URL in production, no fallback
      const redirectBaseUrl = process.env.NEXTAUTH_URL;
      
      if (!redirectBaseUrl) {
        console.error("NEXTAUTH_URL environment variable is not set");
        // Return to root path without hostname
        return "/";
      }
      
      // If no URL is provided or it's a relative path, redirect to home
      if (!url || url.startsWith("/")) {
        return `${redirectBaseUrl}/`;
      }
      
      // If URL is from the same origin, allow it
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === redirectBaseUrl) {
          return url;
        }
      } catch {
        // Invalid URL, redirect to home
      }
      
      return `${redirectBaseUrl}/`;
    },
  },

  pages: {
    signIn: '/login',
    error: '/error',
  },

  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});