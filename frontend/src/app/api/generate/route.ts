import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    // 1. Update status
    await docClient.send(new UpdateCommand({
      TableName: process.env.SESSIONS_TABLE,
      Key: { session_id },
      UpdateExpression: 'SET #status = :st',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':st': 'processing' }
    }));

    // 2. Trigger SQS
    await sqsClient.send(new SendMessageCommand({
      QueueUrl: process.env.PROCESSING_QUEUE_URL,
      MessageBody: JSON.stringify({ session_id })
    }));

    return NextResponse.json({ status: 'processing' });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
