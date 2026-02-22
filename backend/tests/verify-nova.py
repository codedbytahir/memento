#!/usr/bin/env python3
"""
Verify Nova models are accessible before building anything.
Cost: $0 (just checks availability)
"""

import boto3
import sys
import json

def check_model_access(model_id):
    """Check if we can access a specific model"""
    try:
        bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

        # Try to invoke with minimal input
        body = json.dumps({
            "messages": [
                {
                    "role": "user",
                    "content": [{"text": "test"}]
                }
            ],
            "inferenceConfig": {"maxTokens": 10}
        })

        bedrock.invoke_model(
            modelId=model_id,
            body=body
        )

        return True, "✅ Accessible"

    except Exception as e:
        error = str(e)
        if "AccessDeniedException" in error:
            return False, "❌ Access Denied - Enable in Bedrock Console"
        elif "ValidationException" in error:
            if "model is not available" in error:
                 return False, "❌ Model not available in this region"
            return True, "✅ Accessible (Validation error on dummy input, but model exists)"
        elif "ResourceNotFoundException" in error:
            return False, "❌ Model ID not found"
        else:
            return False, f"❌ Error: {error}"

if __name__ == '__main__':
    print("🔍 Checking Nova model access...\n")

    models = {
        'Nova Lite': 'us.amazon.nova-lite-v1:0',
        'Nova Sonic': 'us.amazon.nova-sonic-v1:0',
        'Nova Embeddings': 'amazon.nova-embed-v1'
    }

    all_good = True

    for name, model_id in models.items():
        accessible, status = check_model_access(model_id)
        print(f"{name:20} {status}")

        if not accessible:
            all_good = False

    print("\n" + "="*50)

    if all_good:
        print("✅ All models ready! You can proceed with development.")
        sys.exit(0)
    else:
        print("❌ Some models are not accessible.")
        print("\nTo fix:")
        print("1. Go to AWS Console → Amazon Bedrock")
        print("2. Region: us-east-1")
        print("3. Model access → Manage model access")
        print("4. Enable all Nova models")
        print("5. Wait 2-3 minutes, then re-run this script")
        sys.exit(1)
