export const Documentation = `<h2 id="welcome">Welcome</h2>
<p>This extension monitors your Chrome extesions in the Chrome Web Store. I wrote this extension to monitor my <a href="https://chrome.google.com/webstore/detail/official-media-biasfact-c/ganicjnkcddicfioohdaegodjodcbkkh?hl=en">Media Bias/Fact Check</a> extension. I hope it will be as useful to you as it is to me.</p>
<p>Unfortunately, there is no way to gather the details from the web store from this extension itself. Instead, I had to create a proxy service in <a href="https://firebase.google.com/">Firebase</a> that proxies each request thru a serverless function to gather the data. That service cost grows at the usage of this extension grows.</p>
<p>To that end, I as that you become a <a href="https://www.patreon.com/bePatron?u=3955610">Patreon</a> member at just \$1/month.</p>
<h2 id="adding-extensions">Adding Extensions</h2>
<p>You can add extension from this options menu, but the easiest method is to navigate to your extension in the <a href="https://chrome.google.com/webstore/">Chrome Web Store</a> and click on this extensions icon <img src="/icons/icon24.png" alt="icons"> in the toolbar. At the top, of the popup window, you will see an Add button that easily adds the current extension to your list.</p>
<h2 id="check-frequency">Check Frequency</h2>
<p>By default, the extension</p>
<h2 id="icons">Icons</h2>
<ul>
<li>Icons made by <a href="https://www.flaticon.com/authors/dinosoftlabs">DinosoftLabs</a> from <a href="https://www.flaticon.com/">Flaticon</a></li>
</ul>
`;
