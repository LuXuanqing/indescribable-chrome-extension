'use strict'

// HTML结构： div#app-container 插入到 div.socialmedia之前
const appContainer = document.createElement('div')
appContainer.setAttribute('id', 'app-container')
const target = document.querySelector('div.socialmedia')
target.parentElement.insertBefore(appContainer, target)
// 把app的html插入到 #app-container
appContainer.innerHTML = textTemplateCommon
console.info('注入HTML')

// 实例化vue
let vm = new Vue({
    el: '#app',
    data: {
        host: window.location.host,
        id: '',
        genres: [],
        casts: [],
        lastVisit: {},
        imgs: [],
        imgIdx: 0,
        isShowImg: false,
        isDislike: false,
        isNeedHd: false
    },
    computed: {
        timeFromNow: utils.timeFromNow,
        sitename: utils.sitename
    },
    methods: {
        showThisImg: function (img) {
            this.isShowImg = true
            this.imgIdx = this.imgs.indexOf(img)
        },
        nextImg: function () {
            console.log('next')
            if (this.imgIdx < this.imgs.length - 1) {
                this.imgIdx += 1
            }
        },
        previousImg: function () {
            console.log('pre')
            if (this.imgIdx > 0) {
                this.imgIdx -= 1
            }
        },
        getPreview: function () {
            chrome.runtime.sendMessage({
                method: 'get',
                path: `api/av/${this.id}/imgs`
            },
                response => {
                    console.log(`获取到图像数据`)
                    console.info(response)
                    this.imgs = response.imgs
                    this.lastVisit = response.lastVisit
                    this.isDislike = response.isDislike
                    this.isNeedHd = response.isNeedHd
                })
        },
        disLike: utils.disLike,
        needHd: utils.needHd
    },
    created: function () {
        //从页面上爬取av车牌号
        this.id = document.querySelector('#video_id td.text').innerText
        console.info(`AV id: ${this.id}`)

        //get casts and genres
        function getList(query) {
            let list = []
            let spans = document.querySelectorAll(query)
            spans.forEach(span => {
                if (span.querySelector('.alias')) {
                    let name = span.querySelector('.star').innerText.trim()
                    let alias = span.querySelector('.alias').innerText.trim()
                    list.push(`${name}(${alias})`)
                } else {
                    list.push(span.innerText.trim())
                }
            })
            return list
        }

        this.casts = getList('#video_cast span.cast')
        console.info(`Got casts: ${this.casts}`)
        this.genres = getList('#video_genres span.genre')
        console.info(`Got genres: ${this.genres}`)

        // post casts&genres then get imgs&lastVisit
        chrome.runtime.sendMessage({
            method: 'post',
            path: `api/javlib/${this.id}`,
            data: {
                genres: this.genres,
                cast: this.casts
            }
        },
            response => {
                console.log(`获取到数据`)
                console.info(response)
                this.imgs = response.imgs
                this.lastVisit = response.lastVisit
                this.isDislike = response.isDislike
                this.isNeedHd = response.isNeedHd
                console.log(this.imgs)
            })
    }
})