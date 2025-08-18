import EndPoints from "../api/endpoints.js"
import httpRequest from "../api/httpRequest.js"

// Function to render Section of Artist at Home
export async function renderArtistsSection() {
    const artistsContainer = document.querySelector(".artists-grid")

    try {
        const { artists } = await httpRequest.get(EndPoints.artists.all)

        const html = artists
            .map(
                (artist) => `
                <div class="artist-card" data-artist-id="${artist.id}">
                    <div class="artist-card-cover">
                        <img
                            src="${
                                artist.image_url ??
                                "https://s3.eu-central-1.amazonaws.com/uploads.mangoweb.org/shared-prod/visegradfund.org/uploads/2021/08/placeholder-male.jpg"
                            }"
                            alt="Đen"
                        />
                        <button class="artist-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    <div class="artist-card-info">
                        <h3 class="artist-card-name">${
                            artist.name ?? "Không xác định"
                        }</h3>
                        <p class="artist-card-type">Artist</p>
                    </div>
                </div>
            `
            )
            .join("")
        artistsContainer.innerHTML = html
    } catch (error) {
        console.log(error)
    }
}
