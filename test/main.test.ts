import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ApplicationStack } from '../src/Stacks/ApplicationStack';
import { DockerRepositoryStack } from '../src/Stacks/DockerRegistryStack';
import { VpcStack } from '../src/Stacks/VpcStack';

test('Snapshot', () => {
  const app = new App();
  const vpc_stack = new VpcStack(app, 'test');
  const docker_stack = new DockerRepositoryStack(app, 'test-repo', {});
  const app_stack = new ApplicationStack(app, 'test-app', { vpc: vpc_stack.vpc, ecr: docker_stack.repository });

  const template = Template.fromStack(vpc_stack);
  expect(template.toJSON()).toMatchSnapshot();
  const docker_template = Template.fromStack(docker_stack);
  const app_template = Template.fromStack(app_stack);
  expect(docker_template.toJSON()).toMatchSnapshot();
  expect(app_template.toJSON()).toMatchSnapshot();

});