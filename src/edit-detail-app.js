class editDetailApp extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({
            mode: "open",
        })
    }

    connectedCallback() {
        const template = document.querySelector("#edit-details-template")
        const templateContent = template.content.cloneNode(true)
        this.shadowRoot.appendChild(templateContent)
    }
}

customElements.define("edit-detail-app", editDetailApp)
