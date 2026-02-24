# Memento - The Autonomous Biographer (TypeScript)

Memento is an AI-powered application that interviews users about their memories, matches photos to their stories, and generates a beautifully formatted PDF biography — fully autonomously.

**Now built entirely in TypeScript with Next.js.**

## 🚀 Quick Start

1. **Setup AWS Credentials:**
   ```bash
   aws configure
   ```

2. **Verify Nova Model Access:**
   ```bash
   cd backend
   npx ts-node tests/verify-nova.ts
   ```

3. **Run Locally (Dev Mode):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Deploy to Production:**
   ```bash
   sam build
   sam deploy --guided
   ```

## 🛠 Tech Stack

- **Framework:** Next.js 15 (TypeScript, App Router)
- **Styling:** Tailwind CSS 4
- **Backend:** Node.js 20.x, AWS SAM
- **AI Models (Bedrock):** Nova Sonic, Nova Lite, Nova Embeddings
- **PDF Generation:** pdf-lib (TypeScript)

## 💰 Cost Control

By default, the application runs with `NEXT_PUBLIC_DEV_MODE=true` in `.env.local`. This mocks all AI calls. To enable real features, set it to `false` and ensure your AWS environment has `DEV_MODE=false`.
