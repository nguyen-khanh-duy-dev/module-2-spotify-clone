// render/renderBiggestHits.js
import httpRequest from "../utils/httpRequest.js"

export async function renderBiggestHits() {
    const hitsContainer = document.querySelector(".hits-grid")

    try {
        const { playlists } = await httpRequest.get(
            "playlists?limit=10&offset=0"
        )

        const html = playlists
            .map(
                (playlist) => `
            <div class="hit-card" data-hit-id="${playlist.id}">
                <div class="hit-card-cover">
                    <img
                        src="${
                            playlist.image_url ??
                            "https://s3.eu-central-1.amazonaws.com/uploads.mangoweb.org/shared-prod/visegradfund.org/uploads/2021/08/placeholder-male.jpg"
                        }"
                        alt="Flowers"
                    />
                    <button class="hit-play-btn">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                <div class="hit-card-info">
                    <h3 class="hit-card-title">${
                        playlist.name ? playlist.name : "Không xác định"
                    }</h3>
                    <p class="hit-card-artist">${
                        playlist.user_display_name
                            ? playlist.name
                            : "Không xác định"
                    }</p>
                </div>
            </div>`
            )
            .join("")
        hitsContainer.innerHTML = html
    } catch (error) {
        console.log(error)
    }
}
