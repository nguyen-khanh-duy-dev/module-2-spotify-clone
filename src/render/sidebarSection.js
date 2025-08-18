// Function to render sidebar section for playlist and artist
// Input: playlists(Myartist or artist,)
export function renderSidebar(playLists, isPlaylistsTab) {

    const libraryContent = document.querySelector(".library-content")
    libraryContent.textContent = ""
    const html = playLists
        .map(
            (playlist) => ` 
                <div class="library-item" data-playlist-id="${playlist.id}">
                    <img
                        src="${
                            playlist.image_url ?? "https://picsum.photos/300"
                        }"
                        alt="${playlist.name ?? "Không xác định"}"
                        class="item-image"
                    />
                    <div class="item-info">
                        <div class="item-title">${
                            playlist.name ?? "Không xác định"
                        }</div>
                        <div class="item-subtitle">${
                            isPlaylistsTab
                                ? playlist.user_display_name ?? "Không xác định"
                                : "Artist"
                        }</div>
                    </div>
                </div>`
        )
        .join("")
    libraryContent.insertAdjacentHTML("beforeend", html)
}
