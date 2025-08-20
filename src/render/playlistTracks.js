import httpRequest from "../api/httpRequest.js"
import EndPoints from "../api/endpoints.js"
import { addTracksToPlaylist } from "../components/sidebar.js"

export function renderMySearchTracks(playlistID) {
    const sectionFindTracks = document.querySelector(".find-tracks")
    const searchTracksInput = document.querySelector("#search-tracks")
    searchTracksInput.addEventListener("input", async (e) => {
        const inputValue = e.target.value.toLowerCase().trim()
        try {
            const { tracks } = await httpRequest.get("tracks?limit=50&offset=0")
            const filtered = tracks.filter((track) =>
                track.title.toLowerCase().includes(inputValue)
            )
            if (inputValue) {
                const html = filtered
                    .map(
                        (item) =>
                            `
                    <div class="song-item" data-track-id ="${item.id}">
                        <img
                            src="${item.image_url}"
                            alt="cover"
                        />
                        <div class="song">
                            <span class="title">${item.title}</span>
                            <span class="sub-title">${item.artist_name}</span>
                        </div>
                        <button class="add-btn">Add</button>
                    </div>
                    `
                    )
                    .join("")
                sectionFindTracks.innerHTML = html
                addTracksToPlaylist(playlistID)
            } else {
                sectionFindTracks.innerHTML = ""
            }
        } catch (error) {
            console.log(error)
        }
    })
}
