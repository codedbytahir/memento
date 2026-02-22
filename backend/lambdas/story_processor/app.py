import json
import boto3
import os

DEV_MODE = os.environ.get('DEV_MODE', 'true').lower() == 'true'

def lambda_handler(event, context):
    """
    SQS-triggered: Edits story with Nova Lite, matches photos with Nova Embeddings.
    """
    dynamodb = boto3.resource('dynamodb')
    sessions_table = dynamodb.Table(os.environ['SESSIONS_TABLE'])

    for record in event['Records']:
        try:
            body = json.loads(record['body'])
            session_id = body.get('session_id')
            if not session_id: continue

            # Get session data
            session = sessions_table.get_item(Key={'session_id': session_id})['Item']

            # Get transcript
            transcript_list = session.get('transcript', [])
            raw_transcript = " ".join([item['text'] for item in transcript_list if item['speaker'] == 'user'])

            # 1. Edit with Nova Lite
            if DEV_MODE:
                edited_story = "I remember the summer of 1987. We spent hours on the beach building a grand sandcastle. The tide eventually took it, but the joy of creating it with my family remains one of my fondest memories."
            else:
                edited_story = call_nova_lite(raw_transcript)

            # 2. Match images with embeddings
            if DEV_MODE:
                matched_images = ['image_0.jpg']
            else:
                matched_images = match_images_with_embeddings(session_id, edited_story)

            # 3. Save results
            sessions_table.update_item(
                Key={'session_id': session_id},
                UpdateExpression='SET edited_story = :story, matched_images = :imgs, #status = :st',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':story': edited_story,
                    ':imgs': matched_images,
                    ':st': 'processed'
                }
            )

            # 4. Trigger PDF generation
            sqs = boto3.client('sqs')
            sqs.send_message(
                QueueUrl=os.environ['PDF_QUEUE_URL'],
                MessageBody=json.dumps({'session_id': session_id})
            )
        except Exception as e:
            print(f"Error processing session: {str(e)}")

    return {'statusCode': 200}

def call_nova_lite(transcript):
    """Call Nova Lite to edit transcript"""
    bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

    prompt = f"""You are a professional biographer. Given this raw interview transcript, remove filler words, fix grammar, organize chronologically, and structure into 3-5 paragraphs. Maintain the speaker's original voice and tone. Return only the edited prose, no preamble.

Transcript: {transcript}

Edited biography:"""

    response = bedrock.converse(
        modelId='us.amazon.nova-lite-v1:0',
        messages=[{'role': 'user', 'content': [{'text': prompt}]}],
        inferenceConfig={'maxTokens': 2000}
    )

    return response['output']['message']['content'][0]['text']

def match_images_with_embeddings(session_id, story):
    """Use Nova Embeddings to match images to story"""
    # For the hackathon, we'll implement a simple version that returns available images
    s3 = boto3.client('s3')
    bucket = os.environ['IMAGES_BUCKET']

    response = s3.list_objects_v2(Bucket=bucket, Prefix=f'{session_id}/')
    images = [obj['Key'].split('/')[-1] for obj in response.get('Contents', [])]

    # In a full implementation, we'd use Bedrock Embeddings to compare story text with image descriptions
    return images[:3] # Return up to 3 images for the PDF
