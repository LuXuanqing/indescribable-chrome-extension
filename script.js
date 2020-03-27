const vm = new Vue({
    el: '#app',
    data: {
        id: 'WANZ-801',
        genres: ['中出', '单体作品', '姐姐', '巨乳', '女上位', '屁股'],
        casts: ['篠田ゆう'],
        lastVisit: {},
        imgs: {},
        imgIdx: 0,
        isShowImg: false,
        isDislike: false,
        isNeedHd: false
    },
    computed: {
        timeFromNow: function () {
            return moment(Date.parse(this.lastVisit.timestamp)).fromNow()
        },
        sitename: function () {
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
            //TODO update this methods
        },
        disLike: function () {
            axios.put(`http://localhost:5000/api/av/WANZ-801/dislike`, {
                isDislike: !this.isDislike
            })
                .then(res => {
                    this.isDislike = !this.isDislike
                })
                .catch(err => console.error(err))
        },
        needHd: function () {
            axios.put(`http://localhost:5000/api/av/WANZ-801/needhd`, {
                isNeedHd: !this.isNeedHd
            })
                .then(res => {
                    this.isNeedHd = !this.isNeedHd
                })
                .catch(err => console.error(err))
        }
    },
    mounted: function () {
        moment.locale('zh-CN')
        // post casts&genres then get imgs&lastVisit
        axios.post(`http://localhost:5000/api/av/${this.id}`, {
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