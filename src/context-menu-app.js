class contextMenuApp extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({
            mode: "open",
        })
    }
    connectedCallback() {
        const template = document.querySelector("#context-menu-template")
        const templateContent = template.content.cloneNode(true)
        this.shadowRoot.appendChild(templateContent)
    }
}

customElements.define("context-menu-app", contextMenuApp)
