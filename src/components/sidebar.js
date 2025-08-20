import EndPoints from "../api/endpoints.js"
import { renderSidebar } from "../render/sidebarSection.js"
import { convertTime } from "../utils/convertTime.js"
import httpRequest from "../api/httpRequest.js"
import toast from "../utils/toast.js"
import { renderDetail } from "../render/detailSection.js"
import { showDetailPlaylist } from "../../main.js"
import { renderMySearchTracks } from "../render/playlistTracks.js"
import { toolTipSidebar } from "./toolTip/ttSidebar.js"
import {
    renderUpdateTracks,
    renderMyTracks,
} from "../render/tracksAtDetailPlaylist.js"

import { handleDelTrack } from "./content/content.js"
// import { renderMySearchTracks } from "../../main.js"

const libraryContent = document.querySelector(".library-content")
const sidebar = document.querySelector(".sidebar")

// import { renderPlaylist } from "../render/renderPlaylist.js" => Done -> Render Detail
// let hasUpdated = false

// const sidebar = document.querySelector(".sidebar")
// const searchBtn = document.querySelector(".search-library-btn")
// const searchInput = document.querySelector("#search-library-input")
// const sortBtn = document.querySelector(".sort-btn")

// // Function to show tool-tip at sidebar => Xử lý trường hợp có thanh cuộn làm ẩn tool-tip
// //  => Tách riêng tool tip ở đây xuống cuối file html
// export function toolTipSidebar() {
//     const toolTip = document.querySelector(".tool-tip-sidebar")
//     const createBtn = document.querySelector(".create-btn")

//     createBtn.addEventListener("mouseover", (e) => {
//         const x = e.currentTarget.offsetLeft
//         const y = e.currentTarget.offsetTop

//         toolTip.style.left = `${x - 20}px`
//         toolTip.style.top = `${y - 20}px`
//         toolTip.style.display = "block"
//         // toolTip.setAttribute("position", "absolute")
//     })
//     createBtn.addEventListener("mouseout", (e) => {
//         const x = e.currentTarget.offsetLeft
//         const y = e.currentTarget.offsetTop

//         toolTip.style.display = "none"
//         // toolTip.setAttribute("position", "absolute")
//     })
// }
// Done

// Function to show modal selector at sidebar
export function layoutSelector() {
    const sortBtn = document.querySelector(".sort-btn")
    const dropDown = document.querySelector(".dropdown")

    sortBtn.onclick = (e) => {
        const rect = e.target.getBoundingClientRect()

        const currentDisplay = getComputedStyle(dropDown).display

        if (currentDisplay === "none") {
            dropDown.style.display = "block"
            dropDown.style.left = `${rect.left}px`
            dropDown.style.top = `${rect.top + 30}px`
            // sidebar.classList.add("noscroll")
        } else {
            dropDown.style.display = "none"
            sidebar.classList.remove("noscroll")
        }

        document.addEventListener("click", (e) => {
            // Nếu click ra ngoài input => ẩn
            if (!sortBtn.contains(e.target) && !dropDown.contains(e.target)) {
                dropDown.style.display = "none"
                sidebar.classList.remove("noscroll")
            }
        })
    }
}

// Function to update view as sidebar => using add class at layout css
function updateViewAs(currentActiveViewAs) {
    if (currentActiveViewAs.classList.contains("compact-list")) {
        libraryContent.className = "library-content compact-list"
    } else if (currentActiveViewAs.classList.contains("default-list")) {
        libraryContent.className = "library-content default-list"
    } else if (currentActiveViewAs.classList.contains("compact-grid")) {
        libraryContent.className = "library-content compact-grid"
    } else if (currentActiveViewAs.classList.contains("default-grid")) {
        libraryContent.className = "library-content default-grid"
    }
}

async function getDataPlaylists() {
    // Get My playlist and My followed playlist
    const { playlists: myPlaylists } = await httpRequest.get(
        EndPoints.playlists.me
    )
    const { playlists: myFollowedPlaylist } = await httpRequest.get(
        EndPoints.playlists.followed
    )
    const allMyPlaylists = [...myPlaylists, ...myFollowedPlaylist]

    return allMyPlaylists
}

