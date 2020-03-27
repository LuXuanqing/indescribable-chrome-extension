'use strict'

// HTML结构： div#app-container 插入到 div.socialmedia之前
const appContainer = document.createElement('div')
appContainer.setAttribute('id', 'app-container')
const target = document.querySelector('div.socialmedia')
target.parentElement.insertBefore(appContainer, target)


// 把app的html插入到 #app-container

document.querySelector('#app-container').innerHTML = `<div id="app">
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
        <a :href="'https://www.javbus.com/'+this.id" target="_blank">前往javbus.com</a>
    </button>
</div>
<hr class="grey">

<!-- preview images -->
<div id="imgs">
    <h2>预览图</h2>
    <div v-if="imgs" @keyup.right="nextImg" @keyup.left="previousImg">
        <img v-for="img in imgs" @click="showThisImg(img)" :src="img.thumb" :title="img.title">
        <div v-if="isShowImg">
            <button @click="previousImg" :disabled="imgIdx <= 0">上一张</button>
            <img :src="imgs[imgIdx].full" @click="isShowImg = false">
            <button @click="nextImg" :disabled="imgIdx >= this.imgs.length - 1">下一张</button>
        </div>
    </div>
    <div v-else>
        <button @click="getPreview">尝试重新从javbus获取预览图</button>
    </div>
</div>
<hr class="grey">
</div>`
console.info('Inserted HTML')

new Vue({
    el: '#app',
    data: {
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
        timeFromNow: function() {
            return moment(Date.parse(this.lastVisit.timestamp)).fromNow()
        },
        sitename: function() {
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
        showThisImg: function(img) {
            this.isShowImg = true
            this.imgIdx = this.imgs.indexOf(img)
        },
        nextImg: function() {
            console.log('next')
            if (this.imgIdx < this.imgs.length - 1) {
                this.imgIdx += 1
            }
        },
        previousImg: function() {
            console.log('pre')
            if (this.imgIdx > 0) {
                this.imgIdx -= 1
            }
        },
        getPreview: function() {
            axios.get(`http://localhost:5000/api/av/${this.id}/imgs`)
                .then(res => {
                    console.log(res)
                    this.imgs = res.data.imgs
                })
                .catch(err => console.error(err))
        },
        disLike: function() {
            axios.put(`http://localhost:5000/api/av/${this.id}/dislike`, {
                    isDislike: !this.isDislike
                })
                .then(res => {
                    this.isDislike = !this.isDislike
                })
                .catch(err => console.error(err))
        },
        needHd: function() {
            axios.put(`http://localhost:5000/api/av/${this.id}/needhd`, {
                    isNeedHd: !this.isNeedHd
                })
                .then(res => {
                    this.isNeedHd = !this.isNeedHd
                })
                .catch(err => console.error(err))
        },
    },
    created: function() {
        //get ID
        this.id = document.querySelector('#video_id td.text').innerText
        console.info(`Got id: ${this.id}`)

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
            // moment localization
        moment.locale('zh-CN')
            // post casts&genres then get imgs&lastVisit
        axios.post(`http://localhost:5000/api/javlib/${this.id}`, {
                genres: this.genres,
                cast: this.casts
            })
            .then(res => {
                console.info(res)
                this.imgs = res.data.imgs
                this.lastVisit = res.data.lastVisit
                this.isDislike = res.data.isDislike
                this.isNeedHd = res.data.isNeedHd
            })
            .catch(err => console.error(err))
    }
})