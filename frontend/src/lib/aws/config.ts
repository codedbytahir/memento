import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { SESClient } from "@aws-sdk/client-ses";

const region = process.env.AWS_REGION || 'eu-north-1';

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

export const ddbClient = new DynamoDBClient({ region, credentials });
export const docClient = DynamoDBDocumentClient.from(ddbClient);
export const s3Client = new S3Client({ region, credentials });
export const bedrockClient = new BedrockRuntimeClient({ region, credentials });
export const sesClient = new SESClient({ region, credentials });

export const SESSIONS_TABLE = process.env.SESSIONS_TABLE;
export const IMAGES_BUCKET = process.env.IMAGES_BUCKET;
export const PDF_BUCKET = process.env.PDF_BUCKET;
export const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL;