async function getDataArtists() {
    // Get my followed artist
    const { artists } = await httpRequest.get(EndPoints.artists.followed)
    return artists
}

async function switchTabs(isPlaylists) {
    const searchInput = document.querySelector("#search-library-input")
    const navTabs = document.querySelectorAll(".nav-tab")

    const allMyPlaylists = await getDataPlaylists()
    const myFlArtists = await getDataArtists()
    isPlaylists
        ? renderSidebar(allMyPlaylists, true)
        : renderSidebar(myFlArtists, false)

    navTabs.forEach((tab) => {
        tab.onclick = async (e) => {
            const playlists = await getDataPlaylists()
            const artists = await getDataArtists()

            // Luôn update class active cho tab
            const beforeActive = document.querySelector(".nav-tab.active")
            if (beforeActive) beforeActive.classList.remove("active")
            e.target.classList.add("active")
            if (beforeActive === e.target) return

            const keyword = searchInput.value.trim().toLowerCase()

            if (keyword) {
                // Nếu có keyword thì filter nhưng vẫn theo tab đang chọn
                if (e.target.textContent.trim() === "Playlists") {
                    await filterData(keyword) // lọc trong playlists
                } else {
                    await filterData(keyword) // lọc trong artists
                }
            } else {
                // Nếu input trống thì render mặc định
                if (e.target.textContent.trim() === "Playlists") {
                    renderSidebar(playlists, true)
                } else {
                    renderSidebar(artists, false)
                }
            }
        }
    })
}

export function isPlaylistsTab() {
    const currentTab = document.querySelector(".nav-tab.active")
    if (currentTab.innerText === "Playlists") {
        return true
    } else if (currentTab.innerText === "Artists") {
        return false
    }
}

function getCurrentSort() {
    const currentSort = document.querySelector(".sort-btn").textContent.trim()
    return currentSort
}

function sortData(list, option) {
    let finalListSort = null
    if (option === "Recents") {
        finalListSort = [...list].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at)
        })
    } else if (option === "Recently added") {
        finalListSort = [...list].sort((a, b) => {
            return a.name.localeCompare(b.name)
        })
    } else if (option === "Alphabetical") {
        finalListSort = [...list].sort((a, b) => {
            return a.name.localeCompare(b.name)
        })
    } else if (option === "Creator") {
        finalListSort = [...list].sort((a, b) => {
            return a.name.localeCompare(b.name)
        })
    }
    return finalListSort
}

async function handleSort() {
    let finalData = null
    const dropDown = document.querySelector(".dropdown")
    const optionSort = dropDown.querySelectorAll(".option")

    const playlists = await getDataPlaylists()
    const artists = await getDataArtists()

    // Cần xử lý dữ liệu khi là null hoặc undefined

    dropDown.addEventListener("click", (e) => {
        const option = e.target.closest(".option")
        if (!option) return

        const beforeOptionActive = dropDown.querySelector(".option.active")
        const currentActiveViewAs = document.querySelector(".view-btn.active")

        if (beforeOptionActive === option) return
        beforeOptionActive.classList.remove("active")
        option.classList.add("active")

        const currentOptionText = option.textContent.trim()
        if (isPlaylistsTab()) {
            if (currentOptionText === "Recents") {
                finalData = sortData(playlists, "Recents")
            } else if (currentOptionText === "Recently added") {
                finalData = sortData(playlists, "Recently added")
            } else if (currentOptionText === "Alphabetical") {
                finalData = sortData(playlists, "Alphabetical")
            } else if (currentOptionText === "Creator") {
                finalData = sortData(playlists, "Creator")
            }
        } else {
            if (currentOptionText === "Recents") {
                finalData = sortData(artists, "Recents")
            } else if (currentOptionText === "Recently added") {
                finalData = sortData(artists, "Recently added")
            } else if (currentOptionText === "Alphabetical") {
                finalData = sortData(artists, "Alphabetical")
            } else if (currentOptionText === "Creator") {
                finalData = sortData(artists, "Creator")
            }
        }
        renderSidebar(finalData, isPlaylistsTab())
    })
}

