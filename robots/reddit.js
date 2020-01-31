const snoowrap = require('snoowrap')
const readline = require('readline-sync')
const credentials = require('../credentials/snoowrap.json')
const state = require('./state.js')
const util = require('util')

async function reddit() {
	var charCount = 0
	const	redditApi = new snoowrap(credentials)
	// const postId = await askSubreddit()
	const submission = await getSubmission()
	await filterSubmission()

	async function askSubreddit() {
		await redditApi.getSubreddit('AskReddit').getTop({time:'week',limit:30}).then(listing=>{
			post_list = listing.map(submission=>({"id":submission.id, "title":submission.title}))
		})
		return post_list[readline.keyInSelect(post_list.map(post=>post.title),'Selecione um Post:')].id
	}

	async function getSubmission(){
		// return await redditApi.getSubmission(postId).expandReplies({limit: 2, depth: 1}).then(
		return await redditApi.getSubmission('1ctqjr').expandReplies({limit: 2, depth: 1}).then(
			submission => {
				return {"id":submission.id,"title":submission.title,
				"author":submission.author.name,"awards":submission.total_awards_received,
				"ups":submission.ups,"numComments":submission.num_comments,"created":submission.created_utc,
				"comments":submission.comments.map(comment=>({id:comment.id,created:comment.created_utc,ups:comment.ups,body:comment.body,author:comment.author.name}))
				}
			})
	}

	function filterSubmission(){
		submission.comments.sort((a, b) => (a.ups > b.ups) ? -1 : 1)
		submission.comments = filterCommentsVolume()
		state.save(submission)
	}

	function filterCommentsVolume(){
		let filteredComments = []
		for (comment of submission.comments) {
			charCount += comment.body.length
			filteredComments.push(comment)
			if (charCount>15000) {
				return filteredComments
			}
		}
		return filteredComments
	}
}

module.exports = reddit
