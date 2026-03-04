import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/aws/dynamodb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

    if (isDev) {
      return NextResponse.json({
        sessionId,
        status: "completed",
        progress: 100,
        pdfUrl: `https://memento-pdfs.s3.amazonaws.com/${sessionId}/final_story.pdf`
      });
    }

    // 1. Check DynamoDB for current status
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId,
      status: session.status || "started",
      progress: session.status === 'completed' ? 100 : 65,
      editedStory: session.editedStory,
      matchedImages: session.matchedImages,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
