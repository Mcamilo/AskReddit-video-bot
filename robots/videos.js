const fluent_ffmpeg = require("fluent-ffmpeg");
const videoshow = require('videoshow')
const SoxCommand = require('sox-audio')
const state = require('./state.js')
const fs = require('fs');

async function videos() {
  console.log("Video Bot...");
  const content = state.load()
  const framesPath = "./frames/"+content.id
  const audiosPath = "./audios/"+content.id
  const videosPath = "./videos/"+content.id
  const resultsPath = "./results/"+content.id
  var options = {
    fps: 30,
    transition: false,
    videoBitrate: 1024,
    videoCodec: 'libx264',
    size: '1920x1080',
    format: 'mp4',
    pixelFormat: 'yuv420p',
    audioBitrate: "319k",
    audioChannels: 2,
    debug: false
  }
  var audioParams = {
    fade: false,
    delay: 0 // seconds
  }

  await generateVideos()
  await addCuts()
  // await mixBackground()

  async function generateVideos(){
    try {
      fs.mkdirSync(videosPath)
    } catch (e) {

    }

    await  render([{path:framesPath+'/'+content.id+'.png', loop:content.duration+0.4}], content.id)
    for (const comment of content.comments) {
      for (const frame of comment.frames) {
        await render([{path:frame.path, loop:frame.loop}], frame.id)
      }
    }
  }

  async function render(frame, id) {
    let promise = new Promise((resolve, reject) => {
    videoshow(frame, options)
    // .audio(audiosPath+'/d3qt15u-1.flac', audioParams)
    .audio('./resources/noise.flac', audioParams)
    .save(videosPath+'/'+id+'.mp4')
    .on('start', function (command) {
      console.log('Render:', command)
    })
    .on('error', function (err) {
      console.error('Error:', err)
      reject()
    })
    .on('end', function (output) {
      console.log('Video created in:', output)
      resolve()
    })
    });
    return promise
  }

  async function addCuts() {
    try {
      fs.mkdirSync(resultsPath)
    } catch (e) {
    }

    var mergedVideo = fluent_ffmpeg();
    let promise = new Promise((resolve, reject) => {
      mergedVideo.addInput(videosPath+'/'+content.id+'.mp4')
      mergedVideo.addInput('./resources/cut.mp4')
      content.comments.forEach(comment => {
        comment.frames.forEach(frame => {
          mergedVideo.addInput(videosPath+'/'+frame.id+'.mp4')
        })
        mergedVideo.addInput('./resources/cut.mp4')
      });
      mergedVideo.addInput('./resources/outro.mp4')

      mergedVideo.mergeToFile(resultsPath+'/video.mp4', './tmp/')
      .on('error', function(err) {
          console.log('Error ' + err.message);
      })
      .on('end', function() {
          console.log('Cut Inserted');
          resolve()
      });
    });
    return promise
  }

  async function mixBackground(){
    var ffmpeg = fluent_ffmpeg();
    let promise = new Promise((resolve, reject) => {
      ffmpeg.addInput(resultsPath+'/video.mp4')
      .complexFilter([
        'amovie=./resources/background1.flac:loop=0,asetpts=N/SR/TB[aud]',
        '[0:a][aud]amix[a]'
      ])
      .outputOptions(['-map 0:v','-map [a]','-shortest'])
      .audioCodec('aac')
      .audioBitrate('256k')
      .videoCodec('copy')
      .save('./results/'+content.id+'/resultado.mp4')
      .on('start', function (command) {
        console.log('ffmpeg process started:', command)
      })
      .on('error', function (err) {
        console.error('Error:', err)
      })
      .on('end', function (output) {
        console.log('Video created in:', output)
      })
    });
    return promise
  }

}
module.exports = videos
