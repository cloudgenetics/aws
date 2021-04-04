#!/usr/bin/env bash

set -e

# Define terminal colors
YELLOW="\e[33m"
RED="\e[31m"
GREEN="\e[32m"
ENDCOLOR="\e[0m"

# Info
echo -e "${YELLOW}Cloud Genetics AWS Batch setup${ENDCOLOR}"
echo "This will take 3 - 5 minutes to complete"

# Create stack from template
echo "Deploying stack started at: $(date)"
echo "please wait..."

# Deploy stack
# Configure and deploy AWS Batch compute environment
aws cloudformation create-stack --stack-name batch-cloud-genetics --template-body file://templates/batch.yaml --capabilities CAPABILITY_NAMED_IAM --output text;aws cloudformation wait stack-create-complete --stack-name batch-cloud-genetics
echo "Deploy complete."

# Check status
STACKSTATUS=$(aws cloudformation describe-stacks --stack-name batch-cloud-genetics  --query 'Stacks[].StackStatus' --output text)+!

# Get ARNs
COMPUTEARN=$(aws cloudformation describe-stacks --stack-name batch-cloud-genetics --query 'Stacks[].Outputs[?OutputKey==`ComputeEnvironmentArn`].OutputValue' --output text)
QUEUEARN=$(aws cloudformation describe-stacks --stack-name batch-cloud-genetics --query 'Stacks[].Outputs[?OutputKey==`BatchProcessingJobQueueArn`].OutputValue' --output text)

# Check status and output
if [ "$STACKSTATUS" != "CREATE_COMPLETE" ]
then
    echo -e "${RED}Creating stack failed: '${STACKSTATUS}'${ENDCOLOR}."
    echo "Delete stack using: aws cloudformation delete-stack --stack-name batch-cloud-genetics"
    exit -1
else
    echo -e "${GREEN}Created stack successfully!${ENDCOLOR}"
    echo "ComputeEnvironment ARN: '${COMPUTEARN}'."
    echo "JobQueue ARN: '${QUEUEARN}'."
fi
