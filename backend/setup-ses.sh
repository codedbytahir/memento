#!/bin/bash
# Script to verify email address for SES Sandbox

if [ -z "$1" ]; then
    echo "Usage: ./setup-ses.sh <email_address>"
    exit 1
fi

EMAIL=$1

echo "📧 Verifying email address: $EMAIL"

aws ses verify-email-identity --email-address "$EMAIL"

echo "✅ Verification email sent to $EMAIL."
echo "Please check your inbox and click the verification link before using Memento."
echo "Note: In SES Sandbox mode, you can only send emails TO verified addresses."
