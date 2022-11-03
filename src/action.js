const core = require("@actions/core");
const github = require("@actions/github");

// try {
//   // `who-to-greet` input defined in action metadata file
//   const nameToGreet = core.getInput("who-to-greet");
//   console.log(`Hello ${nameToGreet}!`);
//   const time = new Date().toTimeString();
//   core.setOutput("time", time);
//   // Get the JSON webhook payload for the event that triggered the workflow
//   const payload = JSON.stringify(github.context.payload, undefined, 2);
//   console.log(`The event payload: ${payload}`);
// } catch (error) {
//   core.setFailed(error.message);
// }

async function run() {
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
  const octokit = github.getOctokit(GITHUB_TOKEN);

  const { context = {} } = github;
  const { pull_request } = context.payload;

  await octokit.rest.issues.createLabel({
    ...context.repo,
    issue_number: pull_request.number,
    name: "D-0",
    color: "red",
    description: "as soon as possible",
  });

  await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pull_request.number,
    body: "Thank you for submitting a pull request! We will try to review this asap we can",
  });
}

run();
