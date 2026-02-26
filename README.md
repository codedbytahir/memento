# Memento - The Autonomous Biographer (TypeScript)

Memento is an AI-powered application that interviews users about their memories, matches photos to their stories, and generates a beautifully formatted PDF biography — fully autonomously.

**Now built entirely in TypeScript with Next.js.**

## 🚀 Quick Start

1. **Setup AWS Credentials:**
   Create a `frontend/.env.local` file (copy from `.env.example`) and fill in your AWS credentials:
   ```env
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   ```
   *Note: This avoids having to run `aws configure` and keeps your terminal history clean.*

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
   To deploy using the credentials from your `.env.local`:
   ```bash
   # Export credentials to your current shell
   export $(grep -v '^#' frontend/.env.local | xargs)

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
