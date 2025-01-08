import { getWeeks } from "@/db/weekActions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "";
    const response = await getWeeks(userId);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: `${error}` }, { status: 500 });
  }
}
