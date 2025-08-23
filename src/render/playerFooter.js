import httpRequest from "../api/httpRequest.js"
import EndPoints from "../api/endpoints.js"
import { convertTime } from "../utils/convertTime.js"

export async function renderPlayerFooter(trackId, isLiked) {
    const timeTotal = document.querySelector('.time.total')
    const playerLeft = document.querySelector(".player-left")
    const playerImage = document.querySelector(".player-left .player-image")
    const playerTitle = document.querySelector(".player-left .player-title")
    const playerArtist = document.querySelector(".player-left .player-artist")
    const addBtn = document.querySelector(".player .add-btn")
    const iconLiked = document.querySelector(".player .add-btn i")
    const trackById = await httpRequest.get(EndPoints.tracks.ById(trackId))
    timeTotal.textContent = convertTime(trackById.duration)
    playerImage.src = trackById.image_url
    playerTitle.textContent = trackById.title
    playerArtist.textContent = trackById.artist_name
    playerLeft.dataset.trackId = trackId
    if (isLiked) {
        iconLiked.classList.remove("fa-plus")
        iconLiked.classList.add("fa-check")

        addBtn.classList.add("active")
    } else {
        iconLiked.className = "fa-solid fa-plus"
        addBtn.classList.remove("active")
    }
}
