const state = require('./state.js')

async function text(){
  console.log("Text Bot...");

  const content = state.load()
  // const text = '*Read*\n\nAlso\n\n*Seen*'
  // console.log(text.match(/\(?[^\.\?\!\n]+[.+!?_"'\n]+\)?|.*/g));
  filterWords()
  makeSentences()
  state.save(content)

  function filterWords(){
    content.comments.forEach(comment => {
    // comment.body = comment.body.replace(/\n/g, "<br/>")
    comment.body = comment.body.replace(/'fuck'/g,'duck')
    comment.body = comment.body.replace(/'fucking'/g,'ducking')
  })
  }

  function makeSentences() {
    content.comments.forEach(comment => {
      let sentences = (comment.body).match(/\(?[^\.\?\!\n]+[.+!?_\n]+\)?|.*/g)
      comment.sentences = sentences.filter((entry) => { return entry.trim() != '' })
    })
  }




}

module.exports = text
