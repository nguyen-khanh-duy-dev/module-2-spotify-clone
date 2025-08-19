import EndPoints from "../api/endpoints.js"
import httpRequest from "../api/httpRequest.js"

// Function to render Section of Playlist at Home
export async function renderPlaylistsSection() {
    const playlistsContainer = document.querySelector(".playlists-grid")

    try {
        const { playlists } = await httpRequest.get(EndPoints.playlists.all(10))

        const html = playlists
            .map(
                (playlist) => `
                <div class="playlist-card" data-playlist-id="${playlist.id}">
                    <div class="playlist-card-cover">
                        <img
                            src="${
                                playlist.image_url ??
                                "https://s3.eu-central-1.amazonaws.com/uploads.mangoweb.org/shared-prod/visegradfund.org/uploads/2021/08/placeholder-male.jpg"
                            }"
                            alt="Đen"
                        />
                        <button class="playlist-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    <div class="playlist-card-info">
                        <h3 class="playlist-card-name">${
                            playlist.name ?? "Không xác định"
                        }</h3>
                        <p class="playlist-card-type">playlist</p>
                    </div>
                </div>
            `
            )
            .join("")
        playlistsContainer.innerHTML = html
    } catch (error) {
        console.log(error)
    }
}
