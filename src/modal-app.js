class modalApp extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({
            mode: "open",
        })
    }

    connectedCallback() {
        const template = document.querySelector("#modal-template")
        const templateContent = template.content.cloneNode(true)
        this.shadowRoot.appendChild(templateContent)
    }
}

customElements.define("modal-app", modalApp)
