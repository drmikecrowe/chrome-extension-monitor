const vm = require("vm");
const axios = require("axios");

async function jsonpExtensionThreads(extensionId) {
  const req = {
    appId: 94,
    version: "150922",
    hl: "en",
    specs: [
      {
        type: "CommentThread",
        url: `http://chrome.google.com/extensions/permalink?id=${extensionId}`,
        groups: "chrome_webstore",
        sortby: "date",
        startindex: "0",
        numresults: "25",
        id: "0", // Top-level response key.
      },
      {
        type: "CommentThread",
        url: `http://chrome.google.com/extensions/permalink?id=${extensionId}`,
        groups: "chrome_webstore_support",
        sortby: "date",
        startindex: "0",
        numresults: "25",
        id: "1", // Top-level response key.
      },
    ],
    internedKeys: [],
    internedValues: [],
  };

  console.log(`Fetch threads for ${extensionId}.`);

  let resp = await axios({
    url: "https://chrome.google.com/reviews/components",
    method: "post",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
    },
    data: `req=${JSON.stringify(req)}`,
  });

  if (resp.status !== 200) {
    throw new Error(`Unexpected HTTP response status: ${resp.status}.`);
  }

  return resp.data;
}

function loadJsonp(source) {
  // Replace the JSONP method call with a simple load(...) call.
  const jsonp = source.replace(/^.*?\(/, "load(");

  const sandbox = {
    result: null,
    load: function() {
      return arguments;
    },
  };

  // Evaluate the JSONP in a sandbox and extract the result.
  vm.runInNewContext(`result=${jsonp}`, sandbox);
  return sandbox.result;
}

function authorFromAnnotation(annotation) {
  let entity = annotation.entity;
  return {
    name: entity.displayName,
    url: entity.profileUrl,
    image: entity.authorPhotoUrl,
  };
}

function reviewFromAnnotation(annotation) {
  return {
    author: authorFromAnnotation(annotation),
    comment: annotation.comment,
    rating: annotation.starRating,
    createdAt: annotation.creationTimestamp,
  };
}

function issueFromAnnotation(annotation) {
  return {
    author: authorFromAnnotation(annotation),
    title: annotation.title,
    comment: annotation.comment,
    type: (annotation.attributes.sfrAttributes.issueType || "").toLowerCase(),
    createdAt: annotation.timestamp,
  };
}

async function fetchExtensionThreads(extensionId) {
  let jsonp = await jsonpExtensionThreads(extensionId);
  let [threads] = loadJsonp(jsonp);

  let reviews = threads[0].results.annotations.map(reviewFromAnnotation);
  let issues = threads[1].results.annotations.map(issueFromAnnotation);

  return { reviews, issues };
}

async function fetchNewPosts(extensionId, last) {
  let { reviews, issues } = await fetchExtensionThreads(extensionId);

  let reviewsLast = last.reviews || 0;
  let issuesLast = last.issues || 0;

  let newReviews = reviews.filter(r => r.createdAt > reviewsLast).sort((p, q) => p.createdAt - q.createdAt);

  let newIssues = issues.filter(i => i.createdAt > issuesLast).sort((p, q) => p.createdAt - q.createdAt);

  if (newReviews.length) {
    last.reviews = newReviews[newReviews.length - 1].createdAt;
  }

  if (newIssues.length) {
    last.issues = newIssues[newIssues.length - 1].createdAt;
  }

  return {
    reviews: newReviews,
    issues: newIssues,
    last,
  };
}

async function scan(id, last_reviews, last_issues) {
  const last = { reviews: last_reviews || 0, issues: last_issues || 0 };

  const results = await fetchNewPosts(id, last);
  const { reviews, issues } = results;

  console.log(`Scanned ${id} and found ${reviews.length} new reviews, and ${issues.length} new issues`);
  return results;
}

module.exports = scan;
