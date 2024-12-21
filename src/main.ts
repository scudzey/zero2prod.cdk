import { App } from 'aws-cdk-lib';
import { PipelineBlueprint } from '@cdklabs/cdk-cicd-wrapper';
import { ServiceStackProvider } from './ServiceStackProvider';
import { VpcStackProvider } from './stacks/VpcStackProvider';


const app = new App();

PipelineBlueprint.builder()
  .addStack(new VpcStackProvider())
  .addStack(new ServiceStackProvider())
  .synth(app);

app.synth();