import httpRequest from "../../api/httpRequest.js"
import EndPoints from "../../api/endpoints.js"
import { removeTrack } from "./content.js"
import { renderPlayerFooter } from "../../render/playerFooter.js"
import { renderUpdateTracks } from "../../render/tracksAtDetailPlaylist.js"
import toast from "../../utils/toast.js"
import { convertTime } from "../../utils/convertTime.js"

let currentAudio = null // audio hiện tại
let currentTrackId = null // id track hiện tại
let currentIcon = null

export function playerTrack() {
    const hitSection = document.querySelector(".hits-section")
    const hitPlayBtns = hitSection.querySelectorAll(".hit-play-btn")

    hitPlayBtns.forEach((btn) => {
        btn.onclick = async (e) => {
            const currentHitCard = e.target.closest(".hit-card")
            const trackId = currentHitCard.dataset.hitId
            renderPlayerFooter(trackId, await isLikedTrack(trackId))
            handlePlayer(trackId)
        }
    })
}

async function handlePlayer(trackId) {
    const hitSection = document.querySelector(".hits-section")
    const playBtn = document.querySelector(".player .play-btn i")
    const repeatBtn = document.querySelector(".control-btn.repeat")

    // Nếu đang mở track khác → stop track cũ, play track mới
    if (trackId !== currentTrackId) {
        if (currentAudio) {
            currentAudio.pause()
            currentAudio = null
        }

        // Rest icon
        if (currentIcon) {
            currentIcon.classList.remove("fa-pause")
            currentIcon.classList.add("fa-play")
        }

        const trackById = await httpRequest.get(EndPoints.tracks.ById(trackId))
        const trackAudio = trackById.audio_url
        currentAudio = new Audio(trackAudio)
        currentTrackId = trackId
        currentAudio.play()
        addTrackToLikedSongs(currentTrackId)
        handleProgress(currentTrackId, currentAudio)
        handlePlayFooter(currentAudio, currentTrackId)
        handleVolume(currentAudio)
        // Handle repeat music
        repeatBtn.onclick = () => {
            repeatBtn.classList.toggle("active")
            console.log(currentAudio.loop, currentAudio)

            handleRepeatAudio(currentAudio.loop, currentAudio)
        }

        currentIcon = hitSection
            .querySelector(`.hit-card[data-hit-id="${currentTrackId}"]`)
            .querySelector(".hit-play-btn i")

        // Play button at player-footer
        playBtn.classList.remove("fa-play")
        playBtn.classList.add("fa-pause")

        // Play button at hit-card
        currentIcon.classList.remove("fa-play")
        currentIcon.classList.add("fa-pause")
        return
    }

    // Nếu click lại cùng 1 track → toggle play/pause
    if (currentAudio.paused) {
        currentAudio.play()

        // Play button at hit-card
        currentIcon.classList.remove("fa-play")
        currentIcon.classList.add("fa-pause")

        // Play button at player-footer
        playBtn.classList.remove("fa-play")
        playBtn.classList.add("fa-pause")
        addTrackToLikedSongs(currentTrackId)
    } else {
        currentAudio.pause()

        // Play button at hit-card
        currentIcon.classList.remove("fa-pause")
        currentIcon.classList.add("fa-play")

        // Play button at player-footer
        playBtn.classList.remove("fa-pause")
        playBtn.classList.add("fa-play")
    }
}

// Function to check track in Liked Playlist
async function isLikedTrack(trackId) {
    const { playlists } = await httpRequest.get(EndPoints.playlists.me)
    const likedPlaylist = playlists.filter(
        (playlist) => playlist.name === "Liked Songs"
    )

    const { tracks } = await httpRequest.get(
        EndPoints.playlists.getTracks(likedPlaylist[0].id)
    )
    if (tracks.length < 1) return false

    const result = tracks.filter((track) => track.track_id === trackId)
    if (result.length > 0) {
        return true
    } else {
        return false
    }
}

async function addTrackToLikedSongs(trackId) {
    const addBtn = document
        .querySelector(".player-left .add-btn")
        .closest(".add-btn")

    const { playlists } = await httpRequest.get(EndPoints.playlists.me)
    const likedPlaylist = playlists.filter(
        (playlist) => playlist.name === "Liked Songs"
    )
    if (addBtn) {
        addBtn.onclick = async (e) => {
            if (e.target.closest(".add-btn").classList.contains("active")) {
                removeTrack(likedPlaylist[0].id, trackId)
                renderPlayerFooter(trackId, false)
            } else {
                try {
                    renderUpdateTracks(trackId, likedPlaylist[0].id, true)
                } catch (error) {
                    const codeError = error?.response?.error.code
                    const mesError = error?.response?.error.message
                    if (codeError && mesError) {
                        toast.error(codeError, mesError)
                    }
                }
                renderPlayerFooter(trackId, true)
            }
        }
    }
}

async function handleProgress(trackId, audio) {
    const progressContainer = document.querySelector(".progress-container")
    const progressBar = progressContainer.querySelector(".progress-bar")
    const progressFill = progressContainer.querySelector(".progress-fill")
    const progressHandle = progressContainer.querySelector(".progress-handle")
    const currentTimeEl = progressContainer.querySelector(".time")
    const trackById = await httpRequest.get(EndPoints.tracks.ById(trackId))
    const trackDuration = trackById.duration

    let isDragging = false

    progressHandle.addEventListener("mousedown", (e) => {
        isDragging = true
        updateFill(e, audio, progressBar, progressFill, false)
    })

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            updateFill(e, audio, progressBar, progressFill, false)
        }
    })

    document.addEventListener("mouseup", () => {
        isDragging = false
    })

    audio.addEventListener("timeupdate", (e) => {
        const percent = (audio.currentTime / audio.duration) * 100
        progressFill.style.width = `${percent}%`
        currentTimeEl.textContent = convertTime(audio.currentTime)
        progressHandle.style.right = `${100 - percent - 1}%`
    })

    progressBar.onclick = (e) => {
        const rect = progressBar.getBoundingClientRect()
        const x = e.clientX

        const offsetX = x - rect.left
        const currentPercent = (offsetX / rect.width) * 100
        progressFill.style.width = currentPercent + "%"
        audio.currentTime = (currentPercent / 100) * audio.duration
    }
}

