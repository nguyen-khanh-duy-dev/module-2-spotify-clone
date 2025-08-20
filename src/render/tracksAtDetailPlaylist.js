import httpRequest from "../api/httpRequest.js"
import EndPoints from "../api/endpoints.js"
import { convertTime } from "../utils/convertTime.js"
import toast from "../utils/toast.js"

export async function renderTracks(trackID, playlistID) {
    let html = ""
    const myTracks = document.querySelector(".my-tracks")
    const myTracksSection = document.querySelector(".my-tracks .track-item")
    try {
        const trackById = await httpRequest.get(`tracks/${trackID}`)

        const track_id = trackById.id
        const credentials = {
            track_id,
            position: 0,
        }
        try {
            const { message, playlist_track } = await httpRequest.post(
                EndPoints.playlists.addTrack(playlistID),
                credentials
            )
            if (myTracksSection) {
                html = `
            <div class="track-item">
                <div class="col number">
                    <span class="track-index">${1}</span>
                    <span class="track-play">▶</span>
                </div>
                <div class="col title">
                    ${trackById.title}
                </div>
                <div class="col artist">${trackById.artist_name}</div>
                <div class="col duration">${convertTime(
                    trackById.duration
                )}</div>
            </div>`

                myTracks.insertAdjacentHTML("beforeend", html)
            }
            toast.success("Success", message)
        } catch (error) {
            const codeError = error?.response?.error.code
            const mesError = error?.response?.error.message
            toast.error(codeError, mesError)
        }
    } catch (error) {
        console.log(error)
    }
}
