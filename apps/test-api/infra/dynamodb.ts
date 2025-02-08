import * as aws from "@pulumi/aws";

interface DynamoDBProps {
  projectName: string;
  environment: string;
  tags: { [key: string]: string };
}

/**
 * Create a DynamoDB table for the users
 * @param props DynamoDBProps
 * @returns aws.dynamodb.Table
 * @see https://www.pulumi.com/docs/reference/pkg/aws/dynamodb/table/
*/

export function createDynamoDBTable(props: DynamoDBProps): aws.dynamodb.Table {
  const { projectName, environment } = props;

  return new aws.dynamodb.Table(`users-${projectName}-${environment}`, {
    attributes: [
      { name: "id", type: "S" },
      { name: "firstName", type: "S" },
    ],
    hashKey: "id",
    billingMode: "PAY_PER_REQUEST", // serverless enabled :)
    globalSecondaryIndexes: [{
      name: "firstName-index",
      hashKey: "firstName",
      projectionType: "ALL",
    }],
    pointInTimeRecovery: {
      enabled: true,
    },
    serverSideEncryption: {
      enabled: true,
    },
    tags: {
      ...props.tags,
      environment: props.environment,
    },
});
}
