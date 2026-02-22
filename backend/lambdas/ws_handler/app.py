import json
import boto3
import os
import base64

DEV_MODE = os.environ.get('DEV_MODE', 'true').lower() == 'true'

def lambda_handler(event, context):
    """
    Handles WebSocket connections and Nova Sonic calls.
    """
    print(f"Event: {json.dumps(event)}")

    request_context = event.get('requestContext', {})
    connection_id = request_context.get('connectionId')
    route_key = request_context.get('routeKey')

    if route_key == '$connect':
        return handle_connect(event, connection_id)
    elif route_key == '$disconnect':
        return handle_disconnect(event, connection_id)
    elif route_key == 'message':
        return handle_message(event, connection_id)

    return {'statusCode': 200}

def handle_connect(event, connection_id):
    """Store connection in DynamoDB"""
    query_params = event.get('queryStringParameters', {})
    session_id = query_params.get('session_id')

    if not session_id:
        return {'statusCode': 400, 'body': 'session_id required'}

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['CONNECTIONS_TABLE'])

    table.put_item(Item={
        'connection_id': connection_id,
        'session_id': session_id
    })

    return {'statusCode': 200}

def handle_disconnect(event, connection_id):
    """Remove connection from DynamoDB"""
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['CONNECTIONS_TABLE'])

    table.delete_item(Key={
        'connection_id': connection_id
    })

    return {'statusCode': 200}

def handle_message(event, connection_id):
    """Process audio and respond"""
    body = json.loads(event['body'])
    audio_chunk = body.get('audio_chunk')

    if DEV_MODE:
        # MOCK RESPONSE - NO COST
        # Tiny silent WAV base64
        MOCK_AUDIO = "UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="

        response = {
            'ai_question': "That sounds wonderful! Can you tell me more about what was happening in that photo?",
            'audio_response': MOCK_AUDIO,
            'transcript_update': "That sounds wonderful! Can you tell me more about what was happening in that photo?"
        }

        send_to_connection(connection_id, response)
        save_transcript(connection_id, "User shared a memory (mocked).", response['transcript_update'])
        return {'statusCode': 200}

    else:
        # REAL NOVA SONIC CALL
        # Note: Nova Sonic expects a specific streaming format.
        # For simplicity in this demo, we use Converse API or Bedrock Runtime.
        try:
            bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

            # This is a simplified version. Real Nova Sonic would use a streaming WebSocket connection
            # or the Bedrock ConverseStream API with audio input.

            # Since we are receiving chunks, we might need to buffer them or use a streaming client.
            # For the purpose of the hackathon demo, we'll assume audio_chunk is a complete utterance
            # or we use Nova Sonic's ability to handle audio.

            response = bedrock.converse(
                modelId='us.amazon.nova-sonic-v1:0',
                messages=[{
                    'role': 'user',
                    'content': [{
                        'audio': {
                            'format': 'wav', # or 'mp3', 'ogg_opus'
                            'source': {'bytes': base64.b64decode(audio_chunk)}
                        }
                    }]
                }],
                inferenceConfig={'maxTokens': 500}
            )

            ai_text = response['output']['message']['content'][0]['text']
            # Nova Sonic can also return audio, but it depends on the exact API used.
            # If using converse, we might need a separate TTS step or use the multi-modal response.

            result = {
                'ai_question': ai_text,
                'audio_response': '', # Would be populated if TTS is integrated
                'transcript_update': ai_text
            }

            send_to_connection(connection_id, result)
            save_transcript(connection_id, "User audio input", ai_text)

        except Exception as e:
            print(f"Error calling Bedrock: {str(e)}")
            send_to_connection(connection_id, {'ai_question': "I'm sorry, I had trouble hearing that. Could you say it again?"})

        return {'statusCode': 200}

def send_to_connection(connection_id, data):
    """Send data via WebSocket"""
    try:
        api_gateway = boto3.client('apigatewaymanagementapi',
            endpoint_url=os.environ['WEBSOCKET_ENDPOINT']
        )

        api_gateway.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(data).encode('utf-8')
        )
    except Exception as e:
        print(f"Error sending to connection {connection_id}: {str(e)}")

def save_transcript(connection_id, user_text, ai_text):
    """Append transcript to DynamoDB"""
    try:
        dynamodb = boto3.resource('dynamodb')
        conn_table = dynamodb.Table(os.environ['CONNECTIONS_TABLE'])

        res = conn_table.get_item(Key={'connection_id': connection_id})
        if 'Item' not in res: return
        session_id = res['Item']['session_id']

        sessions_table = dynamodb.Table(os.environ['SESSIONS_TABLE'])

        sessions_table.update_item(
            Key={'session_id': session_id},
            UpdateExpression='SET transcript = list_append(if_not_exists(transcript, :empty), :logs)',
            ExpressionAttributeValues={
                ':empty': [],
                ':logs': [
                    {'speaker': 'user', 'text': user_text},
                    {'speaker': 'ai', 'text': ai_text}
                ]
            }
        )
    except Exception as e:
        print(f"Error saving transcript: {str(e)}")
