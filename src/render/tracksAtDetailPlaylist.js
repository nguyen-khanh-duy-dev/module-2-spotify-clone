import httpRequest from "../api/httpRequest.js"
import EndPoints from "../api/endpoints.js"
import { convertTime } from "../utils/convertTime.js"
import toast from "../utils/toast.js"
import { handleDelTrack } from "../components/content/content.js"

export async function renderUpdateTracks(trackID, playlistID, isAddTrack) {
    let html = ""
    const myTracks = document.querySelector(".my-tracks")
    if (isAddTrack) {
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

            const track = await httpRequest.get(
                EndPoints.tracks.ById(playlist_track.track_id)
            )
            const trackCount = document.querySelectorAll(".track-item").length
            const trackItem = document.createElement("div")
            trackItem.className = "track-item"
            trackItem.dataset.trackId = track.id
            html = `<div class="col number">
                        <span class="track-index">${trackCount}</span>
                        <span class="track-play">▶</span>
                    </div>
                    <div class="col title">
                        ${track.title}
                    </div>
                    <div class="col artist">${track.artist_name}</div>
                    <div class="col duration">${convertTime(
                        track.duration
                    )}</div>`
            trackItem.innerHTML = html
            myTracks.appendChild(trackItem)

            handleDelTrack(playlistID)
            toast.success("Success", message)
        } catch (error) {
            const codeError = error?.response?.error.code
            const mesError = error?.response?.error.message
            toast.error(codeError, mesError)
        }
    } else {
        try {
            const currentTrackEl = myTracks.querySelector(
                `[data-track-id="${trackID}"]`
            )
            // Tìm ra index của phần tử đang bấm xóa là phần tử số mấy
            const removedIndex = [...myTracks.children].indexOf(currentTrackEl)

            currentTrackEl.remove()
            const trackItems = myTracks.querySelectorAll(".track-item")
            for (let i = removedIndex - 1; i < trackItems.length; i++) {
                trackItems[i].querySelector(".track-index").textContent = i
            }
            handleDelTrack(playlistID)
        } catch (error) {
            const codeError = error?.response?.error.code
            const mesError = error?.response?.error.message
            if (codeError && mesError) {
                toast.error(codeError, mesError)
            }
        }
    }
}

function getLastIndex() {}

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
                `<div class="track-item" data-track-id="${track.track_id}">
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
    handleDelTrack(playlistID)
}
