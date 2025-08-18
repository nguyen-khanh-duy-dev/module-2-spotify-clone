import { validateLogin } from "./authValidation.js"
import { validateSignup } from "./authValidation.js"
import httpRequest from "../api/httpRequest.js"
import EndPoints from "../api/endpoints.js"

export function handleAuth() {
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
                    EndPoints.auth.register,
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
            // const formGroup = loginForm.querySelectorAll(".form-group")

            const credentials = {
                email,
                password,
            }
            console.log("haha")

            try {
                console.log("haha")

                const { user, access_token } = await httpRequest.post(
                    EndPoints.auth.login,
                    credentials
                )
                console.log(user)
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
}
