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
