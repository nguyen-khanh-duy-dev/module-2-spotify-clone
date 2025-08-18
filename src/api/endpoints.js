class EndPoints {
    // Auth
    static auth = {
        login: "auth/login",
        register: "auth/register",
    }

    // Tracks
    static tracks = {
        all: "tracks",
        popular: "tracks/popular",
        trending: "tracks/trending",
        ById: (id) => `tracks/${id}`,
        deleteTrack: "tracks/:trackId",
        liked: "me/tracks/liked",
    }

    // Playlists
    static playlists = {
        all: "playlists",
        me: "me/playlists",
        byId: (id) => `playlists/${id}`,
        delete: (id) => `playlists/${id}`,
        create: "playlists",
        update: (id) => `playlists${id}`,
        getTracks: (id) => `playlists/${id}/tracks`,
        addTrack: (id) => `playlists/${id}/tracks`,
        followed: "me/playlists/followed",
    }

    // Artists
    static artists = {
        all: "artists",
        trending: "artists/trending",
        byId: (id) => `artists/${id}`,
        follow: (id) => `artists/${id}/follow`,
        unfollow: (id) => `artists/${id}/follow`,
        followed: "me/following",
    }
}

export default EndPoints
