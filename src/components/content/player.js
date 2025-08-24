import httpRequest from "../../api/httpRequest.js"
import EndPoints from "../../api/endpoints.js"
import { removeTrack } from "./content.js"
import { renderPlayerFooter } from "../../render/playerFooter.js"
import { renderUpdateTracks } from "../../render/tracksAtDetailPlaylist.js"
import toast from "../../utils/toast.js"
import { convertTime } from "../../utils/convertTime.js"

// Import from player control
import {
    handlePlayFooter,
    handleNextPlayer,
    handlePreviousPlayer,
    handleVolume,
} from "./playerControl.js"

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

export async function handlePlayer(trackId, tracksList, isArtist) {
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
        handleNextPlayer(tracksList, isShuffle(), isArtist)
        handlePreviousPlayer(tracksList, isShuffle(), isArtist)

        // Handle repeat music
        repeatBtn.onclick = () => {
            repeatBtn.classList.toggle("active")

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
export async function isLikedTrack(trackId) {
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

    audio.loop = true
}

function disableRepeat(audio) {
    const toolTip = document.querySelector(".control-btn.repeat .tool-tip")
    toolTip.textContent = "Disable repeat"
    audio.loop = false
}

export function updateIconVolume(audio, iconEl) {
    if (audio.volume >= 0.5) {
        iconEl.className = "fas fa-volume-up"
    } else if (audio.volume > 0 && audio.volume < 0.5) {
        iconEl.className = "fas fa-volume-down"
    } else {
        iconEl.className = "fas fa-volume-mute"
    }
}

export function playerPlaylist() {
    const artistCards = document.querySelectorAll(".artist-card")
    const playlistBtns = document.querySelectorAll(
        ".playlist-card .playlist-play-btn"
    )
    const artistPlayBtns = document.querySelectorAll(
        ".artist-card .artist-play-btn"
    )
    artistPlayBtns.forEach((playBtn) => {
        playBtn.onclick = async (e) => {
            e.stopPropagation()
            const currentArtistId =
                e.currentTarget.closest(".artist-card").dataset.artistId
            const { tracks } = await httpRequest.get(EndPoints.tracks.all)
            const tracksArtist = tracks.filter(
                (track) => track.artist_id === currentArtistId
            )

            handlePlayerArtist(tracksArtist)
        }
    })

    playlistBtns.forEach((playBtn) => {
        playBtn.onclick = async (e) => {
            e.stopPropagation()
            const currentPlaylistId =
                e.currentTarget.closest(".playlist-card").dataset.playlistId

            const { tracks } = await httpRequest.get(
                EndPoints.playlists.getTracks(currentPlaylistId)
            )

            handlePlayerPlaylist(tracks)
        }
    })
}

async function handlePlayerArtist(tracksArtist) {
    try {
        if (!tracksArtist || tracksArtist.length === 0) return

        // Lấy random 1 bài hát trong list artist
        const randomNumber = Math.floor(Math.random() * tracksArtist.length)
        const track = tracksArtist[randomNumber]
        const trackId = track.id

        // Render player footer
        renderPlayerFooter(trackId, await isLikedTrack(trackId), true)

        // Gọi lại handlePlayer (tận dụng logic có sẵn)
        handlePlayer(trackId, tracksArtist, true)
    } catch (error) {
        console.log("Error handlePlayerArtist:", error)
    }
}

async function handlePlayerPlaylist(tracksPlaylist) {
    console.log(tracksPlaylist)

    try {
        if (!tracksPlaylist || tracksPlaylist.length === 0) return

        // Lấy random 1 bài hát trong list artist
        const randomNumber = Math.floor(Math.random() * tracksPlaylist.length)
        const track = tracksPlaylist[randomNumber]
        const trackId = track.track_id
        console.log(trackId)

        // Render player footer
        renderPlayerFooter(trackId, await isLikedTrack(trackId), true)

        // Gọi lại handlePlayer (tận dụng logic có sẵn)
        handlePlayer(trackId, tracksPlaylist, false)
    } catch (error) {
        console.log("Error handlePlayerArtist:", error)
    }
}

function initShuffle() {
    const shuffleBtn = document.querySelector(".control-btn.shuffle")
    const toolTip = shuffleBtn.querySelector(".tool-tip")
    let shuffleStatus = null
    shuffleBtn.onclick = (e) => {
        if (shuffleBtn.classList.contains("active")) {
            shuffleBtn.classList.remove("active")
            toolTip.textContent = "Disable Shuffle"
        } else {
            shuffleBtn.classList.add("active")
            toolTip.textContent = "Enable Shuffle"
        }
    }
}

function isShuffle() {
    const shuffleBtn = document.querySelector(".control-btn.shuffle")
    if (shuffleBtn.classList.contains("active")) {
        return true
    } else {
        return false
    }
}

initShuffle()
