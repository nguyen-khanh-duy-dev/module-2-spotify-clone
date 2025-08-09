import httpRequest from "./utils/httpRequest.js"
import toast from "./utils/toast.js"
import { renderBiggestHits } from "./render/renderBiggestHits.js"
import { renderArtists } from "./render/renderArtists.js"
import { renderPlaylist } from "./render/renderPlaylist.js"
import { toolTipSidebar, layoutSelector, renderSidebar } from "./src/sidebar.js"

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
    const signupBtn = document.querySelector(".signup-btn")
    const loginBtn = document.querySelector(".login-btn")
    const authModal = document.getElementById("authModal")
    const modalClose = document.getElementById("modalClose")
    const signupForm = document.getElementById("signupForm")
    const loginForm = document.getElementById("loginForm")
    const showLoginBtn = document.getElementById("showLogin")
    const showSignupBtn = document.getElementById("showSignup")

    const logoutBtn = document.querySelector("#logoutBtn")

    const eyeIcon = authModal.querySelectorAll(".eye-icon")

    // Function to show signup form
    function showSignupForm() {
        signupForm.style.display = "block"
        loginForm.style.display = "none"
    }

    // Function to show login form
    function showLoginForm() {
        signupForm.style.display = "none"
        loginForm.style.display = "block"
    }

    // Function to open modal
    function openModal() {
        authModal.classList.add("show")
        document.body.style.overflow = "hidden" // Prevent background scrolling
    }

    // Check validate form sign up
    function validateSignup(message, error) {
        // get DOM element in signup form
        const textErrorEmail = signupForm.querySelector(".error-email")
        const textErrorPassword = signupForm.querySelector(".error-password")
        const validEmail = signupForm.querySelector(".error-email-mes")
        const validPassword = signupForm.querySelector(".error-pass-mes")

        if (message === "EMAIL_EXISTS") {
            // console.log(error.response.error.message)
            textErrorEmail.textContent = error.response.error.message
            validEmail.style.display = "block"
        } else {
            validEmail.style.display = "none"
        }

        if (message === "VALIDATION_ERROR") {
            textErrorPassword.textContent =
                error.response.error.details[0].message
            validPassword.style.display = "block"
        } else {
            validPassword.style.display = "none"
        }
    }

    // Check validate form log in
    function validateLogin(message, error) {
        const textErrorEmail = loginForm.querySelector(".error-email")
        const textErrorPassword = loginForm.querySelector(".error-password")
        const validEmail = loginForm.querySelector(".error-email-mes")
        const validPassword = loginForm.querySelector(".error-pass-mes")

        if (message === "INVALID_CREDENTIALS") {
            // console.log(error.response.error.message)
            textErrorEmail.textContent = error.response.error.message
            validEmail.style.display = "block"
        } else {
            validEmail.style.display = "none"
        }

        if (message === "VALIDATION_ERROR") {
            textErrorPassword.textContent =
                error.response.error.details[0].message
            validPassword.style.display = "block"
        } else {
            validPassword.style.display = "none"
        }
    }

    // Open modal with Sign Up form when clicking Sign Up button
    signupBtn.addEventListener("click", function () {
        showSignupForm()
        openModal()
    })

    // Open modal with Login form when clicking Login button
    loginBtn.addEventListener("click", function () {
        showLoginForm()
        openModal()
    })

    // Close modal function
    function closeModal() {
        authModal.classList.remove("show")
        document.body.style.overflow = "auto" // Restore scrolling
    }

    // Close modal when clicking close button
    modalClose.addEventListener("click", closeModal)

    // Close modal when clicking overlay (outside modal container)
    authModal.addEventListener("click", function (e) {
        if (e.target === authModal) {
            closeModal()
        }
    })

    // Close modal with Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && authModal.classList.contains("show")) {
            closeModal()
        }
    })

    // Switch to Login form
    showLoginBtn.addEventListener("click", function () {
        showLoginForm()
    })

    // Switch to Signup form
    showSignupBtn.addEventListener("click", function () {
        showSignupForm()
    })

    let isShowPassword = false

    eyeIcon.forEach((icon) => {
        icon.onclick = (e) => {
            const inputPassword = e.target
                .closest(".form-group")
                .querySelector(".form-input")
            console.log(inputPassword)
            if (e.target.classList.contains("fa-eye")) {
                icon.classList.remove("fa-eye")
                icon.classList.add("fa-eye-slash")
                // Logic show password here
                isShowPassword = false
            } else {
                isShowPassword = true
                icon.classList.remove("fa-eye-slash")
                icon.classList.add("fa-eye")
            }

            isShowPassword
                ? (inputPassword.type = "text")
                : (inputPassword.type = "password")
        }
    })

    // submit signup form
    signupForm
        .querySelector(".auth-form-content")
        .addEventListener("submit", async (e) => {
            e.preventDefault()
            const email = signupForm.querySelector("#signupEmail").value
            const password = signupForm.querySelector("#signupPassword").value
            const credentials = {
                email,
                password,
            }

            try {
                const { user, access_token } = await httpRequest.post(
                    "auth/register",
                    credentials
                )

                localStorage.setItem("access-token", access_token)
                localStorage.setItem("user", JSON.stringify(user))
                updateCurrentUser(user)
                closeModal()
                toast.success(
                    "Success",
                    `Created ${user.username.split("@")[0]}`
                )
                window.location.href = "./index.html"
                await renderSidebar()
            } catch (error) {
                const messageError = error?.response?.error.code

                // console.dir(error)
                validateSignup(messageError, error)
            }
        })

    // submit log in form
    loginForm
        .querySelector(".auth-form-content")
        .addEventListener("submit", async (e) => {
            e.preventDefault()
            const email = loginForm.querySelector("#loginEmail").value
            const password = loginForm.querySelector("#loginPassword").value
            const formGroup = loginForm.querySelectorAll(".form-group")

            const credentials = {
                email,
                password,
            }

            try {
                const { user, access_token } = await httpRequest.post(
                    "auth/login",
                    credentials
                )
                localStorage.setItem("access-token", access_token)
                localStorage.setItem("user", JSON.stringify(user))

                window.location.href = "./index.html"
                await renderSidebar()
                updateCurrentUser(user)
                closeModal()
                toast.success(
                    "Success",
                    `Created ${user.username.split("@")[0]}`
                )
            } catch (error) {
                const messageError = error?.response?.error.code

                // console.dir(error)
                validateLogin(messageError, error)
            }
        })

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            localStorage.removeItem("access-token")
            localStorage.removeItem("user")

            const headerAction = document.querySelector(".header-actions")
            const authButtons = headerAction.querySelector(".auth-buttons")
            const userMenu = headerAction.querySelector(".user-menu")

            userMenu.style.display = "none"
            authButtons.style.display = "flex"
            window.location.href = "./index.html"
            await renderSidebar()
        })
    }
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
    const playControl = document.querySelector(".player")
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
    const searchBtn = document.querySelector(".search-library-btn")
    const searchInput = document.querySelector("#search-library-input")
    const sortBtn = document.querySelector(".sort-btn")

    searchBtn.addEventListener("click", (e) => {
        e.preventDefault()
        searchBtn.style.display = "none"
        searchInput.classList.add("show")
        searchInput.focus()
        sortBtn.innerHTML = '<i class="fas fa-list"></i>'
    })

    document.addEventListener("click", (e) => {
        const optionActive = document.querySelector(".option.active")

        if (!searchInput.contains(e.target) && !searchBtn.contains(e.target)) {
            searchInput.classList.remove("show")
            searchBtn.style.display = "block"

            sortBtn.innerHTML = `${optionActive.innerText} <i class="fas fa-list"></i>`
        }
    })

    toolTipSidebar()
    layoutSelector()
    await renderSidebar()
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

    await renderBiggestHits()
    await renderArtists()

    let isArtist = false

    detailArtistPlaylist(isArtist)
    detailBiggestHitsPlaylist(isArtist)
})

