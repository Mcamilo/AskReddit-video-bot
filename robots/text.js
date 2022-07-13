const state = require("./state.js");
// 18 chars per sec. of video --> 10 min ≃ 11k chars
const charLimit = 3000;

async function text() {
  console.log(">[text] Initializing...");
  const content = state.load();
  getMostUpvotedComments(content);
  makeSentences(content);
  state.save(content);
}

function getMostUpvotedComments(content) {
  content.comments.sort((a, b) => (a.ups > b.ups ? -1 : 1));
  content.comments = filterCommentsVolume(content);
}

function filterCommentsVolume(content) {
  var charCount = 0;
  let filteredComments = [];
  for (comment of content.comments) {
    charCount += comment.body.length;
    filteredComments.push(comment);
    if (charCount > charLimit) {
      return filteredComments;
    }
  }
  return filteredComments;
}

function makeSentences(content) {
  content.comments.forEach((comment) => {
    let sentences = comment.body.match(/\(?[^\.\?\!\n]+[.+!?_\n]+\)?|.*/g);
    comment.sentences = sentences.filter((entry) => {
      return entry.trim() != "";
    });
  });
}

module.exports = text;
