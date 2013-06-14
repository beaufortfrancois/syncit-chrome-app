chrome.app.runtime.onLaunched.addListener(function(data) {
    chrome.app.window.create('window.html', {
        bounds: { 
            width: 400, 
            height: 400
        }, 
        minWidth: 400,
        maxWidth: 400, 
        id:"SyncIt" 
    });
});
