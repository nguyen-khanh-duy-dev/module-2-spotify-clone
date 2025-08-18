export function validateSignup(message, error) {
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
        textErrorPassword.textContent = error.response.error.details[0].message
        validPassword.style.display = "block"
    } else {
        validPassword.style.display = "none"
    }
}

// Check validate form log in
export function validateLogin(message, error) {
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
        textErrorPassword.textContent = error.response.error.details[0].message
        validPassword.style.display = "block"
    } else {
        validPassword.style.display = "none"
    }
}
