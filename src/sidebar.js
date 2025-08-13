import httpRequest from "../utils/httpRequest.js"
import { renderPlaylist } from "../render/renderPlaylist.js"
import { showDetailPlaylist } from "../main.js"
import { renderDetailCreate } from "../render/render-detail-create.js"

const searchBtn = document.querySelector(".search-library-btn")
const searchInput = document.querySelector("#search-library-input")
const sortBtn = document.querySelector(".sort-btn")

// Function to show tool-tip at sidebar => Xử lý trường hợp có thanh cuộn làm ẩn tool-tip
//  => Tách riêng tool tip ở đây xuống cuối file html
export function toolTipSidebar() {
    const toolTip = document.querySelector(".tool-tip-sidebar")
    const createBtn = document.querySelector(".create-btn")

    createBtn.addEventListener("mouseover", (e) => {
        const x = e.currentTarget.offsetLeft
        const y = e.currentTarget.offsetTop

        toolTip.style.left = `${x - 20}px`
        toolTip.style.top = `${y - 20}px`
        toolTip.style.display = "block"
        // toolTip.setAttribute("position", "absolute")
    })
    createBtn.addEventListener("mouseout", (e) => {
        const x = e.currentTarget.offsetLeft
        const y = e.currentTarget.offsetTop

        toolTip.style.display = "none"
        // toolTip.setAttribute("position", "absolute")
    })
}

// Function to show modal selector at sidebar
export function layoutSelector() {
    const sortBtn = document.querySelector(".sort-btn")
    const dropDown = document.querySelector(".dropdown")
    sortBtn.onclick = (e) => {
        const x = e.currentTarget.offsetLeft
        const y = e.currentTarget.offsetTop

        const currentDisplay = getComputedStyle(dropDown).display

        if (currentDisplay === "none") {
            dropDown.style.display = "block"
            dropDown.style.left = `${x - 100}px`
            dropDown.style.top = `${y + 30}px`
        } else {
            dropDown.style.display = "none"
        }
    }

    document.addEventListener("click", (e) => {
        // Nếu click ra ngoài input => ẩn
        if (!sortBtn.contains(e.target) && !dropDown.contains(e.target)) {
            dropDown.style.display = "none"
        }
    })
}

// Render sidebar
export async function renderSidebar(isMyPlaylist = true, valueInput = "") {
    const user = localStorage.getItem("user")
    const libraryContent = document.querySelector(".library-content")
    const dropDown = document.querySelector(".dropdown")
    const optionSort = dropDown.querySelectorAll(".option")
    const viewAs = document.querySelectorAll(".view-btn")

    viewAs.forEach((view) => {
        view.onclick = (e) => {
            const beforeViewAsActive =
                document.querySelector(".view-btn.active")
            e.currentTarget.classList.add("active")
            if (beforeViewAsActive === e.currentTarget) return

            beforeViewAsActive.classList.remove("active")

            updateViewAs(e.currentTarget, libraryContent)
        }
    })

    // Data of my playlist: my playlist + my followed
    if (user) {
        const followArtist = await httpRequest.put(
            "artists/550e8400-e29b-41d4-a716-446655440001/follow"
        )

        const list = await httpRequest.get(
            "me/playlists/followed?limit=20&offset=0"
        )

        let oriPlaylists = null
        if (isMyPlaylist) {
            const { playlists: myPlaylists } = await httpRequest.get(
                "me/playlists"
            )
            const { playlists: myFollowedPlaylist } = await httpRequest.get(
                "me/playlists/followed"
            )

            const allMyPlaylists = [...myPlaylists, ...myFollowedPlaylist]

            valueInput
                ? (oriPlaylists = allMyPlaylists.filter((playlist) => {
                      return playlist.name.toLowerCase().includes(valueInput)
                  }))
                : (oriPlaylists = allMyPlaylists)
        } else {
            const { artists } = await httpRequest.get("artists")
            valueInput
                ? (oriPlaylists = artists.filter((artist) => {
                      return artist.name.toLowerCase().includes(valueInput)
                  }))
                : (oriPlaylists = artists)
        }

        renderMyPlayList(oriPlaylists, libraryContent, isMyPlaylist)

        const sortRecentAdded = [...oriPlaylists].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at)
        })
        const sortAlphabetical = [...oriPlaylists].sort((a, b) => {
            return a.name.localeCompare(b.name)
        })
        const sortCreator = [...oriPlaylists].sort((a, b) => {
            return a.name.localeCompare(b.name)
        })
        // Cần xử lý dữ liệu khi là null hoặc undefined

        optionSort.forEach((option) => {
            option.addEventListener("click", (e) => {
                const beforeOptionActive =
                    dropDown.querySelector(".option.active")
                const currentActiveViewAs =
                    document.querySelector(".view-btn.active")

                if (beforeOptionActive === e.currentTarget) return
                beforeOptionActive.classList.remove("active")
                e.currentTarget.classList.add("active")

                const currentOptionText = e.currentTarget.textContent.trim()
                // sortBtn.outer = `Hehe <i class="fas fa-list"></i>`

                if (currentOptionText === "Recents") {
                    libraryContent.innerHTML = ``
                    renderMyPlayList(
                        sortRecentAdded,
                        libraryContent,
                        isMyPlaylist
                    )
                    updateViewAs(currentActiveViewAs, libraryContent)

                    // Sắp xếp này chưa đúng, sau cần sửa lại
                } else if (currentOptionText === "Recently added") {
                    libraryContent.innerHTML = ``
                    renderMyPlayList(
                        sortRecentAdded,
                        libraryContent,
                        isMyPlaylist
                    )
                    updateViewAs(currentActiveViewAs, libraryContent)
                } else if (currentOptionText === "Alphabetical") {
                    renderMyPlayList(
                        sortAlphabetical,
                        libraryContent,
                        isMyPlaylist
                    )
                    updateViewAs(currentActiveViewAs, libraryContent)
                } else if (currentOptionText === "Creator") {
                    renderMyPlayList(sortCreator, libraryContent, isMyPlaylist)
                    updateViewAs(currentActiveViewAs, libraryContent)
                    // Sắp xếp này chưa đúng, sau cần sửa lại
                }
            })
        })
    } else {
        libraryContent.style.display = "none"
    }
}

