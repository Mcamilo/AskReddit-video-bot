const textToSpeech = require('@google-cloud/text-to-speech')
const state = require('./state.js')
const { getAudioDurationInSeconds } = require('get-audio-duration')
const SoxCommand = require('sox-audio')

// cerca de 18 chars por seg. 10 min =~ 11k.
// export GOOGLE_APPLICATION_CREDENTIALS="/home/camilo/reddit-video-maker/credentials/reddit-video-maker-7dbf9ddf62cf.json"
// whoosh --> 0.426

const fs = require('fs')
const util = require('util')

async function audio() {
  console.log("Audio Bot...")
  const client = new textToSpeech.TextToSpeechClient()
  const content = state.load()
  const audioPath = './audios/'+content.id
  const outputFileName = './results/output.flac'
  const backgroundSound = './resources/background1.flac'
  // const audioTransition = './resources/transition.flac'
  // const transitionDuration = await getAudioDurationInSeconds(audioTransition)

  await generateAudioQuestion()
  await generateAudios()

  state.save(content)

  async function generateAudioQuestion(){
    try {
      fs.mkdirSync(audioPath)
    } catch (e) {
      // console.log("ERROR:"+e.code);
    }
    var request = {
      input: {text: content.title},
      voice: {languageCode: 'en-GB',name:'en-GB-Wavenet-B', ssmlGender: 'MALE'},
      audioConfig: {audioEncoding: 'LINEAR16', effectsProfileId:['handset-class-device'],
      speakingRate:0.8, pitch:-4, sampleRateHertz: 44100, volumeGainDb: 6},
    };
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(audioPath+'/'+content.id+'.flac', response.audioContent, 'binary');
    content.duration = await getDuration(audioPath+'/'+content.id+'.flac');
    content.audio = audioPath+'/'+content.id+'.flac'
  }
  async function generateAudios() {
    for (const comment of content.comments) {
        var i = 0
        for (const frame of comment.frames) {
        i++
        sentencePath = audioPath+'/'+comment.id+'-'+i+'.flac'
        var request = {
          input: {text: frame.body},
          voice: {languageCode: 'en-GB',name:'en-GB-Wavenet-B', ssmlGender: 'MALE'},
          audioConfig: {audioEncoding: 'LINEAR16', effectsProfileId:['handset-class-device'],
          speakingRate:1, pitch:-4.5, sampleRateHertz: 44100, volumeGainDb: 6},
        };
        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        await writeFile(sentencePath, response.audioContent, 'binary');
        frame.loop = await getDuration(sentencePath);
        frame.audio = sentencePath
        frame.id = comment.id+'-'+i
      }
    }
  }

  async function getDuration(filePath){
   return await getAudioDurationInSeconds(filePath).then((duration) => duration)
  }

}

module.exports = audio
