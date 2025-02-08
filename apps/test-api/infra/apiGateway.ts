import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface ApiGatewayProps {
  projectName: string;
  environment: string;
  tags: { [key: string]: string };
  lambdaFunctions: {
    register: aws.lambda.Function;
    login: aws.lambda.Function;
    me: aws.lambda.Function;
    stats: aws.lambda.Function;
  };
}

/**
 * Create an API Gateway with routes for the Lambda functions
 * @param props ApiGatewayProps
 * @returns API Gateway and Stage
 * @see https://www.pulumi.com/docs/reference/pkg/aws/apigateway/
 */
export function createApiGateway(props: ApiGatewayProps) {
  const { projectName, environment } = props;

  // Create API Gateway
  const api = new aws.apigateway.RestApi(`agw-${projectName}-${environment}`, {
    name: `${projectName}-${environment}`,
    description: "User Management API",
    endpointConfiguration: {
      types:"REGIONAL",
    },
    tags: props.tags,
  });

  // Create routes
  const routes = {
    "register": { function: props.lambdaFunctions.register, method: "POST", path: "/register" },
    "login": { function: props.lambdaFunctions.login, method: "POST", path: "/login" },
    "me": { function: props.lambdaFunctions.me, method: "GET", path: "/me" },
    "stats": { function: props.lambdaFunctions.stats, method: "GET", path: "/stats" },
  };

  // Resources en methods maken
  const resources = Object.entries(routes).map(([name, config]) => {
    const resource = new aws.apigateway.Resource(`agr-${config.method}-${name}-${environment}`, {
      restApi: api,
      parentId: api.rootResourceId,
      pathPart: name,
    });

    // Main method
    const method = new aws.apigateway.Method(`agm-${config.method}-${name}-${environment}`, {
      restApi: api,
      resourceId: resource.id,
      httpMethod: config.method,
      authorization: "NONE",
      apiKeyRequired: false,
    });

    // Lambda integration
    const integration = new aws.apigateway.Integration(`agi-${config.method}-${name}-${environment}`, {
      restApi: api,
      resourceId: resource.id,
      httpMethod: config.method,
      integrationHttpMethod: "POST",
      type: "AWS_PROXY",
      uri: config.function.invokeArn,
    });

    // Lambda permission
    new aws.lambda.Permission(`agp-${name}-${environment}`, {
      action: "lambda:InvokeFunction",
      function: config.function,
      principal: "apigateway.amazonaws.com",
      sourceArn: pulumi.interpolate`${api.executionArn}/*/${config.method}/${name}`,
      statementId: `api_${name}_${environment}`,
    });

    return { resource, method, integration };
  });

  // Wacht tot alle resources en methods zijn aangemaakt
  const deployment = new aws.apigateway.Deployment(`agd-${projectName}-${environment}`, {
    restApi: api,
    triggers: {
      redeployment: new Date().toISOString(),
    },
  }, {
    dependsOn: resources.flatMap(r => [r.resource, r.method, r.integration])
  });

  // Stage
  const stage = new aws.apigateway.Stage(`ags-${projectName}-${environment}`, {
    deployment: deployment,
    restApi: api,
    stageName: environment,
    xrayTracingEnabled: true,
    tags: props.tags,
  });

  return { api, stage };
}
