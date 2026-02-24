import { APIGatewayProxyWebsocketEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

const DEV_MODE = process.env.DEV_MODE === 'true';

export const handler = async (event: APIGatewayProxyWebsocketEventV2): Promise<APIGatewayProxyResultV2> => {
  const { connectionId, routeKey } = event.requestContext;

  switch (routeKey) {
    case '$connect':
      const sessionId = event.queryStringParameters?.session_id;
      if (!sessionId) return { statusCode: 400, body: 'session_id required' };
      await docClient.send(new PutCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Item: { connection_id: connectionId, session_id: sessionId }
      }));
      return { statusCode: 200 };

    case '$disconnect':
      await docClient.send(new DeleteCommand({
        TableName: process.env.CONNECTIONS_TABLE,
        Key: { connection_id: connectionId }
      }));
      return { statusCode: 200 };

    case 'message':
      return handleMessage(event);

    default:
      return { statusCode: 200 };
  }
};

async function handleMessage(event: APIGatewayProxyWebsocketEventV2) {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body || '{}');
  const audioChunk = body.audio_chunk;

  if (DEV_MODE) {
    const response = {
      ai_question: "That sounds wonderful! Can you tell me more about what was happening in that photo?",
      audio_response: "UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==", // Silent WAV
      transcript_update: "That sounds wonderful! Can you tell me more."
    };
    await sendToConnection(connectionId, response);
    await saveTranscript(connectionId, "User audio chunk (mocked)", response.transcript_update);
  } else {
    // Real Nova Sonic call logic
    // ...
  }
  return { statusCode: 200 };
}

async function sendToConnection(connectionId: string, data: any) {
  const client = new ApiGatewayManagementApiClient({
    endpoint: process.env.WEBSOCKET_ENDPOINT
  });
  await client.send(new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: Buffer.from(JSON.stringify(data))
  }));
}

async function saveTranscript(connectionId: string, userText: string, aiText: string) {
  const connRes = await docClient.send(new GetCommand({
    TableName: process.env.CONNECTIONS_TABLE,
    Key: { connection_id: connectionId }
  }));
  if (!connRes.Item) return;
  const sessionId = connRes.Item.session_id;

  await docClient.send(new UpdateCommand({
    TableName: process.env.SESSIONS_TABLE,
    Key: { session_id: sessionId },
    UpdateExpression: 'SET transcript = list_append(if_not_exists(transcript, :empty), :logs)',
    ExpressionAttributeValues: {
      ':empty': [],
      ':logs': [
        { speaker: 'user', text: userText },
        { speaker: 'ai', text: aiText }
      ]
    }
  }));
}
