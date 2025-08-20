import httpRequest from "../../api/httpRequest.js"
import EndPoints from "../../api/endpoints.js"

export function handleDelTrack() {
    const trackItems = document.querySelectorAll(".track-item")
    console.log(trackItems)

    trackItems.forEach((item) => {
        item.onclick = () => {
            const currentTrackId = item.dataset.trackId
            console.log(currentTrackId)
        }
    })
}