// Function to render my play list at sidebar
function renderMyPlayList(playLists, parentElement, isMyPlaylists = true) {
    parentElement.textContent = ""
    if (isMyPlaylists) {
        parentElement.innerHTML = `<div class="library-item active">
                            <div class="item-icon liked-songs">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="item-info">
                                <div class="item-title">Liked Songs</div>
                                <div class="item-subtitle">
                                    <i class="fas fa-thumbtack"></i>
                                    Playlist • 3 songs
                                </div>
                            </div>
                        </div>`
    }
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
                            isMyPlaylists
                                ? playlist.user_display_name ?? "Không xác định"
                                : "Artist"
                        }</div>
                    </div>
                </div>`
        )
        .join("")
    parentElement.insertAdjacentHTML("beforeend", html)
}

// Function to update view as sidebar => using add class at layout css
function updateViewAs(currentActiveViewAs, libraryContent) {
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

// JS for create Btn

export function createPlaylist() {
    const createBtn = document.querySelector(".create-btn")
    const plusIcon = createBtn.querySelector("i")
    const createModal = document.querySelector(".modal-create-playlist")

    const x = createBtn.offsetTop
    const y = createBtn.offsetLeft

    createBtn.onclick = (e) => {
        plusIcon.classList.toggle("active")
        createModal.classList.toggle("active")
    }

    // close modal when click outside
    document.addEventListener("click", (e) => {
        if (!createBtn.contains(e.target) && !createModal.contains(e.target)) {
            plusIcon.classList.remove("active")
            createModal.classList.remove("active")
        }
    })
}
// Nếu đặt trong hàm filterPlaylists thì mỗi lần gọi hàm đó sẽ là true
// Lưu ý điểm này
let isMyPlayLists = true

export async function filterPlaylists(valueInput = "") {
    const navTabs = document.querySelectorAll(".nav-tab")
    await renderSidebar(isMyPlayLists, valueInput)

    navTabs.forEach((tab) => {
        tab.onclick = async (e) => {
            const beforeActive = document.querySelector(".nav-tab.active")
            beforeActive.classList.remove("active")
            e.target.classList.add("active")
            if (e.target.textContent === "Playlists") {
                isMyPlayLists = true
            } else {
                isMyPlayLists = false
            }

            await renderSidebar(isMyPlayLists, valueInput)
        }
    })
}

export function searchPlaylist() {
    searchBtn.addEventListener("click", (e) => {
        e.preventDefault()

        const viewAsActive = document
            .querySelector(".view-btn.active")
            .querySelector("i").className

        searchBtn.style.display = "none"
        searchInput.classList.add("show")
        searchInput.focus()
        sortBtn.innerHTML = `<i class="${viewAsActive}"></i>`
        searchInput.addEventListener("input", async (e) => {
            const value = e.target.value.toLowerCase()

            await filterPlaylists(value)
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
            hideSearch()
            await filterPlaylists("")
        } else if (navTab.contains(e.target)) {
            // Giữ nguyên nếu có giá trị
            searchBtn.style.display = "none"
            searchInput.classList.add("show")
            await filterPlaylists(searchInput.value.toLowerCase())
        }
    })
}

function hideSearch() {
    const optionActive = document.querySelector(".option.active")
    const viewAsActive = document
        .querySelector(".view-btn.active")
        .querySelector("i").className

    searchInput.classList.remove("show")
    searchBtn.style.display = "block"
    searchInput.value = ""
    sortBtn.innerHTML = `${optionActive.innerText} <i class="${viewAsActive}"></i>`
}

export async function showContextMenu() {
    const libraryContent = document.querySelector(".library-content")
    const contextMenuPlaylist = document.querySelector(".context-my-playlist")
    const contextLikedPlaylists = document.querySelector(".liked-playlists")
    const contextMenuMyFollowed = document.querySelector(".context-my-followed")
    const contextMenuArtist = document.querySelector(".context-artist")
    const likedPlaylist = document
        .querySelector(".liked-songs")
        .closest(".library-item")
        .querySelector(".item-title")

    try {
        const { playlists: myPlaylists } = await httpRequest.get("me/playlists")
        const { playlists: myFollowedPlaylist } = await httpRequest.get(
            "me/playlists/followed"
        )

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

let isArtist = true

export function renderDetailPlaylist() {
    const libraryContent = document.querySelector(".library-content")
    libraryContent.addEventListener("click", (e) => {
        const currentTab = document.querySelector(".nav-tab.active")
        currentTab.textContent === "Playlists"
            ? (isArtist = false)
            : (isArtist = true)
        const currentPlaylistID =
            e.target.closest(".library-item").dataset.playlistId

        if (currentPlaylistID) {
            renderPlaylist(currentPlaylistID, isArtist)
            showDetailPlaylist()
        }
    })
}

export function createNewPlaylist() {
    const menuItems = document.querySelectorAll(".menu-item")
    const detailCreate = document.querySelector(".detail-create")
    const credentials = {
        name: "My Playlist",
        description: "Playlist description",
        is_public: true,
        image_url: "https://example.com/playlist-cover.jpg",
    }
    menuItems.forEach((item) => {
        item.onclick = async (e) => {
            const isCreatePlaylist =
                e.currentTarget.dataset.type === "create-playlist"
            if (isCreatePlaylist) {
                const { playlist } = await httpRequest.post(
                    "playlists",
                    credentials
                )
                const playlistID = playlist.id
                const html = renderDetailCreate(playlist)
                detailCreate.innerHTML = html
                showDetailCreate()
                renderSidebar()

                showEditPlaylist()
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
    console.log(iconCreate)

    detailCreate.scrollTo({
        top: 0,
        behavior: "smooth",
    })
    detailCreate.classList.add("show")
    modalCreate.classList.remove("active")
    iconCreate.classList.remove("active")
    detailPlaylist.classList.remove("show")
}

export function showEditPlaylist() {
    let fileImage = null
    const detailCreate = document.querySelector(".detail-create")
    const name = detailCreate.querySelector(".name")
    const cover = detailCreate.querySelector(".cover")
    const editInfoPlaylist = document.querySelector(".edit-info-playlist")
    const playlistName =
        editInfoPlaylist.shadowRoot.querySelector("#playlist-name")
    const saveBtn = editInfoPlaylist.shadowRoot.querySelector(".save-btn")
    const imageUpload =
        editInfoPlaylist.shadowRoot.querySelector(".image-upload")
    const inputUpload =
        editInfoPlaylist.shadowRoot.querySelector(".input-upload")

    name.onclick = (e) => {
        editInfoPlaylist.classList.add("show")
        playlistName.addEventListener("focus", (e) => e.target.select())
    }

    cover.onclick = (e) => {
        editInfoPlaylist.classList.add("show")
        inputUpload.click()
        inputUpload.addEventListener("change", () => {
            fileImage = inputUpload.files[0] // File được chọn
        })
    }

    imageUpload.onclick = (e) => {
        inputUpload.click()
        inputUpload.addEventListener("change", () => {
            fileImage = inputUpload.files[0] // File được chọn
        })
    }

    cover.addEventListener("mouseover", (e) => {})

    cover.addEventListener("mouseout", (e) => {})

    saveBtn.addEventListener("click", (e) => {
        const textName = playlistName.value
        console.log(fileImage, textName)
    })
}
