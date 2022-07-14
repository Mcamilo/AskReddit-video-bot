const fluent_ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const state = require("./state.js");
const videoshow = require("videoshow");

const audioResourcesPath = "./resources/audio";
const framesPath = "./result/frames";
const audiosPath = "./result/audios";
const videosPath = "./result/videos-cuts";
const resultsPath = `./result/final-videos`;

var options = {
  fps: 30,
  transition: false,
  videoBitrate: 1024,
  videoCodec: "libx264",
  size: "1920x1080",
  format: "mp4",
  pixelFormat: "yuv420p",
  audioBitrate: "319k",
  audioChannels: 2,
  debug: false,
};
var audioParams = {
  fade: false,
  delay: 0, // seconds
};

async function videos() {
  console.log(">[video] Starting...");
  const content = state.load();
  
  await generateVideoCuts(content);
  await mergeCuts(content);
  await mixBackgroundSound(content);

  async function generateVideoCuts(content) {
    try {
      fs.mkdirSync(`${videosPath}/${content.id}`, { recursive: true });
    } catch (e) {
      console.log(e);
    }

    await render(
      [
        {
          path: `${framesPath}/${content.id}/${content.id}.png`,
          loop: content.duration + 0.4,
        },
      ],
      content.id
    );
    for (const comment of content.comments) {
      for (const frame of comment.frames) {
        await render([{ path: frame.path, loop: frame.loop }], frame.id);
      }
    }
  }

  async function render(frame, id) {
    let promise = new Promise((resolve, reject) => {
      videoshow(frame, options)
        .audio(`${audiosPath}/${content.id}/${id}.flac`, audioParams)
        .save(`${videosPath}/${content.id}/${id}.mp4`)
        .on("start", function (command) {
          console.log(">[video] Rendering");
        })
        .on("error", function (err) {
          console.error(">[video]", err);
          reject();
        })
        .on("end", function (output) {
          console.log(">[video] Video Cut created in:", output);
          resolve();
        });
    });
    return promise;
  }

  async function mergeCuts(content) {
    try {
      fs.mkdirSync(`${resultsPath}/${content.id}`, { recursive: true });
    } catch (e) {
      console.log(e);
    }

    var mergedVideo = fluent_ffmpeg();
    let promise = new Promise((resolve, reject) => {
      mergedVideo.addInput(`${videosPath}/${content.id}/${content.id}.mp4`);
      mergedVideo.addInput(`${audioResourcesPath}/cut.mp4`);
      content.comments.forEach((comment) => {
        comment.frames.forEach((frame) => {
          mergedVideo.addInput(`${videosPath}/${content.id}/${frame.id}.mp4`);
        });
        mergedVideo.addInput(`${audioResourcesPath}/cut.mp4`);
      });
      mergedVideo.addInput(`${audioResourcesPath}/outro.mp4`);

      mergedVideo
        .mergeToFile(`${resultsPath}/${content.id}/${content.id}-video.mp4`, "./tmp/")
        .on("start", function(){
          console.log(">[video] Merging Cuts")
        })
        .on("error", function (err) {
          console.log(">[video] " + err.message);
        })
        .on("end", function () {
          console.log(">[video] Cuts Merged");
          resolve();
        });
    });
    return promise;
  }

  async function mixBackgroundSound(content) {
    var ffmpeg = fluent_ffmpeg();
    let promise = new Promise((resolve, reject) => {
      ffmpeg
        .addInput(`${resultsPath}/${content.id}/${content.id}-video.mp4`)
        .complexFilter([
          `amovie=${audioResourcesPath}/background.flac:loop=0,asetpts=N/SR/TB[aud]`,
          "[0:a][aud]amix[a]",
        ])
        .outputOptions(["-map 0:v", "-map [a]", "-shortest"])
        .audioCodec("aac")
        .audioBitrate("256k")
        .videoCodec("copy")
        .save(`${resultsPath}/${content.id}/${content.id}-background-video.mp4`)
        .on("start", function (command) {
          console.log(">[video] ffmpeg process started:", command);
        })
        .on("error", function (err) {
          console.error(">[video] ", err);
        })
        .on("end", function (output) {
          console.log(
            `>[video] Video created in: ${resultsPath}/${content.id}/${content.id}-background-video.mp4`
          );
        });
    });
    return promise;
  }
}
module.exports = videos;
