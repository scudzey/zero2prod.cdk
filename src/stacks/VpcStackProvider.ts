import { DefaultStackProvider } from "@cdklabs/cdk-cicd-wrapper";
import { Stack } from "aws-cdk-lib";
import { FlowLog, FlowLogResourceType, Vpc } from "aws-cdk-lib/aws-ec2";

export class VpcStackProvider extends DefaultStackProvider {
    stacks(): void {
        let vpc_stack = new Stack(this.scope, "vpc_stack")
        
        let vpc = new Vpc(vpc_stack, "Service_VPC", {
            maxAzs: 3,
        })
        new FlowLog(vpc_stack, "vpc_flow_log", {
            resourceType: FlowLogResourceType.fromVpc(vpc)
        })

        this.register('service_vpc', vpc);
    }
}