# SimpleLabeler for Pull Requests

This GitHub Action automatically applies labels for the following states of a pull request:
- Pull request Open/Reopen/Synchronize - parameter `label-for-review` e.g. Ready for review.
- Pull request review submitted - parameter `label-for-approved` e.g. Approved.

You can also select the number of approvals required by using the parameter `number-of-approvals`

## Usage

This Action subscribes to **Pull Request** and **Pull Request Reviews** in order to update.

```workflow
on:
  pull_request:
    types: [opened, reopened, synchronize]
  pull_request_review:
    types: [submitted]

jobs:
  labeler_job:
    runs-on: ubuntu-latest
    name: Handle pull request labels
    steps:
    - name: Pull request labeler
      id: labeler
      uses: rihurla/SimpleLabeler@v1
      with:
        repo-token: "${{ secrets.GITHUB_TOKEN }}"
        label-for-review: 'Ready for review'
        label-for-approved: 'Approved'
        number-of-approvals: 1
```
