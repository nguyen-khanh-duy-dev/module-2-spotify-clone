class Toast {
    constructor(toastContainerSelector = "#toast") {
        this.toastContainer = document.querySelector(toastContainerSelector)
    }

    show({ title = "", message = "", type = "info", duration = 1000 }) {
        if (!this.toastContainer) return

        const toast = document.createElement("div")

        // Auto remove toast
        const autoRemoveId = setTimeout(() => {
            this.toastContainer.removeChild(toast)
        }, duration + 1000)

        // Remove toast when clicked
        toast.onclick = (e) => {
            if (e.target.closest(".toast__close")) {
                this.toastContainer.removeChild(toast)
                clearTimeout(autoRemoveId)
            }
        }

        const icons = {
            success: "fas fa-check-circle",
            info: "fas fa-info-circle",
            warning: "fas fa-exclamation-circle",
            error: "fas fa-exclamation-circle",
        }

        const icon = icons[type] || icons.info
        const delay = (duration / 1000).toFixed(2)

        toast.classList.add("toast", `toast--${type}`)
        toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`

        toast.innerHTML = `
            <div class="toast__icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast__body">
                <h3 class="toast__title">${title}</h3>
                <p class="toast__msg">${message}</p>
            </div>
            <div class="toast__close">
                <i class="fas fa-times"></i>
            </div>
        `

        this.toastContainer.appendChild(toast)
    }

    success(title, message, duration = 1000) {
        this.show({ title, message, type: "success", duration })
    }

    error(title, message, duration = 1000) {
        this.show({ title, message, type: "error", duration })
    }

    info(title, message, duration = 1000) {
        this.show({ title, message, type: "info", duration })
    }

    warning(title, message, duration = 1000) {
        this.show({ title, message, type: "warning", duration })
    }
}

const toast = new Toast()

export default toast
