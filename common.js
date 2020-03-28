// moment localization
moment.locale('zh-CN')

// 插入的HTML模板
const textTemplateCommon = `
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
            <a v-if="host == 'www.javlibrary.com'" :href="'https://www.javbus.com/'+this.id" target="_blank">前往javbus.com</a>
            <a v-else :href="'http://www.javlibrary.com/cn/vl_searchbyid.php?keyword='+this.id" target="_blank">前往javlib</a>
        </button>
    </div>
    <hr class="grey">

    <!-- preview images -->
    <div id="imgs" v-if="host == 'www.javlibrary.com'">
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
        <hr class="grey">
    </div>
</div>
`

// 共用的函数
const utils = {
    timeFromNow: function () {
        // 用moment本地化时间
        return moment(Date.parse(this.lastVisit.timestamp)).fromNow()
    },
    sitename: function () {
        if (!this.lastVisit.site) return null
        // 优先根据域名显示javbus或javlib，如果不匹配则直接显示域名
        if (this.lastVisit.site.indexOf('javbus') > -1) {
            return 'JavBus'
        } else if (this.lastVisit.site.indexOf('javlibrary') > -1) {
            return 'JavLibrary'
        } else {
            return this.lastVisit.site
        }
    },
    disLike: function () {
        chrome.runtime.sendMessage({
            method: 'put',
            path: `api/av/${this.id}/dislike`,
            data: {
                isDislike: !this.isDislike
            }
        },
            response => {
                console.info(response)
                this.isDislike = !this.isDislike
            })
    },
    needHd: function () {
        chrome.runtime.sendMessage({
            method: 'put',
            path: `api/av/${this.id}/needhd`,
            data: {
                isNeedHd: !this.isNeedHd
            }
        },
            response => {
                console.info(response)
                this.isNeedHd = !this.isNeedHd
            })
    }
}
