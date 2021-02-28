const core = require('@actions/core');
const github = require('@actions/github');
const repoToken = core.getInput('repo-token');
const payload = github.context.payload;
const octokit = github.getOctokit(repoToken)

function start() {
  evaluatePullRequest();
}

function evaluatePullRequest() {
  switch(payload.action) {
    case "opened", "reopened", "synchronize":
      addReadyToReviewLabel();
    break;
    case "submitted":
      evaluateReviews();
    break;
    default:
      console.log(`Action not supported ${payload.action}`);
  }
}

async function addReadyToReviewLabel() {
  const labelForReview = core.getInput('label-for-review');
  // PUT is used instead of POST as it removes the current assigned label and add the new one
  await octokit.request('PUT /repos/{owner}/{repo}/issues/{issue_number}/labels', {
    owner: payload.pull_request.base.repo.owner.login,
    repo: payload.pull_request.base.repo.name,
    issue_number: payload.number,
    labels: [
      labelForReview
    ]
  });
}

async function addApprovedLabel() {
  // PUT is used instead of POST as it removes the current assigned label and add the new one
  const labelForApproved = core.getInput('label-for-approved');
  await octokit.request('PUT /repos/{owner}/{repo}/issues/{issue_number}/labels', {
    owner: payload.pull_request.base.repo.owner.login,
    repo: payload.pull_request.base.repo.name,
    issue_number: payload.pull_request.number,
    labels: [
      labelForApproved
    ]
  });
}

async function evaluateReviews() {
  const result = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
    owner: payload.pull_request.base.repo.owner.login,
    repo: payload.pull_request.base.repo.name,
    pull_number: payload.pull_request.number
  });

  const numberOfApprovalsRequired = core.getInput('number-of-approvals');
  const reviews = result.data
  var approvals = 0

  reviews.forEach((item, i) => {
    if (item.state == "APPROVED") {
      approvals += 1;
    }
  });

  if (approvals >= numberOfApprovalsRequired) {
    addApprovedLabel();
  }
}

function logFullPayload() {
  const stringPayload = JSON.stringify(payload, undefined, 2);
  console.log(`The event payload: ${stringPayload}`);
}

start();

// REFERENCE
// CREATE JAVASCRIPT ACTION -- https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action
// REST FOR LABELS -- https://docs.github.com/en/rest/reference/issues#labels
// ADD LABELS TO A ISSUE -- https://docs.github.com/en/rest/reference/issues#add-labels-to-an-issue
// REVIEWS -- https://docs.github.com/en/rest/reference/pulls#list-reviews-for-a-pull-request
// OCTOKIT REST -- https://github.com/actions/toolkit/tree/main/packages/github
// EVENTS -- https://docs.github.com/en/actions/reference/events-that-trigger-workflows
