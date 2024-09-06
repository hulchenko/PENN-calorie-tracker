import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/actions/getUser';
import { validateHashedPassword } from '@/lib/utils';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const { email, password } = body;
    
    const user = await getUser(email, false);

    if (!user) {
      return NextResponse.json({error: 'User does not exist. Please sign up to proceed.'}, { status: 404 })
    }

    const isPasswordCorrect = await validateHashedPassword(password, user?.password);
    console.log(`isPasswordCorrect: `, isPasswordCorrect);

    if (isPasswordCorrect) {
      await createSession(user.user_id)
      return NextResponse.json(user);
    } else {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'User login failed.' }, { status: 500 });
  }
}