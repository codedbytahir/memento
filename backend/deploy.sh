#!/bin/bash
# One-command deployment script for Memento

echo "🚀 Starting Memento Deployment..."

# 1. Build backend
echo "📦 Building backend with SAM..."
cd backend
sam build

# 2. Deploy backend
echo "☁️ Deploying backend to AWS..."
sam deploy --stack-name memento --resolve-s3 --capabilities CAPABILITY_IAM --no-confirm-changeset

# 3. Get Outputs
echo "🔍 Fetching API endpoints..."
REST_API_URL=$(aws cloudformation describe-stacks --stack-name memento --query 'Stacks[0].Outputs[?OutputKey==`RestApiUrl`].OutputValue' --output text)
WS_API_URL=$(aws cloudformation describe-stacks --stack-name memento --query 'Stacks[0].Outputs[?OutputKey==`WebSocketUrl`].OutputValue' --output text)

echo "REST API: $REST_API_URL"
echo "WebSocket API: $WS_API_URL"

# 4. Build and Deploy Frontend
echo "💻 Building frontend..."
cd ../frontend
# Create .env.production with real API URLs
echo "VITE_API_URL=$REST_API_URL" > .env.production
echo "VITE_WS_URL=$WS_API_URL" >> .env.production
echo "VITE_DEV_MODE=false" >> .env.production

npm install
npm run build

echo "✅ Deployment complete!"
echo "Note: To deploy frontend to S3, run: aws s3 sync dist/ s3://YOUR-FRONTEND-BUCKET"
