import { NextRequest, NextResponse } from 'next/server';
import { updateSessionStory, updateSessionTranscript } from '@/lib/aws/dynamodb';
import { generateStory } from '@/lib/aws/bedrock';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, transcript } = await req.json();

    if (!sessionId || !transcript) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

    if (isDev) {
      return NextResponse.json({
        status: "completed",
        editedStory: "This is a mock story based on your transcript. I remember the summer of 1987. We built a sandcastle at the beach and it was a moment I will always cherish.",
        matchedImages: ["image_0.jpg"]
      });
    }

    // 1. Store transcript as list
    const transcriptList = transcript.split('\n').filter((s: string) => s.trim() !== '');
    await updateSessionTranscript(sessionId, transcriptList);

    // 2. Generate Story using Nova
    const editedStory = await generateStory(transcript);

    // 3. Update Session in DynamoDB
    await updateSessionStory(sessionId, editedStory || "Error generating story", 'completed');

    return NextResponse.json({
      status: "completed",
      editedStory,
      matchedImages: ["image_0.jpg"]
    });

  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
