import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createSession } from '@/lib/aws/dynamodb';
import { uploadImage } from '@/lib/aws/s3';

export async function POST(req: NextRequest) {
  try {
    const { email, images } = await req.json();

    if (!email || !images || images.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessionId = uuidv4();
    const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

    if (isDev) {
      return NextResponse.json({
        sessionId,
        websocket_url: `wss://echo.websocket.org?session_id=${sessionId}`
      });
    }

    // 1. Save to DynamoDB
    await createSession(sessionId, email);

    // 2. Upload images to S3
    for (let i = 0; i < images.length; i++) {
      const buffer = Buffer.from(images[i], 'base64');
      await uploadImage(sessionId, i, buffer);
    }

    return NextResponse.json({
      sessionId,
      websocket_url: `${process.env.WEBSOCKET_URL}?session_id=${sessionId}`
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
