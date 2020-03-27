/* 在https的网页上执行content script中的https请求
参考https://developer.chrome.com/extensions/xhr 中的Limiting content script access to cross-origin requests  */

/* chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == 'fetchUrl') {
            // WARNING: SECURITY PROBLEM - a malicious web page may abuse
            // the message handler to get access to arbitrary cross-origin
            // resources.
            fetch(request.url)
                .then(response => response.text())
                .then(text => sendResponse(text))
                .catch(err => console.error(err))

            // sendResponse(fetch(request.url)
            //     .then(response => response.json()))

            return true; // Will respond asynchronously.
        }
    }
) */

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        /* 
        优先使用完整url请求，没有的话使用config.js中的baseUrl和path拼接成url
        */
        axios({
            method: request.method,
            url: request.url ? request.url : `${baseUrl}/${request.path}`,
            data: request.data
        })
            .then(function (response) {
                // handle success
                console.log(response)
                sendResponse(response.data)
            })
            .catch(function (error) {
                // handle error
                console.error(error)
            })
            .then(function () {
                // always executed
            })
        return true; // Will respond asynchronously.
    }
)