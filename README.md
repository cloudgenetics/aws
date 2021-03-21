# Cloud Genetics AWS configuration
> Krishna Kumar

[![License](https://img.shields.io/badge/license-CC--By--SA--4.0-brightgreen.svg)](https://raw.githubusercontent.com/cloudgenetics/aws/main/LICENSE.md)

## Configure AWS Batch
```
aws cloudformation create-stack --stack-name batch-processing-job --template-body file://templates/batch.yaml --capabilities CAPABILITY_NAMED_IAM
```

To validate template:
```
aws cloudformation validate-template --template-body file://templates/batch.yaml
```

To delete the stack:
```
aws cloudformation delete-stack --stack-name batch-processing-job
```