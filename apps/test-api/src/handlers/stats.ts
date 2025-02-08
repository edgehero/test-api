import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
/**
 * Get the total number of users
 * @returns API Gateway response
 */

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const result = await dynamodb.scan({
      TableName: process.env.DYNAMODB_TABLE!,
      Select: 'COUNT'
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalUsers: result.Count || 0,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Stats error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
