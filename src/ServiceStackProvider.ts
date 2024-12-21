import { DefaultStackProvider } from '@cdklabs/cdk-cicd-wrapper';
import { ServiceStack } from './stacks/service';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class ServiceStackProvider extends DefaultStackProvider {

  stacks(): void {
    new ServiceStack(this.scope, 'ExampleStack', {
      env: this.env,
    });
    new Bucket(this.scope, "provider_bucket", {
            enforceSSL: true,
            
          });

  }
}