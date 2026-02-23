# Memento on Firebase Studio (IDX)

This project is optimized for development in **Firebase Studio** (formerly Project IDX), Google's agentic cloud-based IDE. This allows you to build, test, and deploy Memento entirely from your browser.

## 🚀 Getting Started

1.  **Open in Firebase Studio:**
    - Go to [Firebase Studio](https://studio.firebase.google.com/).
    - Choose **Import an existing project**.
    - Enter the URL of your Memento repository.

2.  **Environment Setup:**
    - Firebase Studio will automatically detect the `.idx/dev.nix` file and configure your environment.
    - It will install Node.js, Python 3.12, AWS CLI, and SAM CLI.
    - Frontend (`npm install`) and Backend (`pip install`) dependencies will be installed automatically on first creation.

3.  **Running the App:**
    - The **Web Preview** panel should automatically start the frontend.
    - If not, you can run it manually in the terminal:
      ```bash
      cd frontend
      npm run dev
      ```

4.  **AWS Configuration in the Cloud:**
    - Open a terminal in Firebase Studio.
    - Run the setup script to configure your AWS credentials:
      ```bash
      cd backend
      ./setup-aws.sh
      ```
    - Verify your access to Nova models:
      ```bash
      python3 tests/verify-nova.py
      ```

## 🛠 Cloud IDE Features

-   **Gemini Assistance:** Use the built-in Gemini chat in Firebase Studio to help you with code changes, debugging, and Bedrock integration.
-   **Terminal:** You have a full Linux terminal with `aws` and `sam` commands pre-installed.
-   **Previews:** View your React frontend changes in real-time in the side-by-side preview window.

## 💰 Cost Note
Developing in Firebase Studio is currently available at no cost. Remember that while the IDE is free, calls to AWS Bedrock (when `DEV_MODE=false`) will still incur charges on your AWS account.
