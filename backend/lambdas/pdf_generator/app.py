import json
import boto3
import os
import base64
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

# WeasyPrint will be available via Lambda Layer
try:
    from weasyprint import HTML
except ImportError:
    print("WeasyPrint not found. PDF generation will be mocked.")
    HTML = None

def lambda_handler(event, context):
    """
    Generates PDF and sends via email.
    """
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['SESSIONS_TABLE'])
    s3 = boto3.client('s3')
    bucket = os.environ['IMAGES_BUCKET']
    pdf_bucket = os.environ['PDF_BUCKET']

    for record in event['Records']:
        try:
            session_id = json.loads(record['body'])['session_id']

            # Get session data
            session = table.get_item(Key={'session_id': session_id})['Item']

            image_data = []
            for img_name in session.get('matched_images', []):
                try:
                    obj = s3.get_object(Bucket=bucket, Key=f"{session_id}/{img_name}")
                    img_bytes = obj['Body'].read()
                    img_base64 = base64.b64encode(img_bytes).decode('utf-8')
                    image_data.append(img_base64)
                except Exception as e:
                    print(f"Error reading image {img_name}: {str(e)}")

            # Generate HTML
            html_content = generate_html(session.get('edited_story', ''), image_data)

            # Convert to PDF
            if HTML:
                pdf_bytes = HTML(string=html_content).write_pdf()
            else:
                # Mock PDF bytes
                pdf_bytes = b"%PDF-1.4 mock content"

            # Save to S3
            pdf_key = f'{session_id}/biography.pdf'
            s3.put_object(
                Bucket=pdf_bucket,
                Key=pdf_key,
                Body=pdf_bytes,
                ContentType='application/pdf'
            )

            # Generate presigned URL (7 days)
            pdf_url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': pdf_bucket, 'Key': pdf_key},
                ExpiresIn=604800
            )

            # Send email
            try:
                send_email(session['user_email'], pdf_url, pdf_bytes)
            except Exception as e:
                print(f"Error sending email: {str(e)}")

            # Update status
            table.update_item(
                Key={'session_id': session_id},
                UpdateExpression='SET #status = :st, pdf_url = :url',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':st': 'completed',
                    ':url': pdf_url
                }
            )
        except Exception as e:
            print(f"Error in PDF generation: {str(e)}")

    return {'statusCode': 200}

def generate_html(story, images):
    """Generate beautiful HTML for PDF"""
    image_tags = ''.join([
        f'<div class="image-container"><img src="data:image/jpeg;base64,{img}" /></div>'
        for img in images
    ])

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: letter;
                margin: 1in;
            }}
            body {{
                font-family: 'Georgia', serif;
                line-height: 1.6;
                color: #2C2C2C;
                background-color: #FAF9F6;
            }}
            .header {{
                text-align: center;
                border-bottom: 2px solid #1F3864;
                margin-bottom: 30px;
                padding-bottom: 10px;
            }}
            h1 {{
                color: #1F3864;
                font-size: 28pt;
                margin: 0;
            }}
            .story {{
                white-space: pre-wrap;
                margin-bottom: 30px;
                text-align: justify;
            }}
            .image-container {{
                text-align: center;
                margin-bottom: 20px;
                page-break-inside: avoid;
            }}
            img {{
                max-width: 100%;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }}
            .footer {{
                position: fixed;
                bottom: 0;
                width: 100%;
                text-align: center;
                font-size: 9pt;
                color: #888;
                border-top: 1px solid #DDD;
                padding-top: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>My Memento</h1>
        </div>
        <div class="story">
            {story}
        </div>
        {image_tags}
        <div class="footer">
            Preserved by Memento • {datetime.now().strftime('%B %d, %Y')}
        </div>
    </body>
    </html>
    """

def send_email(to_email, pdf_url, pdf_bytes):
    """Send email via SES with PDF attached"""
    ses = boto3.client('ses', region_name='us-east-1')
    from_email = os.environ.get('FROM_EMAIL', 'noreply@memento-biographer.com')

    msg = MIMEMultipart('mixed')
    msg['Subject'] = 'Your Memento Biography is Ready 📖'
    msg['From'] = from_email
    msg['To'] = to_email

    body_html = f"""
    <html>
    <body style="font-family: sans-serif; color: #2C2C2C;">
        <div style="max-width: 600px; margin: auto; border: 1px solid #EEE; padding: 20px;">
            <h2 style="color: #1F3864; text-align: center;">Your story has been preserved.</h2>
            <p>Hello,</p>
            <p>Your Memento biography is ready! We've attached the PDF version to this email for you to keep forever.</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{pdf_url}" style="background-color: #1F3864; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Biography</a>
            </p>
            <p>Note: The download link will expire in 7 days.</p>
            <hr style="border: 0; border-top: 1px solid #EEE; margin: 20px 0;" />
            <p style="color: #888; font-size: 12px; text-align: center;">
                Thank you for using Memento. Everyone has a story — we're honored to help preserve yours.
            </p>
        </div>
    </body>
    </html>
    """

    msg_body = MIMEMultipart('alternative')
    msg_body.attach(MIMEText(body_html, 'html'))
    msg.attach(msg_body)

    pdf_attachment = MIMEApplication(pdf_bytes)
    pdf_attachment.add_header('Content-Disposition', 'attachment', filename='my-memento-biography.pdf')
    msg.attach(pdf_attachment)

    ses.send_raw_email(
        Source=from_email,
        Destinations=[to_email],
        RawMessage={'Data': msg.as_string()}
    )
