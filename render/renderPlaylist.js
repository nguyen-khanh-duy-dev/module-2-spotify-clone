import httpRequest from "../utils/httpRequest.js"
import { convertTime } from "../utils/convertTime.js"

export async function renderPlaylist(
    id,
    artistHeroEl,
    playlistSection,
    isArtist
) {
    const trackItems = playlistSection.querySelectorAll(".track-item")
    const trackList = playlistSection.querySelector(".track-list")
    try {
        const { tracks } = await httpRequest.get(`tracks`)
        const trackFit = tracks.filter((track) => track.artist_id === id)
        console.log(id)

        if (isArtist) {
            const getArtist = await httpRequest.get(`artists/${id}`)

            const artistHeroHtml = `
            <div class="hero-background">
                <img
                    src="${getArtist.background_image_url ?? "placeholder.svg"}"
                    alt="${
                        getArtist.name ?? "Không xác định"
                    } artist background"
                    class="hero-image"
                />
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <div class="verified-badge">
                    <i class="fas fa-check-circle"></i>
                    <span>${
                        getArtist.is_verified
                            ? "Verified Artist"
                            : "Not Verified Artist"
                    }</span>
                </div>
                <h1 class="artist-name">${
                    getArtist.name ?? "Không xác định"
                }</h1>
                <p class="monthly-listeners">
                    ${getArtist.monthly_listeners ?? "0"} monthly listeners
                </p>
            </div>
            `
            artistHeroEl.innerHTML = artistHeroHtml
        } else {
            const getPlaylist = await httpRequest.get(`playlists/${id}`)

            const detailHeroHtml = `
            <div class="hero-background">
                <img
                    src="${
                        getPlaylist.background_image_url ?? "placeholder.svg"
                    }"
                    alt="${
                        getPlaylist.name ?? "Không xác định"
                    } artist background"
                    class="hero-image"
                />
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <div class="verified-badge">
                    <i class="fas fa-check-circle"></i>
                    <span>${
                        getPlaylist.is_verified
                            ? "Verified Artist"
                            : "Not Verified Artist"
                    }</span>
                </div>
                <h1 class="artist-name">${
                    getPlaylist.name ?? "Không xác định"
                }</h1>
                <p class="monthly-listeners">
                    ${convertTime(getPlaylist.total_duration) ?? "0"}
                </p>
            </div>
            `
            artistHeroEl.innerHTML = detailHeroHtml
        }

        const html = trackFit
            .map(
                (track) => `
            <div class="track-item">
                <div class="track-number">1</div>
                <div class="track-image">
                    <img
                        src="https://picsum.photos/300"
                        alt="${track.title ?? "Unknown Track"}"
                    />
                </div>
                <div class="track-info">
                    <div class="track-name">
                        ${track.title} 
                    </div>
                </div>
                <div class="track-plays">${track.play_count ?? "0"}</div>
                <div class="track-duration">${
                    convertTime(track.duration) ?? "0"
                }</div>
                <button class="track-menu-btn">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>`
            )
            .join("")
        console.log(html)

        trackList.innerHTML = html
    } catch (error) {
        console.log(error)
    }
}
