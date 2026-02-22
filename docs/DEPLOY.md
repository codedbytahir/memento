# Deployment Guide

Memento is designed to be deployed entirely as a serverless application on AWS.

## Automated Deployment

The easiest way to deploy is using the provided script:

```bash
cd backend
./deploy.sh
```

This script will:
1. Build the backend with SAM.
2. Deploy the infrastructure to CloudFormation.
3. Fetch the generated API endpoints.
4. Build the frontend with the production endpoints.

## Manual Backend Deployment

If you prefer to run SAM commands manually:

```bash
cd backend
sam build
sam deploy --guided
```

## Frontend Deployment (S3/CloudFront)

After running `npm run build` in the `frontend` directory:

1. Create an S3 bucket for static website hosting.
2. Sync the `dist` folder:
   ```bash
   aws s3 sync frontend/dist/ s3://YOUR-BUCKET-NAME --delete
   ```
3. (Optional) Set up a CloudFront distribution pointing to the S3 bucket.

## Post-Deployment Steps

1. **Verify SES:** In SES Sandbox mode, you must verify the recipient email address before sending.
   ```bash
   ./backend/setup-ses.sh your-email@example.com
   ```
2. **Enable Real AI:** Change `DEV_MODE` to `false` in `backend/template.yaml` and redeploy.
