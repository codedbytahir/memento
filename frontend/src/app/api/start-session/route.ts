import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({});

export async function POST(req: NextRequest) {
  try {
    const { user_email, images } = await req.json();

    if (!user_email || !images || images.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessionId = uuidv4();

    // 1. Save to DynamoDB
    await docClient.send(new PutCommand({
      TableName: process.env.SESSIONS_TABLE,
      Item: {
        session_id: sessionId,
        user_email,
        status: 'started',
        created_at: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
        transcript: []
      }
    }));

    // 2. Upload images to S3
    for (let i = 0; i < images.length; i++) {
      const buffer = Buffer.from(images[i], 'base64');
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.IMAGES_BUCKET,
        Key: `${sessionId}/image_${i}.jpg`,
        Body: buffer,
        ContentType: 'image/jpeg'
      }));
    }

    return NextResponse.json({
      session_id: sessionId,
      websocket_url: `${process.env.WEBSOCKET_URL}?session_id=${sessionId}`
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
