const core = require("@actions/core");
const github = require("@actions/github");

async function runAutomaticPRLabeler() {
  const GITHUB_TOKEN = core.getInput("token");
  const octokit = github.getOctokit(GITHUB_TOKEN);
  const { context = {} } = github;
  const { pull_request } = context.payload;

  if (!!pull_request?.number) {
    const prevLabels = pull_request.labels.map((v) => v.name);
    const isDDayLabelExist = prevLabels.find((v) => v[0] === "D");

    if (isDDayLabelExist) return;
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pull_request.number,
        labels: ["D-5", ...prevLabels],
      }
    );
    return;
  }

  const prList = await octokit
    .request("GET /repos/{owner}/{repo}/pulls", {
      owner: context.repo.owner,
      repo: context.repo.repo,
    })
    .then((v) => v.data);

  const prIssuesNeedLabelUpdate = prList.filter((v) => !v.draft);

  if (!prIssuesNeedLabelUpdate.length) return;

  const updateDDayLabelStatus = async (v) => {
    const prevLabels = v.labels.map((v) => v.name);
    const prevDDayLabels = prevLabels.filter((v) => v[0] === "D");

    if (!prevDDayLabels.length) return;

    const labelsExceptDDay = prevLabels.filter((v) => v[0] !== "D");
    const minDay = Math.min(...prevDDayLabels.map((v) => Number(v.slice(-1))));
    const shortestDDayLabel = prevDDayLabels.find(
      (v) => Number(v.slice(-1)) === minDay
    );

    const newDDay = Number(shortestDDayLabel.slice(-1)) - 1;
    const newDDayResult = newDDay >= 0 ? newDDay : 0;
    const newDDayLabel = "D-" + newDDayResult;
    await octokit.request(
      "PUT /repos/{owner}/{repo}/issues/{issue_number}/labels",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: v.number,
        labels: [newDDayLabel, ...labelsExceptDDay],
      }
    );
  };

  await prIssuesNeedLabelUpdate.forEach((v) => {
    updateDDayLabelStatus(v);
  });
}

runAutomaticPRLabeler();
