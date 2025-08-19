import httpRequest from "../api/httpRequest.js"
import EndPoints from "../api/endpoints.js"

import { convertTime } from "../utils/convertTime.js"

const artistHero = document.querySelector(".artist-hero")
const artistControl = document.querySelector(".artist-controls")
let isFollowed = false
const playlistSection = document.querySelector(".popular-section")

// Function to render Detail Section of Playlist or Artist
// Input: Id of playlist or Artist
//      : It is Artist -> True(Artist), False(Playlist)
export async function renderDetail(id, isArtist) {
    const trackList = playlistSection.querySelector(".track-list")
    let tracksPlaylist = null

    try {
        if (!isArtist) {
            const { tracks } = await httpRequest.get(
                EndPoints.playlists.getTracks(id)
            )
            tracksPlaylist = tracks
        }
        const { tracks } = await httpRequest.get(EndPoints.tracks.all)
        const trackFit = isArtist
            ? tracks.filter((track) => track.artist_id === id)
            : tracksPlaylist

        let detailPlaylist = null
        if (isArtist) {
            detailPlaylist = await httpRequest.get(`artists/${id}`)
            const { artists } = await httpRequest.get(
                EndPoints.artists.followed
            )
            const result = artists.find((artist) => artist.id === id)
            if (result) {
                isFollowed = true
            }
        } else {
            detailPlaylist = await httpRequest.get(`playlists/${id}`)
            const { playlists } = await httpRequest.get(
                EndPoints.playlists.followed
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
                        src="${
                            isArtist
                                ? track.image_url
                                : `https://spotify.f8team.dev${track.track_image_url}` ??
                                  "https://picsum.photos/200/200"
                        }"
                        alt="${
                            isArtist
                                ? track.title
                                : track.track_title ?? "UnKnow"
                        }"
                    />
                </div>
                <div class="track-info">
                    <div class="track-name">
                        ${
                            isArtist
                                ? track.title
                                : track.track_title ?? "UnKnow"
                        } 
                    </div>
                </div>
                <div class="track-plays">${track.play_count ?? "0"}</div>
                <div class="track-duration">${
                    isArtist
                        ? convertTime(track.duration)
                        : convertTime(track.track_duration) ?? "0"
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
