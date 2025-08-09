import httpRequest from "../utils/httpRequest.js"

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
export async function renderSidebar() {
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
            beforeViewAsActive.classList.remove("active")

            updateViewAs(e.currentTarget, libraryContent)
        }
    })

    if (user) {
        const userID = JSON.parse(user).id

        const { playlists } = await httpRequest.get(
            "playlists?limit=50&offset=0"
        )
        const myPlaylists = playlists.filter(
            (playlist) => playlist.user_id === userID
        )

        renderMyPlayList(myPlaylists, libraryContent)

        const sortRecentAdded = [...myPlaylists].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at)
        })
        const sortAlphabetical = [...myPlaylists].sort((a, b) => {
            return a.name.localeCompare(b.name)
        })
        // const sortCreator = [...myPlaylists].sort((a, b) => {
        //     return a.user_username.localeCompare(b.user_username)
        // })
        // Cần xử lý dữ liệu khi là null hoặc undefined

        optionSort.forEach((option) => {
            option.addEventListener("click", (e) => {
                const beforeOptionActive =
                    dropDown.querySelector(".option.active")
                const currentActiveViewAs =
                    document.querySelector(".view-btn.active")

                beforeOptionActive.classList.remove("active")
                e.currentTarget.classList.add("active")

                const currentOptionText = e.currentTarget.textContent.trim()
                // sortBtn.outer = `Hehe <i class="fas fa-list"></i>`

                if (currentOptionText === "Recents") {
                    libraryContent.innerHTML = ``
                    renderMyPlayList(sortRecentAdded, libraryContent)
                    updateViewAs(currentActiveViewAs, libraryContent)

                    // Sắp xếp này chưa đúng, sau cần sửa lại
                } else if (currentOptionText === "Recently added") {
                    libraryContent.innerHTML = ``
                    renderMyPlayList(sortRecentAdded, libraryContent)
                    updateViewAs(currentActiveViewAs, libraryContent)
                } else if (currentOptionText === "Alphabetical") {
                    renderMyPlayList(sortAlphabetical, libraryContent)
                    updateViewAs(currentActiveViewAs, libraryContent)
                } else if (currentOptionText === "Creator") {
                    renderMyPlayList(sortAlphabetical, libraryContent)
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
function renderMyPlayList(myPlaylists, parentElement) {
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
    const html = myPlaylists
        .map(
            (playlist) => ` 
                <div class="library-item">
                    <img
                        src="${"https://picsum.photos/300"}"
                        alt="${playlist.name ?? "Không xác định"}"
                        class="item-image"
                    />
                    <div class="item-info">
                        <div class="item-title">${
                            playlist.name ?? "Không xác định"
                        }</div>
                        <div class="item-subtitle">${
                            playlist.user_username ?? "Không xác định"
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
