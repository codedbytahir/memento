# Local Setup Guide

Follow these steps to get Memento running on your local machine.

## Prerequisites

- Node.js 18+
- Python 3.12+
- AWS CLI configured with appropriate permissions
- SAM CLI installed

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd memento

# Install Frontend Dependencies
cd frontend
npm install

# Install Backend Dependencies (for local testing)
cd ../backend
pip install -r requirements.txt
```

## 2. AWS Configuration

If you haven't configured your AWS CLI yet:

```bash
cd backend
./setup-aws.sh
```

Ensure you have access to Nova models in `us-east-1`:

```bash
python3 tests/verify-nova.py
```

## 3. Running Frontend

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`. By default, it uses `mockAPI.js` which does not require a running backend.

## 4. Local Lambda Testing

You can test individual Lambdas locally using the SAM CLI:

```bash
cd backend
sam local invoke StartSessionFunction --event events/start-session.json
```
