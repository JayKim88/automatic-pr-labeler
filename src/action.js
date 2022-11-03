const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
  const octokit = github.getOctokit(GITHUB_TOKEN);

  const { context = {} } = github;
  const { pull_request } = context.payload;

  const prList = await octokit
    .request("GET /repos/{owner}/{repo}/pulls", {
      owner: context.repo.owner,
      repo: context.repo.repo,
    })
    .then((v) => v.data);

  const prIssuesNeedLabelUpdate =
    prList.length && prList.filter((v) => !v.draft);

  if (!!pull_request?.number) {
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
    // return;
  }
  if (!prIssuesNeedLabelUpdate) return;

  // const checkedPrIssues = prIssuesNeedLabelUpdate.map(v => ({
  //   issueNumber: v.number
  //   lastLabels: v.labels
  // }))

  console.log("prListprListprList", prIssuesNeedLabelUpdate);

  const updateDDayLabelStatus = async (v) => {
    const prevDDayLabel = v.labels.filter((v) => v[0] === "D")[0];
    if (!prevDDayLabel) return;
    const newDDay = Number(prevDDayLabel.slice(-1)) - 1;
    const newDDayResult = newDDay >= 0 ? newDDay : 0;
    const newDDayLabel = "D-" + newDDayResult;

    await octokit.request(
      "PUT /repos/{owner}/{repo}/issues/{issue_number}/labels",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: v.number,
        labels: [newDDayLabel],
      }
    );
  };

  await prIssuesNeedLabelUpdate.forEach((v) => updateDDayLabelStatus(v));
}

run();
