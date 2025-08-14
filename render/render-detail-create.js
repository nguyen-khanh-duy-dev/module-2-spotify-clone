export function renderDetailCreate(newPlaylist, hasUpdated = false) {
    console.log(newPlaylist, hasUpdated)

    const currentNumberPlaylist = newPlaylist.name.split("#")[1]
    const ownerPlaylist = localStorage.getItem("user").display_name ?? "Duyyyyy"
    const html = `
    <!-- Playlist Header -->
        <div class="header">
            <div class="cover">
                ${
                    hasUpdated
                        ? `<img src="${newPlaylist.image_url}" alt="cover image">`
                        : '<i class="fas fa-music"></i>'
                }
            </div>
            <div class="info">
                <p class="type">${
                    newPlaylist.is_public
                        ? "Public Playlist"
                        : "Private Playlist"
                }</p>
                <h1 class="name">${
                    hasUpdated
                        ? newPlaylist.name
                        : `#My Playlist ${currentNumberPlaylist}`
                }</h1>
                <span class="desc">${
                    hasUpdated ? newPlaylist.description : ""
                }</span>
                <p class="owner">${ownerPlaylist}</p>
            </div>
        </div>

        <!-- Playlist Controls -->
        <div class="controls">
            <div class="left">
                <button>
                    <i class="fas fa-user-plus"></i>
                </button>
                <button>
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            <div class="right">
                <span class="view-label">Compact</span>
                <i class="fas fa-bars"></i>
            </div>
        </div>

        <!-- Search Section -->
        <div class="search-section">
            <p class="title">
                Let's find something for your playlist
            </p>
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input
                    type="text"
                    placeholder="Search for songs or episodes"
                />
                <button class="clear">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <!-- Empty Placeholder -->
        <div class="empty-placeholder"></div>`
    return html
}

function showDetailCreate() {
    const detailCreate = document.querySelector(".detail-create")
    const hitSection = document.querySelector(".hits-section")
    const artistSection = document.querySelector(".artists-section")
    const modalCreate = document.querySelector(".modal-create-playlist")
    const iconCreate = document.querySelector(".create-btn .plus-icon")
    console.log(iconCreate)

    detailCreate.scrollTo({
        top: 0,
        behavior: "smooth",
    })
    detailCreate.classList.add("show")
    modalCreate.classList.remove("active")
    iconCreate.classList.remove("active")
    hitSection.style.display = "none"
    artistSection.style.display = "none"
}
