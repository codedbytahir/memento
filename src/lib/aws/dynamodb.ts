import { docClient, SESSIONS_TABLE } from './config';
import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const getSession = async (sessionId: string) => {
  const command = new GetCommand({
    TableName: SESSIONS_TABLE,
    Key: { session_id: sessionId },
  });
  const response = await docClient.send(command);
  return response.Item;
};

export const createSession = async (sessionId: string, email: string) => {
  const command = new PutCommand({
    TableName: SESSIONS_TABLE,
    Item: {
      session_id: sessionId,
      email,
      status: 'started',
      created_at: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      transcript: []
    },
  });
  return docClient.send(command);
};

export const updateSessionTranscript = async (sessionId: string, transcript: string[]) => {
  const command = new UpdateCommand({
    TableName: SESSIONS_TABLE,
    Key: { session_id: sessionId },
    UpdateExpression: "SET transcript = :t",
    ExpressionAttributeValues: { ":t": transcript },
  });
  return docClient.send(command);
};

export const updateSessionStory = async (sessionId: string, editedStory: string, status: string = 'completed') => {
  const command = new UpdateCommand({
    TableName: SESSIONS_TABLE,
    Key: { session_id: sessionId },
    UpdateExpression: "SET editedStory = :s, #st = :status",
    ExpressionAttributeNames: { "#st": "status" },
    ExpressionAttributeValues: { ":s": editedStory, ":status": status },
  });
  return docClient.send(command);
};
