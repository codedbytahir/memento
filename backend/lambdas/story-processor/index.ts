import { SQSEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const sqsClient = new SQSClient({});
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

const DEV_MODE = process.env.DEV_MODE === 'true';

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const { session_id } = JSON.parse(record.body);

      const res = await docClient.send(new GetCommand({
        TableName: process.env.SESSIONS_TABLE,
        Key: { session_id }
      }));
      if (!res.Item) continue;

      const rawTranscript = res.Item.transcript
        .filter((i: any) => i.speaker === 'user')
        .map((i: any) => i.text)
        .join(' ');

      let editedStory = "";
      if (DEV_MODE) {
        editedStory = "I remember the summer of 1987. We built a sandcastle. The tide took it but we remember it.";
      } else {
        const prompt = `You are a professional biographer... Transcript: ${rawTranscript}`;
        const bedrockRes = await bedrock.send(new ConverseCommand({
          modelId: 'us.amazon.nova-lite-v1:0',
          messages: [{ role: 'user', content: [{ text: prompt }] }]
        }));
        editedStory = (bedrockRes.output?.message?.content?.[0] as any)?.text || "";
      }

      await docClient.send(new UpdateCommand({
        TableName: process.env.SESSIONS_TABLE,
        Key: { session_id },
        UpdateExpression: 'SET edited_story = :story, matched_images = :imgs, #status = :st',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':story': editedStory,
          ':imgs': ['image_0.jpg'],
          ':st': 'processed'
        }
      }));

      await sqsClient.send(new SendMessageCommand({
        QueueUrl: process.env.PDF_QUEUE_URL,
        MessageBody: JSON.stringify({ session_id })
      }));

    } catch (e) {
      console.error(e);
    }
  }
};
