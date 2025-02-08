import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface CloudFrontProps {
  projectName: string;
  environment: string;
  tags: { [key: string]: string };
  apiDomainName: pulumi.Output<string>;
}

/**
 * Create a CloudFront distribution for the API Gateway
 * @param props CloudFrontProps
 * @returns aws.cloudfront.Distribution
 * @see https://www.pulumi.com/docs/reference/pkg/aws/cloudfront/distribution/
 */
export function createCloudFront(props: CloudFrontProps) {
  const { projectName, environment } = props;

  const distribution = new aws.cloudfront.Distribution(`cd-${projectName}-${environment}`, {
    enabled: true,
    isIpv6Enabled: true,
    priceClass: 'PriceClass_100', // alleen Europa ;) voor testing
    tags: props.tags,

    origins: [{
      domainName: props.apiDomainName,
      originId: "ApiGateway",
      originPath: `/${environment}`,
      customOriginConfig: {
        httpPort: 80,
        httpsPort: 443,
        originProtocolPolicy: "https-only",
        originSslProtocols: ["TLSv1.2"],
      },
    }],

    defaultCacheBehavior: {
      allowedMethods: [
        "DELETE",
        "GET",
        "HEAD",
        "OPTIONS",
        "PATCH",
        "POST",
        "PUT",
      ],
      cachedMethods: ["GET", "HEAD"],
      targetOriginId: "ApiGateway",
      viewerProtocolPolicy: "redirect-to-https",
      forwardedValues: {
        queryString: true,
        cookies: {
          forward: "all",
        },
        headers: ["Authorization"],
      },
      minTtl: 0,
      defaultTtl: 0,
      maxTtl: 0,
    },

    restrictions: {
      geoRestriction: {
        restrictionType: "none",
      },
    },

    viewerCertificate: {
      cloudfrontDefaultCertificate: true,
      minimumProtocolVersion: "TLSv1.2_2021",
    },
  });

  return distribution;
}
