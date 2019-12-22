# Chrome Extension Monitor

This extension monitors your Chrome extesions in the Chrome Web Store. I wrote this extension to monitor my [Media Bias/Fact Check](https://chrome.google.com/webstore/detail/official-media-biasfact-c/ganicjnkcddicfioohdaegodjodcbkkh?hl=en) extension. I hope it will be as useful to you as it is to me.

Unfortunately, there is no way to gather the details from the web store from this extension itself. Instead, I had to create a proxy service in [Firebase](https://firebase.google.com/) that proxies each request thru a serverless function to gather the data. That service cost grows at the usage of this extension grows.

To that end, I as that you become a [Patreon](https://www.patreon.com/bePatron?u=3955610) member at just \$1/month to help defray those costs.

## Adding Extensions

You can add extension from this options menu, but the easiest method is to navigate to your extension in the [Chrome Web Store](https://chrome.google.com/webstore/) and click on this extensions icon ![icons](/icons/icon24.png) in the toolbar. At the top, of the popup window, you will see an Add button that easily adds the current extension to your list.

## Check Frequency

By default, the extension polls every 1h for updates on your extensions. You can do it more frequently (15 minutes), but I ask that you only use this high frequecy for extensions that need this level of responsiveness.
