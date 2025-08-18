class HttpRequest {
    constructor() {
        this.baseURL = "https://spotify.f8team.dev/api/"
    }
    async _send(path, method, data, options = {}) {
        try {
            const _options = {
                ...options,
                method,
                headers: {
                    ...options.headers,
                    // "Content-Type": "application/json",
                },
            }
            if (data instanceof FormData) {
                _options.body = data
                // Không set Content-Type — browser tự set
            } else if (data) {
                _options.headers["Content-Type"] = "application/json"
                _options.body = JSON.stringify(data)
            }

            const accessToken = localStorage.getItem("access-token")
            if (accessToken) {
                _options.headers.Authorization = `Bearer ${accessToken}`
            }

            const res = await fetch(`${this.baseURL}${path}`, _options)
            const response = await res.json()

            if (!res.ok) {
                const error = new Error("Http Error: ", res.status)
                error.response = response
                error.status = res.status
                throw error
            }
            return response
        } catch (error) {
            throw error
        }
    }

    async get(path, options) {
        return await this._send(path, "GET", null, options)
    }

    async post(path, data, options) {
        return await this._send(path, "POST", data, options)
    }

    async put(path, data, options) {
        return await this._send(path, "PUT", data, options)
    }

    async patch(path, data, options) {
        return await this._send(path, "PATCH", data, options)
    }

    async del(path, options) {
        return await this._send(path, "DELETE", null, options)
    }
}

const httpRequest = new HttpRequest()

export default httpRequest