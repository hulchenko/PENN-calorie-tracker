import { getUserByEmail } from "@/db/userActions";
import { createSession } from "@/lib/session";
import { validateHashedPassword } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "User does not exist. Please sign up to proceed." },
        { status: 404 }
      );
    }

    const isPasswordCorrect = await validateHashedPassword(
      password,
      user?.password
    );

    if (isPasswordCorrect) {
      const sessionData = await createSession(user);
      return NextResponse.json(sessionData);
    } else {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "User login failed." }, { status: 500 });
  }
}
