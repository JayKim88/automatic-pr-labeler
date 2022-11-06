const core = require("@actions/core");
const github = require("@actions/github");

async function runAutomaticLabeler() {
  const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
  const octokit = github.getOctokit(GITHUB_TOKEN);

  const { context = {} } = github;
  const { pull_request } = context.payload;

  if (!!pull_request?.number) {
    // pr label 중 D로 시작하는 라벨이 존재하면, 안 만든다.
    // 존재하지 않으면, D-5 로 만들어 준다.
    const isDDayLabelExist = pull_request.labels.find((v) => v.name[0] === "D");
    if (isDDayLabelExist) return;
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/labels",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: pull_request.number,
        labels: ["D-5"],
      }
    );
    // return;
  }

  const prList = await octokit
    .request("GET /repos/{owner}/{repo}/pulls", {
      owner: context.repo.owner,
      repo: context.repo.repo,
    })
    .then((v) => v.data);

  const prIssuesNeedLabelUpdate =
    prList.length && prList.filter((v) => !v.draft);

  if (!prIssuesNeedLabelUpdate) return;

  const updateDDayLabelStatus = async (v) => {
    const prevDDayLabels = v.labels.filter((v) => v.name[0] === "D");
    console.log("prevDDayLabels?", prevDDayLabels);
    const minDay = Math.min(
      prevDDayLabels.map((v) => Number(v.name.slice(-1)))
    );

    const dDayLabelToUpdate = prevDDayLabels.filter(
      (v) => Number(v.name.slice(-1)) === minDay
    )[0];

    if (!dDayLabelToUpdate) return;
    const newDDay = Number(dDayLabelToUpdate.name.slice(-1)) - 1;
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

  await prIssuesNeedLabelUpdate.forEach((v) => {
    updateDDayLabelStatus(v);
  });
}

runAutomaticLabeler();
