import json
import uuid
import boto3
import base64
import os
from datetime import datetime, timedelta

def lambda_handler(event, context):
    """
    Creates a new session and uploads images to S3.
    """
    try:
        # CORS preflight
        if event['httpMethod'] == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': ''
            }

        # Parse request
        body = json.loads(event['body'])
        user_email = body.get('user_email')
        images = body.get('images', [])  # Array of base64 strings

        # Validate
        if not user_email or '@' not in user_email:
            return error_response(400, 'Invalid email')

        if not images or len(images) > 5:
            return error_response(400, 'Must provide 1-5 images')

        # Generate session
        session_id = str(uuid.uuid4())

        # Save to DynamoDB
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ['SESSIONS_TABLE'])

        table.put_item(Item={
            'session_id': session_id,
            'user_email': user_email,
            'status': 'started',
            'created_at': datetime.now().isoformat(),
            'ttl': int((datetime.now() + timedelta(days=7)).timestamp()),
            'transcript': []
        })

        # Upload images to S3
        s3 = boto3.client('s3')
        bucket = os.environ['IMAGES_BUCKET']

        for i, img_base64 in enumerate(images):
            # Decode base64
            try:
                img_data = base64.b64decode(img_base64)

                # Upload
                s3.put_object(
                    Bucket=bucket,
                    Key=f'{session_id}/image_{i}.jpg',
                    Body=img_data,
                    ContentType='image/jpeg'
                )
            except Exception as e:
                print(f"Error uploading image {i}: {str(e)}")

        # Return WebSocket URL
        ws_url = os.environ['WEBSOCKET_URL']

        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'session_id': session_id,
                'websocket_url': f'{ws_url}?session_id={session_id}'
            })
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return error_response(500, str(e))

def error_response(status_code, message):
    return {
        'statusCode': status_code,
        'headers': cors_headers(),
        'body': json.dumps({'error': message})
    }

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }
