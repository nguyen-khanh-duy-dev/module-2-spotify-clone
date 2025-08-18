import EndPoints from "./src/api/endpoints.js"
import httpRequest from "./src/api/httpRequest.js"
import toast from "./src/utils/toast.js"
import { convertTime } from "./src/utils/convertTime.js"

import { handleAuth } from "./src/auth/authHandler.js"
import { renderBiggestHitsSection } from "./src/render/todayBiggestHitSection.js"
import { renderArtistsSection } from "./src/render/popularArtistSection.js"
import { renderDetail } from "./src/render/detailSection.js"
import { handleSidebar } from "./src/components/sidebar.js"
import { toolTipSidebar } from "./src/components/toolTip/ttSidebar.js"

// import { renderBiggestHits } from "./render/renderBiggestHits.js" Done
// import { renderArtists } from "./render/renderArtists.js" Done
// import { renderPlaylist } from "./render/renderPlaylist.js"
// import {
//     toolTipSidebar,
//     layoutSelector,
//     renderSidebar,
//     createPlaylist,
//     filterPlaylists,
//     searchPlaylist,
//     showContextMenu,
//     renderDetailPlaylist,
//     createNewPlaylist,
//     showEditPlaylist,
// } from "./src/sidebar.js"
// import "./src/context-menu-app.js"
// import "./src/edit-detail-app.js"
// import "./src/modal-app.js"

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
    handleAuth()
})

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
    const userAvatar = document.getElementById("userAvatar")
    const userDropdown = document.getElementById("userDropdown")
    const logoutBtn = document.getElementById("logoutBtn")

    // Toggle dropdown when clicking avatar
    userAvatar.addEventListener("click", function (e) {
        e.stopPropagation()
        userDropdown.classList.toggle("show")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        if (
            !userAvatar.contains(e.target) &&
            !userDropdown.contains(e.target)
        ) {
            userDropdown.classList.remove("show")
        }
    })

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && userDropdown.classList.contains("show")) {
            userDropdown.classList.remove("show")
        }
    })

    // Handle logout button click
    logoutBtn.addEventListener("click", function () {
        // Close dropdown first
        userDropdown.classList.remove("show")

        console.log("Logout clicked")
        // TODO: Students will implement logout logic here
    })
})

// Player functionality
document.addEventListener("DOMContentLoaded", function () {
    const toolTip = document.querySelectorAll(".tool-tip")

    toolTip.forEach((item) => {
        const controlBtn = item.closest(".control-btn")
        if (controlBtn) {
            controlBtn.addEventListener("mouseover", (e) => {
                item.style.display = "inline-block"
            })

            controlBtn.addEventListener("mouseout", (e) => {
                item.style.display = "none"
            })
        }
    })
})

// Sidebar functionality
document.addEventListener("DOMContentLoaded", async function () {
    handleSidebar()

    // createPlaylistSection()
    // toolTipSidebar()
    // layoutSelector()
    // createPlaylist()
    // filterPlaylists()
    // searchPlaylist()
    // createNewPlaylist()
})

// Other functionality
document.addEventListener("DOMContentLoaded", async () => {
    const authButtons = document.querySelector(".auth-buttons")
    const userMenu = document.querySelector(".user-menu")
    try {
        const { user } = await httpRequest.get("users/me")
        updateCurrentUser(user)
        userMenu.style.display = "flex"
    } catch (error) {
        authButtons.style.display = "flex"
    }

    await renderBiggestHitsSection()
    await renderArtistsSection()

    let isArtist = false

    detailArtistPlaylist(isArtist)
    // showContextMenu()
    // Render from sidebar
    // renderDetailPlaylist()
})

// Function to show detail Play list of Artist
function detailArtistPlaylist(isArtist) {
    const artistCards = document.querySelectorAll(".artist-card")

    artistCards.forEach((card) => {
        card.onclick = async (e) => {
            isArtist = true

            const currentArtistID = e.currentTarget.dataset.artistId

            const artistId = e.currentTarget.dataset.artistId
            if (artistId) {
                await renderDetail(artistId, isArtist)
            }
            showDetailPlaylist()
            handleFollow(currentArtistID)
        }
    })
}

