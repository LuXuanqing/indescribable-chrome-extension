'use strict'

// HTML结构： div#app-container 插入到 div.socialmedia之前
const appContainer = document.createElement('div')
appContainer.setAttribute('id', 'app-container')
const target = document.querySelector('h4#mag-submit-show')
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
        lastVisit: {},
        imgs: [],
        isDislike: false,
        isNeedHd: false
    },
    computed: {
        timeFromNow: utils.timeFromNow,
        sitename: utils.sitename
    },
    methods: {
        disLike: utils.disLike,
        needHd: utils.needHd
    },
    created: function () {
        //从页面上爬取av车牌号
        this.id = document.querySelector('.info p:first-of-type span:nth-of-type(2)').innerText
        console.info(`AV id: ${this.id}`)

        //获取预览图
        let samples = document.querySelectorAll('.sample-box')
        samples.forEach(sample => {
            let p = {
                full: sample.href,
                thumb: sample.querySelector('img').src,
                title: sample.querySelector('img').title
            }
            this.imgs.push(p)
        })
        console.log(`预览图信息：`)
        console.log(this.imgs)

        // 上传图片信息，并获取偏访问记录、偏好信息
        chrome.runtime.sendMessage({
            method: 'post',
            path: `api/javbus/${this.id}`,
            data: {
                imgs: this.imgs
            }
        },
            response => {
                console.log(`获取到数据`)
                console.info(response)
                this.lastVisit = response.lastVisit
                this.isDislike = response.isDislike
                this.isNeedHd = response.isNeedHd
            })

    }
})