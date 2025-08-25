import httpRequest from "../../api/httpRequest.js"
import EndPoints from "../../api/endpoints.js"
import { handlePlayer, updateIconVolume, isLikedTrack } from "./player.js"
import { renderPlayerFooter } from "../../render/playerFooter.js"

export function handlePlayFooter(audio, currentTrackId) {
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

export function handleVolume(audio) {
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

let nextTrackId = null
export function handleNextPlayer(
    tracksList,
    isShuffle = false,
    isArtist = false
) {
    const nextBtn = document.querySelector(".control-btn.next")
    const hitCards = document.querySelectorAll(".hit-card")
    let randomNumber = null

    // Xóa event cũ để tránh gắn chồng
    nextBtn.replaceWith(nextBtn.cloneNode(true))
    const newNextBtn = document.querySelector(".control-btn.next")

    newNextBtn.onclick = async () => {
        const playerLeft = document.querySelector(".player-left")
        const isInPlaylist = playerLeft.dataset.inPlaylist === "true"

        if (!isInPlaylist) {
            // chọn random 1 bài trong hits-section
            randomNumber = Math.floor(Math.random() * hitCards.length)
            nextTrackId = hitCards[randomNumber].dataset.hitId
        } else {
            if (isShuffle) {
                randomNumber = Math.floor(Math.random() * tracksList.length)
                nextTrackId = isArtist
                    ? tracksList[randomNumber].id
                    : tracksList[randomNumber].track_id
            } else {
                let currentTrackId = playerLeft.dataset.trackId

                let currentIndex = tracksList.findIndex((track) =>
                    isArtist
                        ? track.id.trim() === currentTrackId.trim()
                        : track.track_id.trim() === currentTrackId.trim()
                )

                if (currentIndex < tracksList.length - 1) {
                    currentIndex++
                } else {
                    currentIndex = 0 // quay vòng về đầu playlist
                }

                nextTrackId = isArtist
                    ? tracksList[currentIndex].id
                    : tracksList[currentIndex].track_id
            }
        }

        if (nextTrackId) {
            renderPlayerFooter(
                nextTrackId,
                await isLikedTrack(nextTrackId),
                isInPlaylist
            )
            // truyền lại isArtist để giữ đúng context
            handlePlayer(nextTrackId, tracksList, isArtist, isShuffle)
        }
    }
}

export function handlePreviousPlayer(
    tracksList,
    isShuffle = false,
    isArtist = false
) {
    const prevBtn = document.querySelector(".control-btn.previous")
    const hitCards = document.querySelectorAll(".hit-card")
    let randomNumber = null

    // Xóa event cũ để tránh gắn chồng
    prevBtn.replaceWith(prevBtn.cloneNode(true))
    const newPrevBtn = document.querySelector(".control-btn.previous")

    newPrevBtn.onclick = async () => {
        const playerLeft = document.querySelector(".player-left")
        const isInPlaylist = playerLeft.dataset.inPlaylist === "true"

        let prevTrackId

        if (!isInPlaylist) {
            // chọn random 1 bài trong hits-section
            randomNumber = Math.floor(Math.random() * hitCards.length)
            prevTrackId = hitCards[randomNumber].dataset.hitId
        } else {
            if (isShuffle) {
                randomNumber = Math.floor(Math.random() * tracksList.length)
                prevTrackId = isArtist
                    ? tracksList[randomNumber].id
                    : tracksList[randomNumber].track_id
            } else {
                let currentTrackId = playerLeft.dataset.trackId

                let currentIndex = tracksList.findIndex((track) =>
                    isArtist
                        ? String(track.id).trim() ===
                          String(currentTrackId).trim()
                        : String(track.track_id).trim() ===
                          String(currentTrackId).trim()
                )

                if (currentIndex > 0) {
                    currentIndex-- // lùi lại
                } else {
                    currentIndex = tracksList.length - 1 // quay vòng về cuối playlist
                }

                prevTrackId = isArtist
                    ? tracksList[currentIndex].id
                    : tracksList[currentIndex].track_id
            }
        }

        if (prevTrackId) {
            renderPlayerFooter(
                prevTrackId,
                await isLikedTrack(prevTrackId),
                isInPlaylist
            )
            // truyền lại isArtist & isShuffle để giữ context
            handlePlayer(prevTrackId, tracksList, isArtist, isShuffle)
        }
    }
}