// Handle sidebar
export async function handleSidebar(isPlaylists = true) {
    const user = localStorage.getItem("user")
    if (!user) return
    const viewAs = document.querySelectorAll(".view-btn")
    layoutSelector()
    switchTabs(isPlaylists)
    handleSort()
    toggleCreateModal()
    searchPlaylist()
    showContextMenu()
    renderDetailPlaylist()
    toolTipSidebar()
    handleCreate()

    viewAs.forEach((view) => {
        view.onclick = (e) => {
            const beforeViewAsActive =
                document.querySelector(".view-btn.active")
            e.currentTarget.classList.add("active")
            if (beforeViewAsActive === e.currentTarget) return

            beforeViewAsActive.classList.remove("active")

            updateViewAs(e.currentTarget)
        }
    })
}

// JS for create Btn

export function toggleCreateModal() {
    const createBtn = document.querySelector(".create-btn")
    const plusIcon = createBtn.querySelector("i")
    const createModal = document.querySelector(".modal-create-playlist")

    createBtn.onclick = (e) => {
        plusIcon.classList.toggle("active")
        createModal.classList.toggle("active")
        sidebar.classList.add("noscroll")

        // close modal when click outside
        document.addEventListener("click", (e) => {
            if (
                !createBtn.contains(e.target) &&
                !createModal.contains(e.target)
            ) {
                plusIcon.classList.remove("active")
                createModal.classList.remove("active")
                sidebar.classList.remove("noscroll")
            }
        })
    }
}

async function filterData(keyword) {
    const searchLibraryInput = document.querySelector("#search-library-input")

    const playlists = await getDataPlaylists()
    const artists = await getDataArtists()
    let finalData = null
    if (isPlaylistsTab()) {
        keyword
            ? (finalData = playlists.filter((playlist) => {
                  return playlist.name.toLowerCase().includes(keyword)
              }))
            : (finalData = playlists)
    } else {
        keyword
            ? (finalData = artists.filter((artist) => {
                  return artist.name.toLowerCase().includes(keyword)
              }))
            : (finalData = artists)
    }

    // finalData = sortData(finalData, currentSort)
    searchLibraryInput.className.includes("show")
        ? renderSidebar(finalData, isPlaylistsTab())
        : ""
    // updateViewAs()
}

export function searchPlaylist() {
    const searchBtn = document.querySelector(".search-library-btn")
    const searchInput = document.querySelector("#search-library-input")
    const sortBtn = document.querySelector(".sort-btn")
    const dropDown = document.querySelector(".dropdown")

    searchBtn.addEventListener("click", (e) => {
        e.preventDefault()

        const viewAsActive = document
            .querySelector(".view-btn.active")
            .querySelector("i").className

        searchBtn.classList.add("hide")
        searchInput.classList.add("show")
        searchInput.focus()
        sortBtn.innerHTML = `<i class="${viewAsActive}"></i>`
        searchInput.addEventListener("input", async (e) => {
            const value = e.target.value.toLowerCase()

            await filterData(value)
        })
    })

    document.addEventListener("click", async (e) => {
        const inputValue = searchInput.value
        const navTab = document.querySelector(".nav-tabs")

        if (
            (!searchInput.contains(e.target) &&
                !searchBtn.contains(e.target) &&
                !navTab.contains(e.target)) ||
            (navTab.contains(e.target) && inputValue === "")
        ) {
            hideSearchInput()
            await filterData("")
        } else if (navTab.contains(e.target)) {
            // Giữ nguyên nếu có giá trị
            searchBtn.classList.add("hide")
            searchInput.classList.add("show")
            await filterData(searchInput.value.toLowerCase())
        }
    })
}

