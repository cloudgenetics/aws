# Cloud Genetics AWS configuration
> Krishna Kumar

[![License](https://img.shields.io/badge/license-CC--By--SA--4.0-brightgreen.svg)](https://raw.githubusercontent.com/cloudgenetics/aws/main/LICENSE.md)

## Configure AWS Batch
To validate template:
```
aws cloudformation validate-template --template-body file://templates/batch.yaml
```
Create AWS stack
```
aws cloudformation create-stack --stack-name batch-cloud-genetics --template-body file://templates/batch.yaml --capabilities CAPABILITY_NAMED_IAM --output text;aws cloudformation wait stack-create-complete --stack-name batch-cloud-genetics
```

Verify completion:
```
aws cloudformation describe-stacks --stack-name batch-cloud-genetics --query 'Stacks[].Outputs[?OutputKey==`ComputeEnvironmentArn`].OutputValue' --output text
aws cloudformation describe-stacks --stack-name batch-cloud-genetics --query 'Stacks[].Outputs[?OutputKey==`BatchProcessingJobQueueArn`].OutputValue' --output text
```

To delete the stack:
```
aws cloudformation delete-stack --stack-name batch-cloud-genetics
```

