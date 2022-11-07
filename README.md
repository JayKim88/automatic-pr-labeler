# Automatic-PR-Labeler

Create Automatic PR Label and Update it on a specific timely basis

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
