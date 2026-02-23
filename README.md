# Memento - The Autonomous Biographer

Memento is an AI-powered application that interviews users about their memories, matches photos to their stories, and generates a beautifully formatted PDF biography — fully autonomously.

Built for the **Amazon Nova AI Hackathon**.

## 🚀 Quick Start

1. **Setup AWS Credentials:**
   ```bash
   cd backend
   ./setup-aws.sh
   ```

2. **Verify Nova Model Access:**
   ```bash
   python3 backend/tests/verify-nova.py
   ```

3. **Run Locally (Dev Mode):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Deploy to Production:**
   ```bash
   ./backend/deploy.sh
   ```

## ☁️ Cloud Development

Memento is optimized for **Firebase Studio (IDX)**. You can import this project into Firebase Studio for a pre-configured cloud development environment.

See [Firebase Studio Setup](./docs/FIREBASE_STUDIO.md) for details.

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend:** AWS Lambda (Python 3.12), AWS SAM, DynamoDB, S3, SQS, SES
- **AI Models (Amazon Bedrock):**
  - **Nova Sonic:** Real-time voice interview
  - **Nova Lite:** Text editing and summarization
  - **Nova Embeddings:** Multimodal photo matching
- **PDF Generation:** WeasyPrint

## 💰 Cost Control (DEV_MODE)

By default, the application runs in `DEV_MODE=true`. This mocks all calls to Amazon Bedrock models, ensuring $0 AWS charges during frontend development.

To enable real AI features:
1. Set `DEV_MODE: 'false'` in `backend/template.yaml` Globals.
2. Deploy the changes.

## 📄 Documentation

- [Local Setup](./docs/SETUP.md)
- [Deployment Guide](./docs/DEPLOY.md)
- [Demo Script](./docs/DEMO.md)
- [API Contract](./shared/api-contract.json)

---
"Everyone has a story — we're honored to help preserve yours."
