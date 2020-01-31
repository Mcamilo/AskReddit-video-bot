const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')
const credentials = require('../credentials/google-api.json')
const watsonApiKey = require('../credentials/ibm.json')
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');

async function youtube() {
  const content = state.load()
  var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey.apikey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
  });
  nlu.analyze(
    {
      html: "Fun fact: many Norwegians will falsely claim the paper clip to be one of few globally adapted Norwegian inventions. A patent was filed for a paper clip design by Johan Vaaler in 1899 and granted in 1901, but the one you’ll find in your local office supply shop is likely based on the “Gem” design.", // Buffer or String
      features: {
        keywords: {}
      }
    })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
      console.log('error:', err);
    });
  await getThumbnailImage('Potato Chips')

  async function getThumbnailImage(query){
    const response = await customSearch.cse.list({
      auth: credentials.apiKey,
      cx: credentials.searchEngineId,
      q:query,
      searchType:'image',
      imgSize:'huge',
      num: 1
    })
    console.log(response.data.items[0].link)
  }
}

module.exports = youtube
