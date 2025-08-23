import httpRequest from "../../api/httpRequest.js"
import EndPoints from "../../api/endpoints.js"
import toast from "../../utils/toast.js"

import { renderUpdateTracks } from "../../render/tracksAtDetailPlaylist.js"

export function handleDelTrack(playlistId) {
    const trackItems = document.querySelectorAll(".track-item")
    const contextDelTrack = document.querySelector(".context-del-track")
    const detailCreate = document.querySelector(".detail-create")
    const myTracks = document.querySelector(".track-item")

    detailCreate.addEventListener("contextmenu", (e) => {
        e.preventDefault()
    })

    trackItems.forEach((item) => {
        item.addEventListener("contextmenu", (e) => {
            e.preventDefault()
            const currentTrackId = item.dataset.trackId
            const currentElement = e.currentTarget

            contextDelTrack.onclick = (e) => {
                removeTrack(playlistId, currentTrackId)
                contextDelTrack.classList.remove("show")
                currentElement.style.backgroundColor = "transparent"
                renderUpdateTracks(currentTrackId, playlistId, false)
            }

            trackItems.forEach((track) => {
                track.style.backgroundColor = "transparent"
            })
            currentElement.style.backgroundColor = "#ffffff1a"

            const x = e.clientX
            const y = e.clientY
            contextDelTrack.classList.add("show")
            if (x <= 928) {
                Object.assign(contextDelTrack.style, {
                    position: "fixed",
                    top: `${y}px`,
                    left: `${x}px`,
                    zIndex: 1000,
                })
            } else {
                Object.assign(contextDelTrack.style, {
                    position: "fixed",
                    top: `${y}px`,
                    left: `${x - (x - 928)}px`,
                    zIndex: 1000,
                })
            }

            document.addEventListener(
                "click",
                (e) => {
                    if (!contextDelTrack.contains(e.target)) {
                        contextDelTrack.classList.remove("show")
                        currentElement.style.backgroundColor = "transparent"
                    }
                },
                { once: true }
            )
        })
    })
}

export async function removeTrack(playlistId, trackId) {
    try {
        const { message } = await httpRequest.del(
            EndPoints.playlists.removeTrack(playlistId, trackId)
        )
        toast.success("Success", message)
    } catch (error) {
        const codeError = error?.response?.error.code
        const mesError = error?.response?.error.message
        if (codeError && mesError) {
            toast.error(codeError, mesError)
        }
    }
}
