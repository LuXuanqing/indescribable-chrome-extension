let elHost = document.querySelector('#host')
function getHost() {
    return elHost.value
}
function setHost(host) {
    elHost.value = host
}

function getBaseUrl() {
    let host = getHost()
    return `http://${host}:5000`
}

function showMessage(message, time = 1000) {
    let status = document.getElementById('status')
    status.textContent = message
    setTimeout(function () {
        status.textContent = ''
    }, time)
}

// Saves options to chrome.storage
function save_options() {
    let data = {
        host: getHost(),
        baseUrl: getBaseUrl()
    }
    console.log(data)
    chrome.storage.sync.set(data, function () {
        // Update status to let user know options were saved.
        showMessage('options saved')
    })
    chrome.runtime.sendMessage('loadOptions', response => {
        console.info(response)
        showMessage(response)
    })
}

// Restores select box and checkbox state using the preferences stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        host: 'localhost'
    }, function (items) {
        console.log(items)
        setHost(items.host)
    })
}
document.addEventListener('DOMContentLoaded', restore_options)
document.getElementById('save').addEventListener('click', save_options)