function updateFill(e, audio, progressBar, progressFill, isVolume) {
    const icon = document.querySelector(".volume-container .control-btn i")

    const volumeHandle = document.querySelector(
        ".volume-container .volume-handle"
    )

    const rect = progressBar.getBoundingClientRect()
    let offsetX = e.clientX - rect.left

    if (offsetX < 0) offsetX = 0
    if (offsetX > rect.width) offsetX = rect.width

    const percent = (offsetX / rect.width) * 100
    progressFill.style.width = percent + "%"

    if (!isVolume) {
        // dùng audio.duration thay vì trackDuration
        audio.currentTime = (percent / 100) * audio.duration
    } else {
        audio.volume = offsetX / rect.width
        volumeHandle.style.right = `${rect.width - offsetX - 3}px`
        updateIconVolume(audio, icon)
    }
}

function handleRepeatAudio(isRepeat, audio) {
    isRepeat ? disableRepeat(audio) : enableRepeat(audio)
}

function enableRepeat(audio) {
    const toolTip = document.querySelector(".control-btn.repeat .tool-tip")
    toolTip.textContent = "Enable repeat"
    console.log(toolTip)

    audio.loop = true
}

function disableRepeat(audio) {
    const toolTip = document.querySelector(".control-btn.repeat .tool-tip")
    toolTip.textContent = "Disable repeat"
    audio.loop = false
}

function handlePlayFooter(audio, currentTrackId) {
    const playBtnFooter = document.querySelector(".player .play-btn")
    const toolTip = playBtnFooter.querySelector(".tool-tip")
    const iconPlay = playBtnFooter.querySelector("i")
    const currentHitPlayBtn = document
        .querySelector(`.hit-card[data-hit-id="${currentTrackId}"]`)
        .querySelector(".hit-play-btn i")

    playBtnFooter.onclick = (e) => {
        if (audio.paused) {
            toolTip.textContent = "Pause"
            audio.play()
            iconPlay.classList.remove("fa-play")
            iconPlay.classList.add("fa-pause")

            currentHitPlayBtn.classList.remove("fa-play")
            currentHitPlayBtn.classList.add("fa-pause")
        } else {
            toolTip.textContent = "Play"
            audio.pause()
            iconPlay.classList.remove("fa-pause")
            iconPlay.classList.add("fa-play")

            currentHitPlayBtn.classList.remove("fa-pause")
            currentHitPlayBtn.classList.add("fa-play")
        }
    }
}

function handleVolume(audio) {
    const volumeContainer = document.querySelector(".volume-container")
    const volumeBar = volumeContainer.querySelector(".volume-bar")
    const volumeFill = volumeContainer.querySelector(".volume-fill")
    const volumeHandle = volumeContainer.querySelector(".volume-handle")
    const controlBtn = volumeContainer.querySelector(".control-btn")
    const icon = volumeContainer.querySelector(".control-btn i")
    const toolTip = volumeContainer.querySelector(".tool-tip")

    let originalVolume = audio.volume
    let currentVolume = audio.volume

    volumeFill.style.width = `${currentVolume * 100}%`
    volumeHandle.style.right = `${100 - currentVolume * 100}%`
    updateIconVolume(audio, icon)

    const rect = volumeBar.getBoundingClientRect()

    controlBtn.onclick = (e) => {
        if (currentVolume > 0) {
            audio.volume = 0
            currentVolume = 0
            volumeFill.style.width = `${0}%`
            volumeHandle.style.right = `${100}%`

            updateIconVolume(audio, icon)

            toolTip.textContent = "Unmute"
        } else {
            audio.volume = originalVolume
            currentVolume = originalVolume

            volumeFill.style.width = `${currentVolume * 100}%`
            volumeHandle.style.right = `${(1 - currentVolume) * 100}%`
            updateIconVolume(audio, icon)
            toolTip.textContent = "Mute"
        }
    }

    volumeBar.onclick = (e) => {
        const x = e.clientX
        const offsetX = x - rect.left
        currentVolume = offsetX / rect.width
        audio.volume = currentVolume
        originalVolume = currentVolume

        volumeFill.style.width = offsetX + "px"
        volumeHandle.style.right = `${rect.width - offsetX - 3}px`
        updateIconVolume(audio, icon)
    }

    let isDragging = false

    volumeHandle.addEventListener("mousedown", (e) => {
        isDragging = true
        updateFill(e, audio, volumeBar, volumeFill, true)
    })

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            updateFill(e, audio, volumeBar, volumeFill, true)
        }
    })

    document.addEventListener("mouseup", () => {
        isDragging = false
    })
}

function updateIconVolume(audio, iconEl) {
    if (audio.volume >= 0.5) {
        iconEl.className = "fas fa-volume-up"
    } else if (audio.volume > 0 && audio.volume < 0.5) {
        iconEl.className = "fas fa-volume-down"
    } else {
        iconEl.className = "fas fa-volume-mute"
    }
}
