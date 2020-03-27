'use strict'

// HTML结构： div#app-container 插入到 div.socialmedia之前
const appContainer = document.createElement('div')
appContainer.setAttribute('id', 'app-container')
const target = document.querySelector('h4#mag-submit-show')
target.parentElement.insertBefore(appContainer, target)

// 把app的html插入到 #app-container
document.querySelector('#app-container').innerHTML = `<style>
button {
    -webkit-appearance: button;
    -webkit-writing-mode: horizontal-tb !important;
    text-rendering: auto;
    color: buttontext;
    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: inline-block;
    text-align: center;
    align-items: flex-start;
    cursor: pointer;
    background-color: buttonface;
    box-sizing: border-box;
    margin: 0em;
    font: 400 13.3333px Arial;
    padding: 1px 6px;
    border-width: 2px;
    border-style: outset;
    border-color: buttonface;
    border-image: initial;
}

.smallbutton:hover {
    background-color: #e9e9e9;
}

.smallbutton {
    background-color: #f9f9f9;
    -moz-border-radius: 5px;
    -webkit-border-radius: 5px;
    border-radius: 5px;
    border: 1px solid #dcdcdc;
    display: inline-block;
    color: #666666;
    font-family: arial;
    font-size: 12px;
    font-weight: bold;
    padding: 2px 11px;
    text-decoration: none;
    margin: 1px;
}

.smalldarkbutton {
    background-color: #333333;
    -moz-border-radius: 5px;
    -webkit-border-radius: 5px;
    border-radius: 5px;
    border: 1px solid #dcdcdc;
    display: inline-block;
    color: #e9e9e9;
    font-family: arial;
    font-size: 12px;
    font-weight: bold;
    padding: 2px 11px;
    text-decoration: none;
    margin: 1px;
}

hr {
    display: block;
    unicode-bidi: isolate;
    margin-block-start: 0.5em;
    margin-block-end: 0.5em;
    margin-inline-start: auto;
    margin-inline-end: auto;
    overflow: hidden;
    border-style: inset;
    border-width: 1px;
}

hr.grey {
    color: #cccccc;
    background-color: #cccccc;
    height: 2px;
    border: none;
}
</style>
<div id="app">
<!-- last visit time -->
<hr class="grey">
<div id="history">
    <h2>上次访问</h2>
    <p v-if="lastVisit.timestamp">{{ timeFromNow }} @ <a :href="lastVisit.site">{{ sitename }}</a>
    </p>
    <p v-else>这是你第一次访问</p>
</div>
<div id="operations">
    <button :class="[isDislike ? 'smalldarkbutton' : 'smallbutton']" @click="disLike">不感兴趣</button>
    <button :class="[isNeedHd ? 'smalldarkbutton' : 'smallbutton']" @click="needHd">需要HD资源</button>
    <button class="smallbutton">
        <a :href="'http://www.javlibrary.com/cn/vl_searchbyid.php?keyword='+this.id" target="_blank">前往javlib</a>
    </button>
</div>
<hr class="grey">
</div>`
console.info('Inserted HTML')
let vm = new Vue({
    el: '#app',
    data: {
        id: '',
        lastVisit: {},
        imgs: [],
        isDislike: false,
        isNeedHd: false
    },
    computed: {
        timeFromNow: function() {
            return moment(Date.parse(this.lastVisit.timestamp)).fromNow()
        },
        sitename: function() {
            if (!this.lastVisit.site) return null
            if (this.lastVisit.site.indexOf('javbus') > -1) {
                return 'JavBus'
            } else if (this.lastVisit.site.indexOf('javlibrary') > -1) {
                return 'JavLibrary'
            } else {
                return this.lastVisit.site
            }
        }
    },
    methods: {
        disLike: function() {
            chrome.runtime.sendMessage({
                    method: 'put',
                    url: `http://raspberrypi:5000/api/av/${this.id}/dislike`,
                    data: {
                        isDislike: !this.isDislike
                    }
                },
                response => {
                    console.info(response)
                    this.isDislike = !this.isDislike
                })
        },
        needHd: function() {
            chrome.runtime.sendMessage({
                    method: 'put',
                    url: `http://raspberrypi:5000/api/av/${this.id}/needhd`,
                    data: {
                        isNeedHd: !this.isNeedHd
                    }
                },
                response => {
                    console.info(response)
                    this.isNeedHd = !this.isNeedHd
                })
        }
    },
    created: function() {
        //get ID
        this.id = document.querySelector('.info p:first-of-type span:nth-of-type(2)').innerText
        console.info(`Got id: ${this.id}`)

        //get imgs
        let samples = document.querySelectorAll('.sample-box')
        samples.forEach(sample => {
            let p = {
                full: sample.href,
                thumb: sample.querySelector('img').src,
                title: sample.querySelector('img').title
            }
            this.imgs.push(p)
        })
        console.log(this.imgs)
            // moment localization
        moment.locale('zh-CN')
            // post casts&genres then get imgs&lastVisit
        chrome.runtime.sendMessage({
                method: 'post',
                url: `http://raspberrypi:5000/api/javbus/${this.id}`,
                data: {
                    imgs: this.imgs
                }
            },
            response => {
                console.info(response)
                this.lastVisit = response.lastVisit
                this.isDislike = response.isDislike
                this.isNeedHd = response.isNeedHd
            })

    }
})