async function updateCurrentUser(user) {
    // get DOM Header Action and .user-menu
    const headerAction = document.querySelector(".header-actions")
    const authButtons = headerAction.querySelector(".auth-buttons")
    const userMenu = headerAction.querySelector(".user-menu")
    const userName = document.querySelector(".user-name")
    const userAvatar = document.querySelector(".user-avatar")

    const homeButton = document.querySelector(".home-btn")
    const logoButton = document.querySelector(".logo i")

    homeButton.addEventListener("click", (e) => {
        e.preventDefault()
        window.location.href = "./index.html"
    })

    logoButton.addEventListener("click", (e) => {
        window.location.href = "./index.html"
    })

    try {
        const { user } = await httpRequest.get("users/me")
        if (user.avatar_url) {
            userAvatar.src = user.avatar_url
        }

        if (user.email) {
            userName.textContent = user.email.split("@")[0]
        }

        userMenu.style.display = "flex"
        authButtons.style.display = "none"
    } catch (error) {
        authButtons.style.display = "flex"
    }
}

export function showDetailPlaylist() {
    const detailPlaylist = document.querySelector(".detail-playlist")
    const hitSection = document.querySelector(".hits-section")
    const artistSection = document.querySelector(".artists-section")
    const detailCreate = document.querySelector(".detail-create")

    detailPlaylist.scrollTo({
        top: 0,
        behavior: "smooth",
    })
    detailPlaylist.classList.add("show")
    hitSection.style.display = "none"
    artistSection.style.display = "none"
    detailCreate.classList.remove("show")
}

function handleFollow(currentArtistId) {
    const followBtn = document.querySelector(".follow")
    const iconCheck = document.querySelector(".follow i")
    if (!followBtn) return

    followBtn.addEventListener("click", async (e) => {
        followBtn.classList.toggle("active")

        if (iconCheck.classList.contains("fa-plus")) {
            iconCheck.classList.remove("fa-plus")
            iconCheck.classList.add("fa-check")
            try {
                const result = await httpRequest.post(
                    `artists/${currentArtistId}/follow`
                )
                console.log(result)

                toast.success("Thành công", result.message)
            } catch (error) {
                const codeErr = error?.response?.error.code
                const messageErr = error?.response?.error.message
                toast.error(codeErr, messageErr)
            }
        } else {
            iconCheck.classList.add("fa-plus")
            iconCheck.classList.remove("fa-check")

            try {
                const result = await httpRequest.del(
                    `artists/${currentArtistId}/follow`
                )
                toast.success("Thành công", result.message)
            } catch (error) {
                const codeErr = error?.response?.error.code
                const messageErr = error?.response?.error.message
                toast.error(codeErr, messageErr)
            }
        }
    })
}
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

function addTracksToPlaylist(playlistID) {
    const addTracksBtn = document.querySelectorAll(".find-tracks .add-btn")
    if (!addTracksBtn) return

    addTracksBtn.forEach((addBtn) => {
        addBtn.onclick = (e) => {
            const trackID = e.target.closest(".song-item ").dataset.trackId
            renderTracks(trackID, playlistID)
        }
    })
}

async function renderTracks(trackID, playlistID) {
    let html = ""
    const myTracks = document.querySelector(".my-tracks")
    const myTracksSection = document.querySelector(".my-tracks .track-item")
    try {
        const trackById = await httpRequest.get(`tracks/${trackID}`)
        const track_id = trackById.id
        const credentials = {
            track_id,
            position: 0,
        }
        const { message, playlist_track } = await httpRequest.post(
            `playlists/${playlistID}/tracks`,
            credentials
        )
        if (myTracksSection) {
            html = `
            <div class="track-item">
                <div class="col number">
                    <span class="track-index">${1}</span>
                    <span class="track-play">▶</span>
                </div>
                <div class="col title">
                    ${trackById.title}
                </div>
                <div class="col artist">${trackById.artist_name}</div>
                <div class="col duration">${convertTime(
                    trackById.duration
                )}</div>
            </div>`

            myTracks.insertAdjacentHTML("beforeend", html)
        }
    } catch (error) {
        console.log(error)
    }
}
