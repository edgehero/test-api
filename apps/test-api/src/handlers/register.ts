import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient();

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
/**
 * Register a new user, maar zou dit nooit zo in het echt doen, gebruik een service zoals AWS Cognito of Auth0. GDPR enzo.
 * @param event API Gateway event
 * @returns API Gateway response
 * @see https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html
 */

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}') as RegisterRequest;

    // Valideer input
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'kerel je mist wat verplichte veldjes, jij mag raden welke :D' })
      };
    }

    const userId = uuidv4();
    const timestamp = new Date().toISOString();

    await dynamodb.put({
      TableName: process.env.DYNAMODB_TABLE!,
      Item: {
        id: userId,
        email: body.email,
        password: 'securepass',
        firstName: body.firstName,
        lastName: body.lastName,
        createdAt: timestamp
      }
    }).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({
        id: userId,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        createdAt: timestamp
      })
    };

  } catch (error) {
    console.error('Register error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
