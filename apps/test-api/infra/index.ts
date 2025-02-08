import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { createDynamoDBTable } from "./dynamodb";
import { createLambdaFunctions } from "./lambda";
import { createApiGateway } from "./apiGateway";
import { createCloudFront } from "./cloudfront";

// Get project and stack configuration
const projectName = pulumi.getProject(); // test-api :D
const stack = pulumi.getStack();

// Define common tags
const tags = {
  Project: projectName,
  Environment: stack,
  ManagedBy: "pulumi",
};

// Create Lambda functions
const userTable = createDynamoDBTable({
  projectName,
  environment: stack,
  tags,
});

// Create Lambda functions
const lambdaFunctions = createLambdaFunctions({
  projectName,
  environment: stack,
  tags,
  dynamoTableName: userTable.name,
});

// Create API Gateway
const apiGateway = createApiGateway({
  projectName,
  environment: stack,
  tags,
  lambdaFunctions,
});

// Create CloudFront distribution
const cloudfront = createCloudFront({
  projectName,
  environment: stack,
  tags,
  apiDomainName: pulumi.interpolate`${apiGateway.api.id}.execute-api.${aws.config.region}.amazonaws.com`,
});

// Export endpoints
export const apiEndpoint = pulumi.interpolate`https://${apiGateway.api.id}.execute-api.${aws.config.region}.amazonaws.com/${stack}`;
export const cdnEndpoint = cloudfront.domainName;
