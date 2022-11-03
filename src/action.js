const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
  const octokit = github.getOctokit(GITHUB_TOKEN);

  const { context = {} } = github;
  const { pull_request } = context.payload;

  const prList = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  console.log("prListprListprList", prList);

  if (!!pull_request.number) {
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pull_request.number,
        labels: ["D-5", "D-4"],
      }
    );

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_request.number,
      body: "New Pull Request is waiting for you valuable Code-Review 🥰",
    });
  } else {
    console.log("This is Scheduled action");

    const prList = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner: context.repo.owner,
      repo: "JayKim88/automatic-pr-labeler",
    });
  }
}

run();
