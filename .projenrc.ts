import { awscdk } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'zero2prod.cdk',
  projenrcTs: true,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.addGitIgnore('.env');
project.addGitIgnore('psycopg2-layer.zip');
project.addDevDeps('cross-env', 'dotenv-cli');

const deployTask = project.tasks.tryFind('deploy')!;
deployTask.reset('dotenv -- npm run _deploy', { receiveArgs: true });
project.addTask('_deploy').exec('cross-env cdk deploy --profile $AWS_PROFILE', { receiveArgs: true });

const cdklsTask = project.addTask('cdkls');
cdklsTask.exec('dotenv -- cross-env cdk ls');

project.tasks.tryFind('destroy')?.reset('dotenv -- npm run _destroy', { receiveArgs: true });
project
  .addTask('_destroy')
  .exec('cross-env cdk destroy --profile $AWS_PROFILE', { receiveArgs: true });
project.tasks.tryFind('synth')?.reset('dotenv -- npm run _synth', { receiveArgs: true });
project.addTask('_synth').exec('cross-env cdk synth --profile $AWS_PROFILE', { receiveArgs: true });
project.tasks.tryFind('diff')?.reset('dotenv -- npm run _diff', { receiveArgs: true });
project.addTask('_diff').exec('cross-env cdk diff --profile $AWS_PROFILE', { receiveArgs: true });


project.synth();