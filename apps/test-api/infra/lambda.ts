import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface LambdaProps {
  projectName: string;
  environment: string;
  tags: { [key: string]: string };
  dynamoTableName: pulumi.Output<string>;
}

/**
 * Create Lambda functions for the API
 * @param props LambdaProps
 * @returns Object containing all Lambda functions
 * @see https://www.pulumi.com/docs/reference/pkg/aws/lambda/
 */

export function createLambdaFunctions(props: LambdaProps) {
  const { projectName, environment } = props;
  const current = pulumi.output(aws.getCallerIdentity({}));
  // IAM role for Lambda
  const lambdaRole = new aws.iam.Role(`iam-${projectName}-${environment}`, {
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [{
        Action: "sts:AssumeRole",
        Principal: {
          Service: "lambda.amazonaws.com",
        },
        Effect: "Allow",
      }],
    }),
    tags: props.tags,
  });

  // Attach basic Lambda execution policy
  new aws.iam.RolePolicyAttachment(`iap-${projectName}-${environment}`, {
    role: lambdaRole.name,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
  });

  // DynamoDB access policy
  new aws.iam.RolePolicy(`irp-${projectName}-${environment}`, {
    role: lambdaRole.id,
    policy: {
      Version: "2012-10-17",
      Statement: [{
        Effect: "Allow",
        Action: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        Resource: [
          pulumi.interpolate`arn:aws:dynamodb:${aws.config.region}:${current.accountId}:table/${props.dynamoTableName}`,
          pulumi.interpolate`arn:aws:dynamodb:${aws.config.region}:${current.accountId}:table/${props.dynamoTableName}/index/*`
        ]
      }]
    }
  });

  const defaultLambdaConfig = {
    role: lambdaRole.arn,
    runtime: "nodejs18.x",
    handler: "index.handler",
    memorySize: 1024,
    timeout: 10,
    environment: {
      variables: {
        STAGE: environment,
        DYNAMODB_TABLE: props.dynamoTableName,
      }
    },
    tags: props.tags,
  };

  return {
    register: new aws.lambda.Function(`fn-register-${projectName}-${environment}`, {
      ...defaultLambdaConfig,
      code: new pulumi.asset.AssetArchive({
        "index.js": new pulumi.asset.FileAsset("../dist/handlers/register.js"),
      }),
    }),

    login: new aws.lambda.Function(`fn-login-${projectName}-${environment}`, {
      ...defaultLambdaConfig,
      code: new pulumi.asset.AssetArchive({
        "index.js": new pulumi.asset.FileAsset("../dist/handlers/login.js"),
      }),
    }),

    me: new aws.lambda.Function(`fn-me-${projectName}-${environment}`, {
      ...defaultLambdaConfig,
      code: new pulumi.asset.AssetArchive({
        "index.js": new pulumi.asset.FileAsset("../dist/handlers/me.js"),
      }),
    }),

    stats: new aws.lambda.Function(`fn-stats-${projectName}-${environment}`, {
      ...defaultLambdaConfig,
      code: new pulumi.asset.AssetArchive({
        "index.js": new pulumi.asset.FileAsset("../dist/handlers/stats.js"),
      }),
    }),
  };
}
