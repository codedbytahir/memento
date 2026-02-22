import json
import boto3
import os

def lambda_handler(event, context):
    """
    Handles auxiliary API endpoints: /generate, /pdf-status/{id}, /send-email
    """
    path = event.get('path', '')
    http_method = event.get('httpMethod', '')

    # CORS preflight
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': ''
        }

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['SESSIONS_TABLE'])

    try:
        if path.endswith('/generate') and http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            session_id = body.get('session_id')

            if not session_id:
                return error_response(400, 'session_id required')

            # Trigger Story Processor via SQS
            sqs = boto3.client('sqs')
            sqs.send_message(
                QueueUrl=os.environ['PROCESSING_QUEUE_URL'],
                MessageBody=json.dumps({'session_id': session_id})
            )

            # Update status in DynamoDB
            table.update_item(
                Key={'session_id': session_id},
                UpdateExpression='SET #status = :st',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':st': 'processing'}
            )

            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({'status': 'processing'})
            }

        elif '/pdf-status/' in path and http_method == 'GET':
            session_id = path.split('/')[-1]

            res = table.get_item(Key={'session_id': session_id})
            if 'Item' not in res:
                return error_response(404, 'Session not found')

            item = res['Item']
            status = item.get('status')
            pdf_url = item.get('pdf_url')

            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({
                    'ready': status == 'completed',
                    'url': pdf_url
                })
            }

        elif path.endswith('/send-email') and http_method == 'POST':
            # This is already handled by the pdf_generator automatically,
            # but we can provide a manual re-send here if needed.
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({'success': True, 'message': 'Email re-send requested'})
            }

    except Exception as e:
        print(f"Error in api_handler: {str(e)}")
        return error_response(500, str(e))

    return error_response(404, 'Not Found')

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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
