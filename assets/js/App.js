const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'

const curTime = $('.cur-time')
const toltalTime = $('.total-time')
const player = $('.player')
const playlist = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const volumeBtn = $('.btn-toggle-volume')
const adjustVolume = $('.adjust-volume')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isMuted: false,
    isRandom: false,
    isRepeat: false,
    playedIndexes: [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
    {
        name: 'Bad Habits',
        singer: 'Ed Sheeran',
        path: '/assets/music/badhabits.mp3',
        image: '/assets/img/badhabits.jpg'
    },
    {
        name: 'Beautiful Mistake',
        singer: 'Maroon 5',
        path: '/assets/music/beautifulmistake.mp3',
        image: '/assets/img/beautifulmistake.jpg'
    },
    {
        name: 'Drag Me Down',
        singer: 'One Direction',
        path: '/assets/music/dragmedown.mp3',
        image: '/assets/img/dragmedown.jpg'
    },
    {
        name: 'Intentions',
        singer: 'Justin Bieber',
        path: '/assets/music/intentions.mp3',
        image: '/assets/img/intentions.jpg'
    },
    {
        name: 'Light Switch',
        singer: 'Charlie Puth',
        path: '/assets/music/lightswitch.mp3',
        image: '/assets/img/lightswitch.jpg'
    },
    {
        name: 'Love Yourself',
        singer: 'Justin Bieber',
        path: '/assets/music/loveyourself.mp3',
        image: '/assets/img/loveyourself.jpg'
    },
    {
        name: 'Maps',
        singer: 'Maroon 5',
        path: '/assets/music/maps.mp3',
        image: '/assets/img/maps.jpg'
    },
    {
        name: 'Peaches',
        singer: 'Justin Bieber',
        path: '/assets/music/Peaches.mp3',
        image: '/assets/img/Peaches.jpg'
    },
    {
        name: 'Senorita',
        singer: 'Shawn Mendes',
        path: '/assets/music/senorita.mp3',
        image: '/assets/img/senorita.jpg'
    },
    {
        name: 'Stitches',
        singer: 'Shawn Mendes',
        path: '/assets/music/stitches.mp3',
        image: '/assets/img/stitches.jpg'
    }
    ],
    render: function() {
    const htmls = this.songs.map((song, index) => {
        return `
        <div class="song" data-index="${index}">
        <div
            class="thumb"
            style="
            background-image: url('${song.image}');
            "
        ></div>
        <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
        </div>
        <div class="option">
            <i class="fas fa-ellipsis-h"></i>
        </div>
        </div>`
    })
    playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
    Object.defineProperty(this, 'currentSong', {
        get: function() {
        return this.songs[this.currentIndex]
        }
    })
    },
    handleEvents: function() {
    const _this = this
    const cdWidth = cd.offsetWidth

    // Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([
        {transform: 'rotate(360deg)'}
    ], {
        duration: 10000, // 10 seconds
        iterations: Infinity
    })

    cdThumbAnimate.pause()

    // Xử lý phóng to / thu nhỏ CD
    document.onscroll = function() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const newCdWidth = cdWidth - scrollTop

        cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
        cd.style.opacity = newCdWidth/cdWidth
    }

    // Xử lý khi click play / pause
    playBtn.onclick = function() {
        if(_this.isPlaying) {
        audio.pause()
        }
        else {
        audio.play()
        }
    }

    // Khi song được play
    audio.onplay = function() {
        _this.isPlaying = true
        player.classList.add('playing')
        cdThumbAnimate.play()
    }

    // Khi song được pause
    audio.onpause = function() {
        _this.isPlaying = false
        player.classList.remove('playing')
        cdThumbAnimate.pause()
    }

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function() {
        if(audio.duration)
        {
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
        progress.value = progressPercent

        // Cập nhật cur-time
        const minutes = Math.floor(audio.currentTime / 60);
        const seconds = Math.floor(audio.currentTime % 60);
        const formatCurTime = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        curTime.innerText = formatCurTime;
        }
    }

    // Xử lý khi kéo thanh tăng giảm âm lượng
    adjustVolume.oninput = function () {
        const newVolume = adjustVolume.value / 100;
        audio.volume = newVolume;
        if(audio.volume === 0)
        {
        volumeBtn.classList.add('on')
        }
        else
        {
        volumeBtn.classList.remove('on')
        }
    }

    // Xử lý khi tua song
    progress.oninput = function(e) {
        const seekTime = e.target.value * audio.duration / 100
        audio.currentTime = seekTime
    }

    // Khi next song
    nextBtn.onclick = function() {
        if(_this.isRandom)
        {
        _this.playRandomSong()
        }
        else
        {
        _this.nextSong()
        cdThumbAnimate.cancel()
        }
        audio.play()
        _this.handleActiveSong()
        _this.scrollToActiveSong()
    }

    // Khi prev song
    prevBtn.onclick = function() {
        if(_this.isRandom)
        {
        _this.playRandomSong()
        }
        else
        {
        _this.prevSong()
        cdThumbAnimate.cancel()
        }
        audio.play()
        _this.handleActiveSong()
        _this.scrollToActiveSong()
    }

    // Xử lý bật / tắt random song
    randomBtn.onclick = function() {
        _this.isRandom = !_this.isRandom
        _this.setConfig('isRandom', _this.isRandom)
        randomBtn.classList.toggle('active', _this.isRandom)
    }

    // Xử lý bật / tắt repeat song
    repeatBtn.onclick = function() {
        _this.isRepeat = !_this.isRepeat
        _this.setConfig('isRepeat', _this.isRepeat)
        repeatBtn.classList.toggle('active', _this.isRepeat)
    }

    // Xử lý bật tắt volume
    volumeBtn.onclick = function() {
        _this.isMuted = !_this.isMuted
        volumeBtn.classList.toggle('on', _this.isMuted)
        if(_this.isMuted) {
        audio.volume = 0
        adjustVolume.value = 0
        }
        else {
        audio.volume = 1
        adjustVolume.value = 50
        }
    }

    // Xử lý next song khi audio ended
    audio.onended = function() {
        if(_this.isRepeat)
        {
        audio.play()
        }
        else
        {
        nextBtn.click()
        }
    }
    

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function(e) {
        const songNode = e.target.closest('.song:not(.active)')
        if(songNode || e.target.closest('.option')) {
        // Xử lý click vào song
        if(songNode) {
            _this.currentIndex = songNode.dataset.index
            _this.handleActiveSong()
            _this.loadCurrentSong()
            audio.play()
        }

        // Xử lý khi click vào song option
        if(e.target.closest('.option')) {

        }
        }
    }
    },
    scrollToActiveSong: function() {
    setTimeout(() => {
        $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'end'
        })
    }, 300)
    },
    handleActiveSong: function() {
    const listSong = $$('.song')

    // Xóa lớp active khỏi list song
    listSong.forEach((item) => {
        item.classList.remove('active')
    });

    // Thêm lớp active vào current song
    const currentSong = listSong[this.currentIndex];
    
    currentSong.classList.add('active');

    this.setConfig('currentIndex', this.currentIndex)
    },
    loadCurrentSong: function() {
        if (this.songs && this.songs.length > 0 && this.songs[this.currentIndex]) {
          heading.textContent = this.currentSong.name;
          cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
          audio.src = this.currentSong.path;
      
          audio.addEventListener('loadedmetadata', function() {
            const minutes = Math.floor(audio.duration / 60);
            const seconds = Math.floor(audio.duration % 60);
            const formatTotalTime = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            toltalTime.innerText = formatTotalTime;
          });
        } else {
          console.error('Current song is undefined or songs array is empty.');
        }
    },      
    loadConfig: function() {
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
    this.currentIndex = this.config.currentIndex
    this.playedIndexes.push(this.config.currentIndex)
    },
    nextSong: function() {
    this.currentIndex++
    if(this.currentIndex >= this.songs.length)
    {
        this.currentIndex = 0
    }
    this.loadCurrentSong()
    },
    prevSong: function() {
    this.currentIndex--
    if(this.currentIndex < 0)
    {
        this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
    },
    playRandomSong: function() {
    let newIndex
    do {
        newIndex = Math.floor(Math.random() * this.songs.length)
    }
    while(this.playedIndexes.includes(newIndex))

    this.playedIndexes.push(newIndex)
    if (this.playedIndexes.length === this.songs.length) {
        this.playedIndexes = []
    }

    this.currentIndex = newIndex
    this.loadCurrentSong()
    },
    start: function() {
    // Load config
    this.loadConfig()

    // Định nghĩa các thuộc tính cho object
    this.defineProperties()

    // Lắng nghe / Xử lý các sự kiện (DOM events)
    this.handleEvents()

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong()

    // Render playlist
    this.render()

    // Xử lý active song
    this.handleActiveSong()

    // Hiển thị config theo file config
    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isRepeat)
    }
}
app.start()