import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();

interface LoginRequest {
  email: string;
  password: string;
}
/**
 * Login a user, werkt nu niet vanwege tijd, effe gedummy'd
 * maar zou dit nooit zo in het echt doen, gebruik een service zoals AWS Cognito of Auth0. GDPR enzo.
 * @param event API Gateway event
 * @returns API Gateway response
 * @see https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html
 */


export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}') as LoginRequest;

    if (!body.email || !body.password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email en wachtwoord zijn verplicht' })
      };
    }

    // Dummy JWT generatie
    const dummyToken = Buffer.from(JSON.stringify({
      sub: 'dummy-user-id',
      email: body.email,
      exp: Math.floor(Date.now() / 1000) + (60 * 60)
    })).toString('base64');

    return {
      statusCode: 200,
      body: JSON.stringify({ token: dummyToken })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
