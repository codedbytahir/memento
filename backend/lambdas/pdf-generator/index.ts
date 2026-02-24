import { SQSEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({});
const sesClient = new SESClient({ region: 'us-east-1' });

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const { session_id } = JSON.parse(record.body);
      const sessionRes = await docClient.send(new GetCommand({
        TableName: process.env.SESSIONS_TABLE,
        Key: { session_id }
      }));
      if (!sessionRes.Item) continue;
      const session = sessionRes.Item;

      // 1. Create PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      page.drawText('My Memento', { x: 50, y: height - 50, size: 30, font, color: rgb(0.12, 0.22, 0.39) });
      page.drawText(session.edited_story || '', { x: 50, y: height - 100, size: 12, font, maxWidth: width - 100 });

      // Embed images if we wanted (requires fetching from S3 and embedding)
      // For this demo, we'll just finalize the text PDF

      const pdfBytes = await pdfDoc.save();

      // 2. Save to S3
      const pdfBucket = process.env.PDF_BUCKET!;
      const pdfKey = `${session_id}/biography.pdf`;
      await s3Client.send(new PutObjectCommand({
        Bucket: pdfBucket,
        Key: pdfKey,
        Body: pdfBytes,
        ContentType: 'application/pdf'
      }));

      // 3. Update status and PDF URL (presigned if needed)
      // For demo, just use the key or a public-ish URL if configured
      await docClient.send(new UpdateCommand({
        TableName: process.env.SESSIONS_TABLE,
        Key: { session_id },
        UpdateExpression: 'SET #status = :st, pdf_url = :url',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':st': 'completed',
          ':url': `https://${pdfBucket}.s3.amazonaws.com/${pdfKey}`
        }
      }));

      // 4. Send Email (Raw SES)
      // Simplified: Just send a link for now or a full attachment if implemented

    } catch (e) {
      console.error(e);
    }
  }
};
