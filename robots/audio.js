const { getAudioDurationInSeconds } = require("get-audio-duration");
const fs = require("fs");
const state = require("./state.js");
const textToSpeech = require("@google-cloud/text-to-speech");
const util = require("util");

// Inject Google app credentials
// export GOOGLE_APPLICATION_CREDENTIALS="/path_to_credentials/credentials.json"
const client = new textToSpeech.TextToSpeechClient();
const content = state.load();
const audioPath = "./result/audios/" + content.id;

async function audio() {
  console.log("> [audio] Starting...");
  await generateAudioQuestion();
  await generateAudios();
  state.save(content);

  async function generateAudioQuestion() {
    try {
      fs.mkdirSync(audioPath, { recursive: true });
    } catch (e) {
      console.log(`Error: ${e}`);
    }
    var request = {
      input: { text: content.title },
      voice: {
        languageCode: "en-GB",
        name: "en-GB-Wavenet-B",
        ssmlGender: "MALE",
      },
      audioConfig: {
        audioEncoding: "LINEAR16",
        effectsProfileId: ["handset-class-device"],
        speakingRate: 0.8,
        pitch: -4,
        sampleRateHertz: 44100,
        volumeGainDb: 6,
      },
    };
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(
      audioPath + "/" + content.id + ".flac",
      response.audioContent,
      "binary"
    );
    content.duration = await getDuration(
      audioPath + "/" + content.id + ".flac"
    );
    content.audio = audioPath + "/" + content.id + ".flac";
  }

  async function generateAudios() {
    for (const comment of content.comments) {
      var i = 0;
      for (const frame of comment.frames) {
        i++;
        sentencePath = audioPath + "/" + comment.id + "-" + i + ".flac";
        var request = {
          input: { text: frame.body },
          voice: {
            languageCode: "en-GB",
            name: "en-GB-Wavenet-B",
            ssmlGender: "MALE",
          },
          audioConfig: {
            audioEncoding: "LINEAR16",
            effectsProfileId: ["handset-class-device"],
            speakingRate: 1,
            pitch: -4.5,
            sampleRateHertz: 44100,
            volumeGainDb: 6,
          },
        };
        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        await writeFile(sentencePath, response.audioContent, "binary");
        frame.loop = await getDuration(sentencePath);
        frame.audio = sentencePath;
        frame.id = comment.id + "-" + i;
      }
    }
  }

  async function getDuration(filePath) {
    return await getAudioDurationInSeconds(filePath).then(
      (duration) => duration
    );
  }
}

module.exports = audio;
