require("dotenv").config();
const readline = require("readline-sync");
const snoowrap = require("snoowrap");
const state = require("./state.js");
const redditCredentials = {
  userAgent: process.env.userAgent,
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  username: process.env.username,
  password: process.env.password,
};

async function reddit() {
  console.log(">[reddit] Starting...");
  const redditApi = new snoowrap(redditCredentials);
  let content = {};
  await selectThread(content);
  await getThreadContent(content);
  state.save(content.submission);

  async function selectThread(content) {
    try {
      await redditApi
        .getSubreddit("AskReddit")
        .getTop({ time: "week", limit: 9 })
        .then((listing) => {
          topThreads = listing.map((submission) => ({
            id: submission.id,
            title: submission.title,
          }));
        });
      content.id =
        topThreads[
          readline.keyInSelect(
            topThreads.map((post) => post.title),
            "Select a Thread: "
          )
        ].id;
    } catch (error) {
      if (!(error instanceof TypeError)) {
        console.log(">[reddit] Unexpected Behaviour:" + error);
        return;
      }
      console.log(">[reddit] Canceling...");
    }
  }

  async function getThreadContent(content) {
    return await redditApi
      .getSubmission(content.id)
      .expandReplies({ limit: 2, depth: 1 })
      .then((submission) => {
        content.submission = {
          id: submission.id,
          title: submission.title,
          author: submission.author.name,
          awards: submission.total_awards_received,
          ups: submission.ups,
          numComments: submission.num_comments,
          created: submission.created_utc,
          comments: submission.comments.map((comment) => ({
            id: comment.id,
            created: comment.created_utc,
            ups: comment.ups,
            body: comment.body,
            author: comment.author.name,
          })),
        };
      });
  }
}

module.exports = reddit;