function hideSearchInput() {
    const searchBtn = document.querySelector(".search-library-btn")
    const searchInput = document.querySelector("#search-library-input")
    const sortBtn = document.querySelector(".sort-btn")
    const optionActive = document.querySelector(".option.active")
    const viewAsActive = document
        .querySelector(".view-btn.active")
        .querySelector("i").className

    searchInput.classList.remove("show")
    searchBtn.classList.remove("hide")
    searchInput.value = ""
    sortBtn.innerHTML = `${optionActive.innerText} <i class="${viewAsActive}"></i>`
}

async function checkIsMyPlaylist(currentPlaylistId) {
    const { playlists } = await httpRequest.get(EndPoints.playlists.me)

    const result = playlists.filter(
        (playlist) => currentPlaylistId === playlist.id
    )

    if (result.length > 0) {
        return true
    } else {
        return false
    }
}

async function delPlaylist(playlistID) {
    try {
        const message = await httpRequest.del(
            EndPoints.playlists.delete(playlistID)
        )
        toast.success("Delete Success", `${message.message}`)
        handleSidebar(true)
    } catch (error) {
        const codeError = error?.response?.error.code
        const mesError = error?.response?.error.message
        toast.error(codeError, mesError)
    }
}

// Xóa playlist của mình ở sidebar
function delMyPlaylistSidebar(currentPlaylistID) {
    const contextMenuMyPlaylist = document.querySelector(".context-my-playlist")
    const deleteEl = document.querySelector(".menu-item.delete")
    const modalApp = document.querySelector(".modal-app")
    const btnModal = modalApp.shadowRoot.querySelectorAll(".btn")

    deleteEl.onclick = () => {
        // Create and show overlay for modal when delete
        const overlay = document.createElement("div")
        overlay.className = "overlay show"
        document.body.appendChild(overlay)

        contextMenuMyPlaylist.classList.remove("show")
        modalApp.classList.add("show")
        btnModal.forEach((btn) => {
            btn.onclick = async (e) => {
                if (e.target.classList.contains("cancel-btn")) {
                    modalApp.classList.remove("show")
                    overlay.className = ""
                } else {
                    await delPlaylist(currentPlaylistID)
                    modalApp.classList.remove("show")
                    overlay.className = ""
                }
            }
        })
        document.addEventListener("click", (e) => {
            if (
                !modalApp.contains(e.target) &&
                !contextMenuMyPlaylist.contains(e.target)
            ) {
                modalApp.classList.remove("show")
                overlay.className = ""
            }
        })
    }
}

function editPlaylistSidebar(currentPlaylistID) {
    const editBtn = document.querySelector(".menu-item.edit")
    editBtn.onclick = async (e) => {
        const currentPlaylist = await httpRequest.get(
            EndPoints.playlists.byId(currentPlaylistID)
        )
        showDetailCreate()
        updateDetailCreateUI(currentPlaylist, true)
        showEditPlaylist(currentPlaylist)

        handleSidebar(true)
        contextMenuMyPlaylist.classList.remove("show")
    }
}

async function createPlaylist() {
    const credentials = {
        name: "My Playlist",
        description: "Playlist description",
        is_public: true,
        image_url:
            "https://mynoota.com/_next/image?url=%2F_static%2Fimages%2F__default.png&w=640&q=75",
    }
    const { playlist } = await httpRequest.post(
        EndPoints.playlists.create,
        credentials
    )

    return playlist
}

