import { sesClient, SES_FROM_EMAIL } from './config';
import { SendEmailCommand, SendRawEmailCommand } from "@aws-sdk/client-ses";

export const sendBiographyEmail = async (toEmail: string, sessionId: string) => {
  const command = new SendEmailCommand({
    Source: SES_FROM_EMAIL!,
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: { Data: "Your Memento Biography" },
      Body: {
        Html: { Data: `<h1>Your story is preserved!</h1><p>Find your biography at the link below:</p><a href="https://memento.vercel.app/preview?sessionId=${sessionId}">View Biography</a>` }
      }
    }
  });
  return sesClient.send(command);
};
