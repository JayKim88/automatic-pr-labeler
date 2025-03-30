# Automatic-PR-Labeler

## Create Automatic PR Label and Update it on a specific timely basis

```yaml
name: PR Labeler
on:
  schedule:
    - cron: "Type UTC Time"
      branches:
        - "Type target Branch Name"
  pull_request:
    types: [opened]
    branches:
      - "Type target Branch Name"
jobs:
  Automatic-PR-labeler:
    runs-on: ubuntu-latest
    steps:
      - uses: JayKim88/automatic-pr-labeler@master
        with:
          token: ${{ secrets.Github-Token }}
```

## Code to use in Cloud run functions
```js
const { Octokit } = require("@octokit/core");

const GH_TOKEN = "{TARGET_GH_TOKEN}";

exports.runAutomaticPRLabeler = async (req, res) => {
  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  const octokit = new Octokit({
    auth: GH_TOKEN,
  });

  const prList = await octokit
    .request("GET /repos/{owner}/{repo}/pulls", {
      owner: "{TARGET_OWNER_NAME}",
      repo: "{TARGET_REPO_NAME}",
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
        owner: "{TARGET_OWNER_NAME}",
        repo: "{TARGET_REPO_NAME}",
        issue_number: v.number,
        labels: [newDDayLabel, ...labelsExceptDDay],
      }
    );
  };

  try {
    await prIssuesNeedLabelUpdate.forEach((v) => {
      updateDDayLabelStatus(v);
    });
    res.status(200).send("All PRs Updated");
  } catch (e) {
    res.status(410).send("Failed to update PRs");
  }
};


```