// Function to show detail Play list of Artist
function detailArtistPlaylist(isArtist) {
    const artistCards = document.querySelectorAll(".artist-card")
    isArtist = true
    artistCards.forEach((card) => {
        card.onclick = async (e) => {
            const artistId = e.currentTarget.dataset.artistId
            if (artistId) {
                const artistHero = document.querySelector(".artist-hero")
                const playlistSection =
                    document.querySelector(".popular-section")
                await renderPlaylist(
                    artistId,
                    artistHero,
                    playlistSection,
                    isArtist
                )
            }
            showDetailPlaylist()
        }
    })
}
// Function to show detail Play list of Biggest Hit

function detailBiggestHitsPlaylist(isArtist) {
    const biggestHitsCards = document.querySelectorAll(".hit-card")
    isArtist = false
    biggestHitsCards.forEach((card) => {
        card.onclick = async (e) => {
            const hitID = e.currentTarget.dataset.hitId
            if (hitID) {
                const artistHero = document.querySelector(".artist-hero")
                const playlistSection =
                    document.querySelector(".popular-section")
                await renderPlaylist(
                    hitID,
                    artistHero,
                    playlistSection,
                    isArtist
                )
            }
            showDetailPlaylist()
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
    const logoButton = document.querySelector(".logo")

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

// CHưa sử dụng
async function getTracks() {
    try {
        const { tracks } = await httpRequest.get("tracks")
        return tracks
    } catch (error) {
        console.log(error)
    }
}

function showDetailPlaylist() {
    const detailPlaylist = document.querySelector(".detail-playlist")
    const hitSection = document.querySelector(".hits-section")
    const artistSection = document.querySelector(".artists-section")

    detailPlaylist.scrollTo({
        top: 0,
        behavior: "smooth",
    })
    detailPlaylist.classList.add("show")
    hitSection.style.display = "none"
    artistSection.style.display = "none"
}
