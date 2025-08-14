// render/renderBiggestHits.js
import httpRequest from "../utils/httpRequest.js"

export async function renderBiggestHits() {
    const hitsContainer = document.querySelector(".hits-grid")

    try {
        const { tracks } = await httpRequest.get("tracks/popular?limit=10")

        const html = tracks
            .map(
                (track) => `
            <div class="hit-card" data-hit-id="${track.id}">
                <div class="hit-card-cover">
                    <img
                        src="${track.image_url ?? "https://picsum.photos/300"}"
                        alt="Flowers"
                    />
                    <button class="hit-play-btn">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                <div class="hit-card-info">
                    <h3 class="hit-card-title">${
                        track.title ?? "Không xác định"
                    }</h3>
                    <p class="hit-card-artist">${
                        track.artist_name ?? "Không xác định"
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
