import { auth } from "@/api/auth/[...nextauth]/auth"; // NextAuth handler
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongodb_auth";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET!;


// Helper to get custom JWT session
const getCustomSession = async () => {
  try {
    const cookieStore = await cookies(); // <-- await to fix error
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.userId, isCustom: true };
  } catch {
    return null;
  }
};

export const getUnifiedSession = async () => {
  const nextAuthSession = await auth();

  // NextAuth session flow
  if (nextAuthSession?.user) {
    return {
      user: {
        id: nextAuthSession.user.id!,
        name: nextAuthSession.user.name ?? "",
        email: nextAuthSession.user.email ?? "",
        image: nextAuthSession.user.image ?? "",
        isAdmin: nextAuthSession.user.isAdmin ?? false,
        packageType: nextAuthSession.user.packageType ?? "free",
      },
      source: "nextauth"
    };
  }

  // Custom JWT session flow
  const customSession = await getCustomSession();

  if (customSession) {
    try {
      const client = await clientPromise;
      const user = await client
        .db()
        .collection("users")
        .findOne({ _id: new ObjectId(customSession.id) });

      if (user) {
        return {
          user: {
            id: user._id.toString(),
            name: user.name ?? "",
            email: user.email ?? "",
            image: user.image ?? "",
            isAdmin: user.isAdmin ?? false,
            packageType: user.packageType ?? "free",
          },
          source: "custom",
        };
      }
    } catch (error) {
      console.error("Error fetching custom user:", error);
    }
  }

  return null;
};