export async function showContextMenu() {
    const libraryContent = document.querySelector(".library-content")
    const contextMenuMyPlaylist = document.querySelector(".context-my-playlist")
    const contextLikedPlaylists = document.querySelector(".liked-playlists")
    const contextMenuMyFollowed = document.querySelector(".context-my-followed")
    const contextMenuArtist = document.querySelector(".context-artist")

    try {
        libraryContent.addEventListener("contextmenu", async (e) => {
            e.preventDefault()

            const currentElement = e.target.closest(".library-item")
            if (!currentElement) return
            const currentID = currentElement.dataset.playlistId

            const x = e.clientX
            const y = e.clientY
            const currentActiveTab = document.querySelector(".nav-tab.active")

            if (isPlaylistsTab()) {
                // Nếu là myplaylist => Có thể edit và xóa
                if (await checkIsMyPlaylist(currentID)) {
                    contextMenuMyPlaylist.classList.add("show")
                    Object.assign(contextMenuMyPlaylist.style, {
                        position: "fixed",
                        top: `${y}px`,
                        left: `${x}px`,
                        zIndex: 1000,
                    })
                    contextMenuMyFollowed.classList.remove("show")
                    contextLikedPlaylists.classList.remove("show")

                    delMyPlaylistSidebar(currentID)
                    editPlaylistSidebar(currentID)
                } else {
                    contextMenuMyFollowed.classList.add("show")
                    Object.assign(contextMenuMyFollowed.style, {
                        position: "fixed",
                        top: `${y}px`,
                        left: `${x}px`,
                        zIndex: 1000,
                    })
                    const unfollowPlaylist =
                        contextMenuMyFollowed.querySelector(
                            ".menu-item.unfollow"
                        )
                    unfollowPlaylist.onclick = (e) => {
                        handleUnfollowSidebar(currentID, contextMenuMyFollowed)
                    }
                    contextLikedPlaylists.classList.remove("show")
                    contextMenuMyPlaylist.classList.remove("show")
                }
            } else if (currentActiveTab.textContent === "Artists") {
                contextMenuArtist.classList.add("show")

                Object.assign(contextMenuArtist.style, {
                    position: "fixed",
                    top: `${y}px`,
                    left: `${x}px`,
                    zIndex: 1000,
                })
                const unfollowArtist = contextMenuArtist.querySelector(
                    ".menu-item.unfollow"
                )

                unfollowArtist.onclick = async (e) =>
                    await handleUnfollowSidebar(currentID, contextMenuArtist)
            }
        })
        // Click out side => hide context menu
        document.addEventListener("click", (e) => {
            if (
                !contextMenuMyPlaylist.contains(e.target) &&
                !contextMenuArtist.contains(e.target) &&
                !contextMenuMyFollowed.contains(e.target)
            ) {
                contextMenuArtist.classList.remove("show")
                contextMenuMyPlaylist.classList.remove("show")
                contextMenuMyFollowed.classList.remove("show")
                contextLikedPlaylists.classList.remove("show")
            }
        })
    } catch (error) {
        const codeError = error?.response?.error.code
        const mesError = error?.response?.error.message
        toast.error(codeError, mesError)
    }
}

async function handleUnfollowSidebar(currentArtistID, contextMenu) {
    let result = null
    try {
        if (isPlaylistsTab()) {
            result = await httpRequest.del(
                EndPoints.playlists.unfollow(currentArtistID)
            )
            switchTabs(true)
        } else {
            result = await httpRequest.del(
                EndPoints.artists.unfollow(currentArtistID)
            )
            switchTabs(false)
        }
        toast.success("Success", result.message)
    } catch (error) {
        const codeErr = error?.response?.error.code
        const messageErr = error?.response?.error.message
        toast.error(codeErr, messageErr)
    }
    contextMenu.classList.remove("show")
}

let isArtist = true

async function getLikedSongs() {
    const { playlists } = await httpRequest.get(EndPoints.playlists.me)
    console.log(playlists)

    const likedSongs = playlists.filter((item) => item.name)
    return likedSongs.id
}

export function addTracksToPlaylist(playlistID) {
    const addTracksBtn = document.querySelectorAll(".find-tracks .add-btn")
    if (!addTracksBtn) return

    addTracksBtn.forEach((addBtn) => {
        addBtn.onclick = (e) => {
            const trackID = e.target.closest(".song-item ").dataset.trackId
            renderUpdateTracks(trackID, playlistID)
        }
    })
}

