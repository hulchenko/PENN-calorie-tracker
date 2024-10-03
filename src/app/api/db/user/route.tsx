import { getUser, updateUser } from "@/db/userActions";
import { updateWeekTargets } from "@/lib/weekUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { user, week } = data;
    const updatedUser = await updateUser(user);
    const updatedWeekTargets = await updateWeekTargets(user, week);
    return NextResponse.json({ updatedUser, updatedWeekTargets });
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  try {
    const response = await getUser(email as string, false);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
