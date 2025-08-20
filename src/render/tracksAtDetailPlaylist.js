import httpRequest from "../api/httpRequest.js"
import EndPoints from "../api/endpoints.js"
import { convertTime } from "../utils/convertTime.js"
import toast from "../utils/toast.js"
import { handleDelTrack } from "../components/content/content.js"

export async function renderUpdateTracks(trackID, playlistID) {
    let html = ""
    const myTracks = document.querySelector(".my-tracks")
    const myTracksSection = document.querySelector(".my-tracks .track-item")
    try {
        const track_id = trackID
        const credentials = {
            track_id,
            position: 0,
        }
        try {
            const { message, playlist_track } = await httpRequest.post(
                EndPoints.playlists.addTrack(playlistID),
                credentials
            )
            if (!playlist_track) return

            const trackById = await httpRequest.get(
                EndPoints.tracks.ById(playlist_track.track_id)
            )
            console.log(trackById)

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

export async function renderMyTracks(playlistID) {
    const myTrackSection = document.querySelector(".my-tracks")
    const { tracks } = await httpRequest.get(`playlists/${playlistID}/tracks`)

    if (!tracks) return

    const headerHtml = `<div class="tracks-header">
                            <div class="col number">#</div>
                            <div class="col title">Title</div>
                            <div class="col artist">Artist</div>
                            <div class="col duration">⏱</div>
                        </div>`
    myTrackSection.innerHTML = headerHtml

    let trackItemHtml = tracks
        .map(
            (track, index) =>
                `<div class="track-item" data-track-id="${track.id}">
            <div class="col number">
                <span class="track-index">${index}</span>
                <span class="track-play">▶</span>
            </div>
            <div class="col title">
                ${track.track_title}
            </div>
            <div class="col artist">${track.artist_name}</div>
            <div class="col duration">${convertTime(track.track_duration)}</div>
        </div>`
        )
        .join("")

    myTrackSection.insertAdjacentHTML("beforeend", trackItemHtml)
    handleDelTrack()
}
