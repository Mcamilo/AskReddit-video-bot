const fs = require("fs");
const state = require("./state.js");
const webshot = require("node-webshot");

const templates_path = "./resources/templates";
const questionHTML = fs.readFileSync(
  `${templates_path}/question.html`,
  "utf-8"
);
const commentHTML = fs.readFileSync(`${templates_path}/comment.html`, "utf-8");

const date = new Date();
const timestamp = date.getTime();
const resultFramesPath = "./result/frames";
const options = {
  screenSize: {
    width: 1920,
    height: 1080,
  },
  siteType: "html",
};
const content = state.load();
const dir = content.id;

async function frames() {
  console.log(">[frames] Starting...");
  await generateQuestionFrame();
  await generateCommentsFrames();
  state.save(content);
}

async function generateQuestionFrame() {
  filepath = `${resultFramesPath}/${dir}/${content.id}.png`;
  let fileReplaced = questionHTML.replace("QUESTION", content.title);
  fileReplaced = fileReplaced.replace("AUTHOR", content.author);
  fileReplaced = fileReplaced.replace("UPS", kFormatter(content.ups));
  fileReplaced = fileReplaced.replace(
    "COMMENTS_NUM",
    kFormatter(content.numComments)
  );
  fileReplaced = fileReplaced.replace("CREATED", getDate(content.created));

  await webshotPromise(fileReplaced, filepath, options);
}

async function generateCommentsFrames() {
  for (const comment of content.comments) {
    var concatSentence = "";
    var i = 0;
    var sentenceList = [];
    for (const sentence of comment.sentences) {
      concatSentence += sentence.replace(/\n/g, "<br/>");
      i++;
      filepath = `${resultFramesPath}/${dir}/${comment.id}-${i}.png`;
      let fileReplaced = commentHTML.replace("AUTOR", comment.author);
      fileReplaced = fileReplaced.replace("UPS", kFormatter(comment.ups));
      fileReplaced = fileReplaced.replace("CREATED", getDate(comment.created));
      fileReplaced = fileReplaced.replace("SENTENCE", concatSentence);
      fileReplaced = fileReplaced.replace(
        "FULL",
        comment.body.replace(/\n/g, "<br/>")
      );

      await webshotPromise(fileReplaced, filepath, options);
      sentenceList.push({ body: sentence, path: filepath });
    }
    comment.frames = sentenceList;
  }
}

async function webshotPromise(html, screenPath, options) {
  let promise = new Promise((resolve, reject) => {
    webshot(html, screenPath, options, (e) =>
      !e ? resolve(screenPath) : reject(e)
    );
  });
  return promise;
}
function getDate(created) {
  resolution = timestamp - created * 1000;
  var resolutionTime = Math.floor(resolution / 1000 / 60 / 60);
  if (resolutionTime > 23) {
    return Math.round(resolutionTime / 24) + " days";
  }
  return resolutionTime + " hours";
}

function kFormatter(num) {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
    : Math.sign(num) * Math.abs(num);
}

module.exports = frames;
