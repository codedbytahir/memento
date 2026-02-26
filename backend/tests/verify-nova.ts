import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

async function checkModelAccess(modelId: string) {
  const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
  try {
    await client.send(new InvokeModelCommand({
      modelId,
      body: JSON.stringify({
        messages: [{ role: "user", content: [{ text: "test" }] }],
        inferenceConfig: { maxTokens: 10 }
      })
    }));
    return { accessible: true, status: "✅ Accessible" };
  } catch (e: any) {
    if (e.name === "AccessDeniedException") return { accessible: false, status: "❌ Access Denied" };
    if (e.name === "ValidationException") return { accessible: true, status: "✅ Accessible (Validation error on dummy input)" };
    return { accessible: false, status: `❌ Error: ${e.message}` };
  }
}

async function main() {
  console.log("🔍 Checking Nova model access (TypeScript)...\n");
  const models = {
    'Nova Lite': 'us.amazon.nova-lite-v1:0',
    'Nova Sonic': 'us.amazon.nova-sonic-v1:0',
    'Nova Embeddings': 'amazon.nova-embed-v1'
  };

  for (const [name, id] of Object.entries(models)) {
    const { status } = await checkModelAccess(id);
    console.log(`${name.padEnd(20)} ${status}`);
  }
}

main();
