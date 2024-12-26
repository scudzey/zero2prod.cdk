import { aws_ecs_patterns, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, Port, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { AwsLogDriver, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export interface ApplicationStackProps extends StackProps {
  vpc: Vpc;
  ecr: Repository;
}

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, props);


    let app_log = new LogGroup(this, 'zero2prod-log-group', {
      logGroupName: '/ecs/zero2prod',
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const log_driver = new AwsLogDriver({
      logGroup: app_log,
      streamPrefix: 'fargate-service',
    });

    let database = new DatabaseInstance(this, 'zero2prod-db', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_16_6,
      }),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
      iamAuthentication: true,
      allocatedStorage: 20,
      databaseName: 'newsletter',
      deleteAutomatedBackups: true,
      credentials: Credentials.fromGeneratedSecret('postgres'),
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const db_login_secret = database.secret!;

    const db_endpoint = database.dbInstanceEndpointAddress;
    const db_port = database.dbInstanceEndpointPort;

    let ecs_service = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, 'zero2prod-service', {
      vpc: props.vpc,
      memoryLimitMiB: 512,
      cpu: 256,
      taskImageOptions: {
        image: ContainerImage.fromEcrRepository(props.ecr, 'latest'),
        logDriver: log_driver,
        environment: {
          RDS_HOST: db_endpoint,
          RDS_PORT: db_port,
          RDS_USER: 'service_user',
          RDS_SECRET_NAME: db_login_secret.secretArn,

        },
        containerPort: 8000,
      },
      taskSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
      listenerPort: 80,

    });
    db_login_secret.grantRead(ecs_service.taskDefinition.taskRole);

    app_log.grantWrite(ecs_service.taskDefinition.taskRole);
    props.ecr.grantPull(ecs_service.taskDefinition.taskRole);

    ecs_service.targetGroup.configureHealthCheck({
      path: '/health_check',
      port: '8000',
    });

    database.connections.allowFrom(ecs_service.service, database.connections.defaultPort ?? Port.tcp(5432) );
  }
}