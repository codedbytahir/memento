import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/aws/dynamodb';
import { sendBiographyEmail } from '@/lib/aws/ses';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

    if (isDev) {
      return NextResponse.json({ sent: true });
    }

    // 1. Get Session for email address
    const session = await getSession(sessionId);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Send via SES
    await sendBiographyEmail(session.email, sessionId);

    return NextResponse.json({ sent: true });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
