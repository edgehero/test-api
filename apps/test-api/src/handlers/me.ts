import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();

/**
 * Get the user profile
 * @param event API Gateway event
 * @returns API Gateway response
 * @see https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html
 */

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const authHeader = event.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Missing authorization token' })
      };
    }

    // In werkelijkheid: JWT verify
    const token = authHeader.split(' ')[1];
    const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());

    // Haal gebruiker op uit DynamoDB
    const result = await dynamodb.get({
      TableName: process.env.DYNAMODB_TABLE!,
      Key: { id: decodedToken.sub }
    }).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Gebruiker niet gevonden' })
      };
    }

    // Verwijder gevoelige data... tja dit is nog steeds niet echt veilig
    const { password, ...userProfile } = result.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(userProfile)
    };

  } catch (error) {
    console.error('Me error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