export function renderDetailPlaylist() {
    libraryContent.onclick = async (e) => {
        const currentTab = document.querySelector(".nav-tab.active")
        currentTab.textContent === "Playlists"
            ? (isArtist = false)
            : (isArtist = true)
        const currentItem = e.target.closest(".library-item")
        if (!currentItem) return
        const currentPlaylistID = currentItem.dataset.playlistId

        if (currentPlaylistID) {
            try {
                if (!isArtist) {
                    const playlist = await httpRequest.get(
                        EndPoints.playlists.byId(currentPlaylistID)
                    )

                    updateDetailCreateUI(playlist)
                    showDetailCreate()
                    showEditPlaylist(playlist)
                    renderMySearchTracks(currentPlaylistID)
                    addTracksToPlaylist(currentPlaylistID)
                } else {
                    isArtist = true
                    const artist = await httpRequest.get(
                        EndPoints.artists.byId(currentPlaylistID)
                    )
                    await renderDetail(artist.id, true)
                    showDetailPlaylist()
                }
            } catch (error) {
                const codeError = error?.response?.error.code
                const mesError = error?.response?.error.message
                if (codeError && mesError) {
                    toast.error(codeError, mesError)
                }
            }
        }
    }
}

function showDetailCreate() {
    const detailCreate = document.querySelector(".detail-create")
    const playlistSection = document.querySelector(".playlists-section")
    const detailPlaylist = document.querySelector(".detail-playlist")
    const artistSection = document.querySelector(".artists-section")
    const modalCreate = document.querySelector(".modal-create-playlist")
    const iconCreate = document.querySelector(".create-btn .plus-icon")
    const hitsSection = document.querySelector(".hits-section")

    detailCreate.scrollTo({
        top: 0,
        behavior: "smooth",
    })
    detailCreate.classList.add("show")
    modalCreate.classList.remove("active")
    iconCreate.classList.remove("active")
    detailPlaylist.classList.remove("show")
    artistSection.style.display = "none"
    hitsSection.style.display = "none"
    playlistSection.style.display = "none"
}

async function updatePlaylist(playlistID, data) {
    const { playlist } = await httpRequest.put(
        EndPoints.playlists.update(playlistID),
        data
    )
    return playlist
}

