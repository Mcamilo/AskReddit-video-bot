const notifier = require('node-notifier');
const robots = {
	reddit: require('./robots/reddit.js'),
	text: require('./robots/text.js'),
	frames: require('./robots/frames.js'),
	audio: require('./robots/audio.js'),
	videos: require('./robots/videos.js'),
	youtube: require('./robots/youtube.js')
}

async function start() {
	await robots.reddit()
	await robots.text()
	await robots.frames()
	await robots.audio()
	await robots.videos()
	notifier.notify({
		title: 'Reddit-video-maker',
		message: 'Done!',
		icon: './resources/logo.png',
		sound: true
	});
}
start()
