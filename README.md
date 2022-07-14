# AskReddit Video Bot

A Node.js project to automate the making of reddit thread videos.

This project uses the reddit API to get the top posts from the r/AskReddit thread,
Google Cloud Platform's text-to-voice to generate voiceovers and ffmpeg(ubuntu) to edit the videos.

The project is capable of making the whole video just from the user selecting a thread on the menu.

Some videos made by this project can be found on [This dummy channel](https://www.youtube.com/channel/UC2MR4V9dmncLnYCFTIz_4Kg/featured)

You can compare them with the videos found on [This +400k subs channel](https://www.youtube.com/user/SkyOnFir3)

# Requirements
- Git (https://git-scm.com/)
- Node 12.21.0 (https://nodejs.org)

# Install 
```
git clone https://github.com/filipedeschamps/video-maker.git
cd video-maker
npm install
```  
# Before you begin
Before you begin you'll need to setup the following services.

## Reddit API 
This project uses the [Snoowrap](https://www.npmjs.com/package/snoowrap) package for fetching reddit's threads data.

Reddit uses OAuth credentials to handle data fetching. 

Create a [Reddit App](https://github.com/reddit-archive/reddit/wiki/OAuth2#getting-started) in order to access the Reddit API.

Select the script option:

![env](https://i.imgur.com/XOgXczI.png)

Once your app is created, save it's credentials as env variables as such:

![env](https://i.imgur.com/LX68l12.png)

## Google Cloud Platform API
This project also uses the [@google-cloud/text-to-speech](https://www.npmjs.com/package/@google-cloud/text-to-speech).

Setup GCP text-to-speech:
- [Select or create a Cloud Platform project.](https://console.cloud.google.com/project)
- [Enable billing for your project.](https://support.google.com/cloud/answer/6293499#enable-billing)
- [Enable the Google Cloud Text-to-Speech API.](https://console.cloud.google.com/flows/enableapi?apiid=texttospeech.googleapis.com)
- [Set up authentication with a service account so you can access the API from your local workstation.](https://cloud.google.com/docs/authentication/getting-started)

# Run it
Just run the following command inside the cloned repo:

```bash
npm start
```

![Run](https://media.giphy.com/media/xCnbHCvFABVkJxD1QN/giphy.gif)

The output for every step will be on the "Result" folder.