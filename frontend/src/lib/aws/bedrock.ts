import { bedrockClient } from './config';
import { InvokeModelCommand, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const NOVA_LITE_MODEL_ID = process.env.NOVA_LITE_MODEL_ID || "us.amazon.nova-lite-v1:0";

export const generateStory = async (transcript: string) => {
  const prompt = `You are a professional biographer. Edit the following transcript into a beautiful, coherent, and emotionally resonant short biography.
  Transcript: ${transcript}`;

  const input = {
    modelId: NOVA_LITE_MODEL_ID,
    messages: [
      {
        role: "user",
        content: [{ text: prompt }]
      }
    ],
    inferenceConfig: {
      maxTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
    },
  };

  try {
    const command = new ConverseCommand(input as any);
    const response = await bedrockClient.send(command);
    return response.output?.message?.content?.[0]?.text;
  } catch (error) {
    console.error("Error calling Nova:", error);
    throw error;
  }
};