export function showEditPlaylist(playlist) {
    let finalImage = null

    const detailCreate = document.querySelector(".detail-create")
    const nameInputElement = detailCreate.querySelector(".name")
    const cover = detailCreate.querySelector(".cover")
    const iconCover = cover.querySelector("i")
    const editInfoPlaylist = document.querySelector(".edit-info-playlist")

    // Element inside modal
    const playlistName =
        editInfoPlaylist.shadowRoot.querySelector("#playlist-name")
    const playlistDesc = editInfoPlaylist.shadowRoot.querySelector("#desc")
    const saveBtn = editInfoPlaylist.shadowRoot.querySelector(".save-btn")
    const imageUpload =
        editInfoPlaylist.shadowRoot.querySelector(".image-upload")
    const img = imageUpload.querySelector(".preview-image")
    const iconUploadImage = imageUpload.querySelector("i")

    const inputUpload =
        editInfoPlaylist.shadowRoot.querySelector(".input-upload")
    const closeIcon = editInfoPlaylist.shadowRoot.querySelector(".close-icon")

    const originalImgUrl = null

    nameInputElement.onclick = () => {
        editInfoPlaylist.className = "edit-info-playlist show"
        playlistName.value = nameInputElement.textContent.trim()
        playlistName.addEventListener("focus", (e) => e.target.select())
        playlistName.focus()

        img.src = playlist.image_url
    }

    cover.onclick = () => {
        editInfoPlaylist.classList.add("show")
        inputUpload.click()
        playlistName.value = nameInputElement.textContent.trim()
        playlistName.addEventListener("focus", (e) => e.target.select())
        playlistName.focus()
        img.src = playlist.image_url
    }

    imageUpload.onclick = (e) => {
        inputUpload.click()
        inputUpload.addEventListener("change", () => {
            finalImage = inputUpload.files[0] // File được chọn
        })
    }

    imageUpload.addEventListener("mouseover", (e) => {
        img.style.display = "none"
        iconUploadImage.classList.add("fa-pen")
    })
    imageUpload.addEventListener("mouseout", (e) => {
        iconUploadImage.classList.remove("fa-pen")
        img.style.display = "block"
    })

    inputUpload.addEventListener("change", () => {
        if (inputUpload.files.length > 0) {
            finalImage = inputUpload.files[0]

            // Xóa icon cũ nếu có
            imageUpload.innerHTML = ""

            // Thêm ảnh preview
            const imgPreview = document.createElement("img")
            imgPreview.className = "preview-image"
            imgPreview.src = URL.createObjectURL(finalImage)

            // Thêm overlay icon pen
            const iconOverlay = document.createElement("i")
            iconOverlay.className = "fa-solid fa-pen icon-upload"

            imageUpload.appendChild(imgPreview)
            imageUpload.appendChild(iconOverlay)

            // Thêm class để CSS hover icon pen
            imageUpload.classList.add("has-image")
        }
    })
    saveBtn.onclick = async (e) => {
        const textName = playlistName.value
        const currentImageCover = playlist.image_url

        // Get link img before upload
        let linkImg = null
        if (textName) {
            if (finalImage) {
                const file = await uploadImage(finalImage, playlist.id)
                linkImg = `https://spotify.f8team.dev${file.url}`
            }
        }
        const currentPlaylistID = playlist.id
        const name = textName
        const description = playlistDesc.value ?? ""
        const is_public = true
        const image_url = linkImg ?? currentImageCover

        const credentials = {
            name,
            description,
            is_public,
            image_url,
        }
        if (!name) return
        const updatedPlaylist = await updatePlaylist(
            currentPlaylistID,
            credentials
        )
        updateDetailCreateUI(updatedPlaylist)
        // showEditPlaylist(updatedPlaylist)

        await switchTabs(true)

        playlistName.value = ""
        editInfoPlaylist.classList.remove("show")
    }

    closeIcon.addEventListener("click", (e) => {
        const imgPreview =
            editInfoPlaylist.shadowRoot.querySelector(".preview-image")
        imgPreview.src = ""

        editInfoPlaylist.classList.remove("show")
        inputUpload.value = ""
        playlistName.value = ""
    })

    document.addEventListener("click", (e) => {
        if (
            !editInfoPlaylist.contains(e.target) &&
            !nameInputElement.contains(e.target) &&
            !cover.contains(e.target)
        ) {
            const imgPreview =
                editInfoPlaylist.shadowRoot.querySelector(".preview-image")
            imgPreview.src = ""
            editInfoPlaylist.classList.remove("show")
            inputUpload.value = ""
            playlistName.value = ""
        }
    })
}

async function uploadImage(fileImage, playlistID) {
    const formData = new FormData()
    formData.append("cover", fileImage, `${fileImage.name}`)
    const { file } = await httpRequest.post(
        `upload/playlist/${playlistID}/cover`,
        formData
    )
    return file
}

function updateDetailCreateUI(playlist) {
    const detailCreate = document.querySelector(".detail-create")
    detailCreate.classList.add("show")

    const cover = document.querySelector(".detail-create .cover")
    const nameEl = document.querySelector(".detail-create .name")
    const descEl = document.querySelector(".detail-create .desc")

    cover.innerHTML = `<img src="${playlist.image_url}">`
    nameEl.textContent = playlist.name
    descEl.textContent = playlist.description || ""

    renderMyTracks(playlist.id)

}

function handleCreate() {
    const createBtnContextMenu = document.querySelectorAll(".menu-item.create")
    const contextMenuMyPlaylist = document.querySelector(".context-my-playlist")

    createBtnContextMenu.forEach((item) => {
        item.onclick = async (e) => {
            const playlist = await createPlaylist()

            showDetailCreate()
            updateDetailCreateUI(playlist, false)
            isPlaylistsTab() ? switchTabs(true) : switchTabs(false)
            contextMenuMyPlaylist.classList.remove("show")
            showEditPlaylist(playlist)
            renderMySearchTracks(playlist)
        }
    })

    // modalCreate.onclick = async (e) => {
    //     const playlist = await createPlaylist()
    //     showDetailCreate()
    //     showEditPlaylist(playlist)
    // }
}
