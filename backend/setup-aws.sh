#!/bin/bash
# One-time AWS setup script

echo "🔧 Setting up AWS environment..."

# Check if AWS CLI exists
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm awscliv2.zip
    rm -rf aws/
fi

# Configure AWS (user will input credentials)
echo "Enter your AWS credentials:"
aws configure

# Test connection
aws sts get-caller-identity

echo "✅ AWS configured successfully!"
