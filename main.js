import EndPoints from "./src/api/endpoints.js"
import httpRequest from "./src/api/httpRequest.js"
import toast from "./src/utils/toast.js"
import { convertTime } from "./src/utils/convertTime.js"

import { handleAuth } from "./src/auth/authHandler.js"
import { renderBiggestHitsSection } from "./src/render/todayBiggestHitSection.js"
import { renderArtistsSection } from "./src/render/popularArtistSection.js"
import { renderDetail } from "./src/render/detailSection.js"
import { renderPlaylistsSection } from "./src/render/popularPlaylistSection.js"
import { handleSidebar, isPlaylistsTab } from "./src/components/sidebar.js"

// Player
import { playerTrack, playerPlaylist } from "./src/components/content/player.js"

import "./src/components/webcomponents/modal-app.js"
import "./src/components/webcomponents/edit-detail-app.js"

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
    await renderPlaylistsSection()

    handleShowDetailSection()
    // showContextMenu()
    // Render from sidebar
    // renderDetailPlaylist()

    playerTrack()
    playerPlaylist()
})

// Function to show detail Play list of Artist
function handleShowDetailSection() {
    const artistCards = document.querySelectorAll(".artist-card")
    const playlistCards = document.querySelectorAll(".playlist-card")
    let isArtist = null

    artistCards.forEach((card) => {
        card.onclick = async (e) => {
            isArtist = true

            const currentArtistID = e.currentTarget.dataset.artistId

            const artistId = e.currentTarget.dataset.artistId
            if (artistId) {
                await renderDetail(artistId, isArtist)
            }
            showDetailPlaylist()
            handleFollow(currentArtistID, isArtist)
        }
    })

    playlistCards.forEach((card) => {
        card.onclick = async (e) => {
            isArtist = false

            const currentPlaylistID = e.currentTarget.dataset.playlistId

            if (currentPlaylistID) {
                await renderDetail(currentPlaylistID, isArtist)
            }
            showDetailPlaylist()
            handleFollow(currentPlaylistID, isArtist)
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
    const playlistSection = document.querySelector(".playlists-section")
    const detailCreate = document.querySelector(".detail-create")

    detailPlaylist.scrollTo({
        top: 0,
        behavior: "smooth",
    })
    detailPlaylist.classList.add("show")
    hitSection.style.display = "none"
    artistSection.style.display = "none"
    detailCreate.classList.remove("show")
    playlistSection.style.display = "none"
}

function handleFollow(currentID, isArtist) {
    const followBtn = document.querySelector(".follow")
    const iconCheck = document.querySelector(".follow i")

    let result = null
    if (!followBtn) return

    followBtn.addEventListener("click", async (e) => {
        if (iconCheck.classList.contains("fa-plus")) {
            try {
                isArtist
                    ? (result = await httpRequest.post(
                          EndPoints.artists.follow(currentID)
                      ))
                    : (result = await httpRequest.post(
                          EndPoints.playlists.follow(currentID)
                      ))

                iconCheck.classList.remove("fa-plus")
                iconCheck.classList.add("fa-check")
                followBtn.classList.add("active")

                handleSidebar(isPlaylistsTab())

                toast.success("Success", result.message)
            } catch (error) {
                const codeErr = error?.response?.error.code
                const messageErr = error?.response?.error.message

                toast.error(codeErr, messageErr)
                followBtn.classList.remove("active")
            }
        } else {
            try {
                isArtist
                    ? (result = await httpRequest.del(
                          EndPoints.artists.unfollow(currentID)
                      ))
                    : (result = await httpRequest.del(
                          EndPoints.playlists.unfollow(currentID)
                      ))
                iconCheck.classList.add("fa-plus")
                iconCheck.classList.remove("fa-check")
                followBtn.classList.remove("active")

                handleSidebar(isPlaylistsTab())

                toast.success("Success", result.message)
            } catch (error) {
                const codeErr = error?.response?.error.code
                const messageErr = error?.response?.error.message
                toast.error(codeErr, messageErr)
                // followBtn.classList.remove("active")
            }
        }
    })
}

// // Player
// document.addEventListener("DOMContentLoaded", async () => {
//     function afterRender() {
//         playerTrack()
//     }
// })
