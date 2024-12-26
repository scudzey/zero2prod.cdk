import { App } from 'aws-cdk-lib';
import { ApplicationStack } from './Stacks/ApplicationStack';
import { DockerRepositoryStack } from './Stacks/DockerRegistryStack';
import { VpcStack } from './Stacks/VpcStack';
// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

let vpc_stack = new VpcStack(app, 'zero2prod-cdk-vpc-stack', { env: devEnv });
let docker_stack = new DockerRepositoryStack(app, 'zero2prod-cdk-ecr-stack', { env: devEnv });
let app_stack = new ApplicationStack(app, 'zero2prod-cdk-app-stack', { env: devEnv, vpc: vpc_stack.vpc, ecr: docker_stack.repository });


app_stack.addDependency(vpc_stack);
app_stack.addDependency(docker_stack);


app.synth();