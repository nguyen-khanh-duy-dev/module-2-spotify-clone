import EndPoints from "../api/endpoints.js"
import { renderSidebar } from "../render/sidebarSection.js"
import { convertTime } from "../utils/convertTime.js"
import httpRequest from "../api/httpRequest.js"
import toast from "../utils/toast.js"
import { renderDetail } from "../render/detailSection.js"

const libraryContent = document.querySelector(".library-content")

// import { renderMySearchTracks } from "../main.js"
// import { renderPlaylist } from "../render/renderPlaylist.js" => Done -> Render Detail
// import { showDetailPlaylist } from "../main.js"
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
    console.log(sortBtn)

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
                // sidebar.classList.remove("noscroll")
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

async function switchTabs(inputValue = "") {
    let finalList = null
    let isPlaylistTab = null
    const searchInput = document.querySelector("#search-library-input")
    const navTabs = document.querySelectorAll(".nav-tab")

    const playlists = await getDataPlaylists()
    const artists = await getDataArtists()

    renderSidebar(playlists, true)

    navTabs.forEach((tab) => {
        tab.onclick = async (e) => {
            // Luôn update class active cho tab
            const beforeActive = document.querySelector(".nav-tab.active")
            if (beforeActive) beforeActive.classList.remove("active")
            e.target.classList.add("active")

            const keyword = searchInput.value.trim().toLowerCase()

            if (keyword) {
                // Nếu có keyword thì filter nhưng vẫn theo tab đang chọn
                if (e.target.textContent.trim() === "Playlists") {
                    await filterData(keyword, playlists) // lọc trong playlists
                } else {
                    await filterData(keyword, artists) // lọc trong artists
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

function isPlaylistsTab() {
    const currentTab = document.querySelector(".nav-tab.active")
    if (currentTab.innerText === "Playlists") {
        return true
    } else if (currentTab.innerText === "Artists") {
        return false
    }
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
    // const optionSort = dropDown.querySelectorAll(".option")

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
export async function handleSidebar(inputValue = "") {
    const user = localStorage.getItem("user")
    const viewAs = document.querySelectorAll(".view-btn")
    layoutSelector()
    switchTabs()
    handleSort()
    toggleCreateModal()
    searchPlaylist()

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
        // sidebar.classList.add("noscroll")

        // close modal when click outside
        document.addEventListener("click", (e) => {
            if (
                !createBtn.contains(e.target) &&
                !createModal.contains(e.target)
            ) {
                plusIcon.classList.remove("active")
                createModal.classList.remove("active")
                // sidebar.classList.remove("noscroll")
            }
        })
    }
}
// Nếu đặt trong hàm filterPlaylists thì mỗi lần gọi hàm đó sẽ là true
// Lưu ý điểm này

// export async function filterPlaylists(inputValue = "") {
//     const navTabs = document.querySelectorAll(".nav-tab")
//     await handleSidebar(isMyPlayLists, inputValue)

//     navTabs.forEach((tab) => {
//         tab.onclick = async (e) => {
//             const beforeActive = document.querySelector(".nav-tab.active")
//             beforeActive.classList.remove("active")
//             e.target.classList.add("active")
//             if (e.target.textContent === "Playlists") {
//                 isMyPlayLists = true
//             } else {
//                 isMyPlayLists = false
//             }

//             await handleSidebar(isMyPlayLists, inputValue)
//         }
//     })
// }
// Done

async function filterData(keyword) {
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

    renderSidebar(finalData, isPlaylistsTab())
    // updateViewAs()
}

export function searchPlaylist() {
    const searchBtn = document.querySelector(".search-library-btn")
    const searchInput = document.querySelector("#search-library-input")
    const sortBtn = document.querySelector(".sort-btn")

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

export async function showContextMenu() {
    const contextMenuPlaylist = document.querySelector(".context-my-playlist")
    const contextLikedPlaylists = document.querySelector(".liked-playlists")
    const contextMenuMyFollowed = document.querySelector(".context-my-followed")
    const contextMenuArtist = document.querySelector(".context-artist")
    const modalApp = document.querySelector(".modal-app")
    const btnModal = modalApp.shadowRoot.querySelectorAll(".btn")

    const likedPlaylist = document
        .querySelector(".liked-songs")
        .closest(".library-item")
        .querySelector(".item-title")

    try {
        const { playlists: myPlaylists } = await httpRequest.get("me/playlists")

        libraryContent.addEventListener("contextmenu", (e) => {
            e.preventDefault()
            const currentElement = e.target.closest(".library-item")
            if (!currentElement) return
            const currentID = currentElement.dataset.playlistId

            const isMyPlaylist = myPlaylists.some(
                (playlist) => playlist.id === currentID
            )

            const x = e.clientX
            const y = e.clientY
            const currentActiveTab = document.querySelector(".nav-tab.active")

            if (currentActiveTab.textContent === "Playlists") {
                // Nếu là myplaylist => Có thể edit và xóa
                if (isMyPlaylist) {
                    contextMenuPlaylist.classList.add("show")
                    Object.assign(contextMenuPlaylist.style, {
                        position: "fixed",
                        top: `${y}px`,
                        left: `${x}px`,
                        zIndex: 1000,
                    })
                    contextMenuMyFollowed.classList.remove("show")
                    contextLikedPlaylists.classList.remove("show")

                    const deleteEl = document.querySelector(".menu-item.delete")
                    const editBtn = document.querySelector(".menu-item.edit")
                    const createBtn =
                        document.querySelector(".menu-item.create")
                    deleteEl.onclick = () => {
                        const overlay = document.createElement("div")
                        overlay.className = "overlay show"
                        document.body.appendChild(overlay)
                        contextMenuPlaylist.classList.remove("show")
                        modalApp.classList.add("show")
                        btnModal.forEach((btn) => {
                            btn.onclick = (e) => {
                                if (e.target.classList.contains("cancel-btn")) {
                                    modalApp.classList.remove("show")
                                    overlay.className = ""
                                } else {
                                    deleteMyPlaylist(
                                        currentID,
                                        contextMenuPlaylist
                                    )
                                    modalApp.classList.remove("show")
                                    overlay.className = ""
                                }
                            }
                        })
                        document.addEventListener("click", (e) => {
                            if (
                                !modalApp.contains(e.target) &&
                                !contextMenuPlaylist.contains(e.target)
                            ) {
                                modalApp.classList.remove("show")
                                overlay.className = ""
                            }
                        })
                    }

                    editBtn.onclick = async (e) => {
                        const currentPlaylist = await httpRequest.get(
                            `playlists/${currentID}`
                        )
                        showDetailCreate()
                        updateDetailCreateUI(currentPlaylist, true)
                        showEditPlaylist(currentPlaylist)

                        handleSidebar(true)
                        contextMenuPlaylist.classList.remove("show")
                    }

                    createBtn.onclick = async (e) => {
                        const credentials = {
                            name: "My Playlist",
                            description: "Playlist description",
                            is_public: true,
                            image_url:
                                "https://mynoota.com/_next/image?url=%2F_static%2Fimages%2F__default.png&w=640&q=75",
                        }

                        const { playlist } = await httpRequest.post(
                            "playlists",
                            credentials
                        )
                        showDetailCreate()
                        updateDetailCreateUI(playlist, false)
                        contextMenuPlaylist.classList.remove("show")
                    }
                } else if (likedPlaylist.innerText === "Liked Songs") {
                    contextLikedPlaylists.classList.add("show")
                    Object.assign(contextLikedPlaylists.style, {
                        position: "fixed",
                        top: `${y}px`,
                        left: `${x}px`,
                        zIndex: 1000,
                    })

                    contextMenuMyFollowed.classList.remove("show")
                    contextMenuPlaylist.classList.remove("show")
                } else {
                    contextMenuMyFollowed.classList.add("show")

                    Object.assign(contextMenuMyFollowed.style, {
                        position: "fixed",
                        top: `${y}px`,
                        left: `${x}px`,
                        zIndex: 1000,
                    })
                    contextLikedPlaylists.classList.remove("show")
                    contextMenuPlaylist.classList.remove("show")
                }
            } else if (currentActiveTab.textContent === "Artists") {
                contextMenuArtist.classList.add("show")

                Object.assign(contextMenuArtist.style, {
                    position: "fixed",
                    top: `${y}px`,
                    left: `${x}px`,
                    zIndex: 1000,
                })
                contextMenuArtist.addEventListener(
                    "click",
                    async (e) =>
                        await handleUnfollowSidebar(
                            currentID,
                            contextMenuArtist
                        )
                )
                handleSidebar(false)
            }
        })
        // Click out side => hide context menu
        document.addEventListener("click", (e) => {
            if (
                !contextMenuPlaylist.contains(e.target) &&
                !contextMenuArtist.contains(e.target) &&
                !contextMenuMyFollowed.contains(e.target)
            ) {
                contextMenuArtist.classList.remove("show")
                contextMenuPlaylist.classList.remove("show")
                contextMenuMyFollowed.classList.remove("show")
                contextLikedPlaylists.classList.remove("show")
            }
        })
    } catch (error) {
        console.log(error)
    }
}

async function handleUnfollowSidebar(currentArtistID, contextMenu) {
    try {
        const result = await httpRequest.del(
            `artists/${currentArtistID}/follow`
        )
        toast.success("Thành công", result.message)
    } catch (error) {
        const codeErr = error?.response?.error.code
        const messageErr = error?.response?.error.message
        toast.error(codeErr, messageErr)
    }
    contextMenu.classList.remove("show")
}

let isArtist = true

export function renderDetailPlaylist() {
    const detailCreate = document.querySelector(".detail-create")

    libraryContent.addEventListener("click", async (e) => {
        hasUpdated = true
        const currentTab = document.querySelector(".nav-tab.active")
        currentTab.textContent === "Playlists"
            ? (isArtist = false)
            : (isArtist = true)
        const currentItem = e.target.closest(".library-item")
        if (!currentItem) return
        const currentPlaylistID = currentItem.dataset.playlistId
        console.log(currentPlaylistID)

        if (currentPlaylistID) {
            try {
                if (!isArtist) {
                    const playlist = await httpRequest.get(
                        `playlists/${currentPlaylistID}`
                    )
                    updateDetailCreateUI(playlist, hasUpdated)
                    showDetailCreate()
                    showEditPlaylist(playlist)
                    renderMySearchTracks(currentPlaylistID)
                    console.log("hihi")
                } else {
                    isArtist = true
                    const artist = await httpRequest.get(
                        `artists/${currentPlaylistID}`
                    )
                    await renderDetail(artist.id, true)
                    showDetailPlaylist()
                    console.log("hah")
                }
            } catch (error) {
                const codeError = error?.response?.error.code
                const mesError = error?.response?.error.message
                console.log(codeError, mesError)
            }
        }
    })
}

export function createNewPlaylist() {
    const menuItems = document.querySelectorAll(".menu-item")
    const credentials = {
        name: "My Playlist",
        description: "Playlist description",
        is_public: true,
        image_url:
            "https://mynoota.com/_next/image?url=%2F_static%2Fimages%2F__default.png&w=640&q=75",
    }
    menuItems.forEach((item) => {
        item.onclick = async (e) => {
            hasUpdated = false

            const isCreatePlaylist =
                e.currentTarget.dataset.type === "create-playlist"
            if (isCreatePlaylist) {
                const { playlist } = await httpRequest.post(
                    "playlists",
                    credentials
                )
                updateDetailCreateUI(playlist, hasUpdated)
                showDetailCreate()
                handleSidebar()
                showEditPlaylist(playlist)
            }
        }
    })
}

function showDetailCreate() {
    const detailCreate = document.querySelector(".detail-create")
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
}

export function showEditPlaylist(playlist) {
    let finalImage = null
    let finalName = null
    let finalDesc = null

    const detailCreate = document.querySelector(".detail-create")
    const nameInputElement = detailCreate.querySelector(".name")
    const cover = detailCreate.querySelector(".cover")
    const iconCover = cover.querySelector("i")
    const editInfoPlaylist = document.querySelector(".edit-info-playlist")

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

    nameInputElement.onclick = () => {
        editInfoPlaylist.className = "edit-info-playlist show"
        playlistName.value = nameInputElement.textContent.trim()
        playlistName.addEventListener("focus", (e) => e.target.select())
        playlistName.focus()

        img.src = playlist.image_url
    }

    cover.onclick = (e) => {
        editInfoPlaylist.classList.add("show")
        inputUpload.click()
        playlistName.value = nameInputElement.textContent.trim()
        playlistName.addEventListener("focus", (e) => e.target.select())
        playlistName.focus()
    }

    imageUpload.onclick = (e) => {
        inputUpload.click()
        inputUpload.addEventListener("change", () => {
            finalImage = inputUpload.files[0] // File được chọn
        })
    }

    if (iconCover) {
        iconCover.addEventListener("mouseover", (e) => {
            iconCover.className = "fa-solid fa-pen"
        })

        iconCover.addEventListener("mouseout", (e) => {
            iconCover.className = "fas fa-music"
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
    saveBtn.addEventListener("click", async (e) => {
        hasUpdated = true
        const textName = playlistName.value
        finalName = textName
        finalDesc = playlistDesc.value
        playlistName.value = ""
        editInfoPlaylist.classList.remove("show")
        let linkImg = null
        if (finalName) {
            if (finalImage) {
                const file = await uploadImage(finalImage, playlist.id)
                linkImg = `https://spotify.f8team.dev${file.url}`
            }
        }
        const currentPlaylistID = playlist.id

        const currentImageCover = playlist.image_url
        const name = finalName
        const description = finalDesc
        const is_public = true
        const image_url = linkImg ?? currentImageCover

        const credentials = {
            name,
            description,
            is_public,
            image_url,
        }
        if (!name) return

        try {
            const { playlist } = await httpRequest.put(
                `playlists/${currentPlaylistID}`,
                credentials
            )
            updateDetailCreateUI(playlist)
            showEditPlaylist(playlist)

            handleSidebar()
            showEditPlaylist(playlist)
            showContextMenu()
        } catch (error) {
            console.log(error)
        }
    })

    closeIcon.addEventListener("click", (e) => {
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
function updateDetailCreateUI(playlist, hasUpdated) {
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

async function renderMyTracks(playlistID) {
    const myTrackSection = document.querySelector(".my-tracks")
    const { tracks } = await httpRequest.get(`playlists/${playlistID}/tracks`)

    if (!tracks) return

    const headerHtml = `<div class="tracks-header">
                            <div class="col number">#</div>
                            <div class="col title">Title</div>
                            <div class="col artist">Artist</div>
                            <div class="col duration">⏱</div>
                        </div>`
    myTrackSection.innerHTML = headerHtml

    let trackItemHtml = tracks
        .map(
            (track, index) =>
                `<div class="track-item" data-track-id="${track.id}">
            <div class="col number">
                <span class="track-index">${index}</span>
                <span class="track-play">▶</span>
            </div>
            <div class="col title">
                ${track.track_title}
            </div>
            <div class="col artist">${track.artist_name}</div>
            <div class="col duration">${convertTime(track.track_duration)}</div>
        </div>`
        )
        .join("")

    myTrackSection.insertAdjacentHTML("beforeend", trackItemHtml)
}

async function deleteMyPlaylist(myPlaylistID, currentContextMenu) {
    try {
        const message = await httpRequest.del(`playlists/${myPlaylistID}`)
        console.log(message)
        isMyPlayLists = true
        toast.success("Delete Success", `${message.message}`)
        handleSidebar(isMyPlayLists)
    } catch (error) {
        const codeError = error?.response?.error.code
        const mesError = error?.response?.error.message
        toast.error(codeError, mesError)
    }
    currentContextMenu.classList.remove("show")
}
