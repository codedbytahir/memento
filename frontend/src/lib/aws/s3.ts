import { s3Client, IMAGES_BUCKET, PDF_BUCKET } from './config';
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const uploadImage = async (sessionId: string, index: number, buffer: Buffer) => {
  const command = new PutObjectCommand({
    Bucket: IMAGES_BUCKET,
    Key: `${sessionId}/image_${index}.jpg`,
    Body: buffer,
    ContentType: 'image/jpeg'
  });
  return s3Client.send(command);
};

export const uploadPDF = async (sessionId: string, buffer: Buffer) => {
  const command = new PutObjectCommand({
    Bucket: PDF_BUCKET,
    Key: `${sessionId}/biography.pdf`,
    Body: buffer,
    ContentType: 'application/pdf'
  });
  return s3Client.send(command);
};

export const getPDFUrl = async (sessionId: string) => {
  const command = new GetObjectCommand({
    Bucket: PDF_BUCKET,
    Key: `${sessionId}/biography.pdf`,
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
