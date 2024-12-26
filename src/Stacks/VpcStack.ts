import { Stack, StackProps } from 'aws-cdk-lib';
import { InterfaceVpcEndpointAwsService, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcStack extends Stack {

  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    this.vpc = new Vpc(this, 'zero2prod-vpc', {
      maxAzs: 3,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'zero2prod-public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'zero2prod-isolated',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    this.vpc.addInterfaceEndpoint('ECR', {
      service: InterfaceVpcEndpointAwsService.ECR,
      subnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },

    });

    this.vpc.addInterfaceEndpoint('ECR_DOCKER', {
      service: InterfaceVpcEndpointAwsService.ECR_DOCKER,
      subnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
    });

    this.vpc.addInterfaceEndpoint('CLOUDWATCH', {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      subnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
    });

    this.vpc.addGatewayEndpoint('S3', {
      service: InterfaceVpcEndpointAwsService.S3,
      subnets: [
        { subnetType: SubnetType.PRIVATE_ISOLATED }, // Apply to private subnets
      ],
    });

    this.vpc.addInterfaceEndpoint('SECRETS_MANAGER', {
      service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
    });

  }
}