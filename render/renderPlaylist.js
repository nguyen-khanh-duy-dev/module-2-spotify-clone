import httpRequest from "../utils/httpRequest.js"
import { convertTime } from "../utils/convertTime.js"

const artistHero = document.querySelector(".artist-hero")
const artistControl = document.querySelector(".artist-controls")
let isFollowed = false
const playlistSection = document.querySelector(".popular-section")

export async function renderPlaylist(id, isArtist) {
    const trackList = playlistSection.querySelector(".track-list")

    try {
        const { tracks } = await httpRequest.get(`tracks`)
        const trackFit = tracks.filter((track) => track.artist_id === id)

        let detailPlaylist = null
        if (isArtist) {
            detailPlaylist = await httpRequest.get(`artists/${id}`)
            const { artists } = await httpRequest.get(
                "me/following?limit=20&offset=0"
            )
            const result = artists.find((artist) => artist.id === id)
            if (result) {
                isFollowed = true
            }
        } else {
            detailPlaylist = await httpRequest.get(`playlists/${id}`)
            const { playlists } = await httpRequest.get(
                "me/playlists/followed?limit=20&offset=0"
            )
            const result = playlists.find((playlist) => playlist.id === id)
            if (result) {
                isFollowed = true
            }
        }

        const heroSectionHtml = `
            <div class="hero-background">
                <img
                    src="${
                        detailPlaylist.image_url ?? "https://picsum.photos/300"
                    }"
                    alt="${detailPlaylist.name} artist background"
                    class="hero-image"
                />
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <div class="verified-badge">
                    <i class="fas fa-check-circle"></i>
                    <span>${
                        isArtist
                            ? detailPlaylist.is_verified
                                ? "Verified Artist"
                                : "Not Verified Artist"
                            : ""
                    }</span>
                </div>
                <h1 class="artist-name">${detailPlaylist.name}</h1>
                <p class="monthly-listeners">
                    ${
                        isArtist ? detailPlaylist.monthly_listeners : "0"
                    } monthly listeners
                </p>
            </div>
            `
        artistHero.innerHTML = heroSectionHtml

        const artistControlHtml = `
            <button class="play-btn-large">
                <i class="fas fa-play"></i>
            </button><div class="extra-controls">
                <button class="shuffle-btn active">
                    <i class="fas fa-random"></i>
                </button>
                <button class="add-btn follow ${isFollowed ? "active" : ""}">
                    <i class="fas ${isFollowed ? "fa-check" : "fa-plus"}"></i>
                    <!-- active => fa-check -->
                </button>
                <button class="download-btn">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="more-btn">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
        `
        artistControl.innerHTML = artistControlHtml
        const html = trackFit
            .map(
                (track) => `
            <div class="track-item">
                <div class="track-number">1</div>
                <div class="track-image">
                    <img
                        src="${track.image_url ?? "https://picsum.photos/300"}"
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

        trackList.innerHTML = html
    } catch (error) {
        console.log(error)
    }
}
