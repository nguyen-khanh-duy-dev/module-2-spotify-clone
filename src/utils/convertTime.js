// Function to convert time from second to minute:second

export function convertTime(seconds) {
    if (typeof seconds !== "number" || seconds < 0) {
        throw new Error("Invalid input: seconds must be a non-negative number")
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
}
