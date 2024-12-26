import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class DockerRepositoryStack extends Stack {
  public readonly repository: Repository;
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.repository = new Repository(this, 'zero2prod-repo', {
      repositoryName: 'zero2prod',
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}