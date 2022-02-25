const { loginUbi, loginTrackmaniaUbi, loginTrackmaniaNadeo } = require('trackmania-api-node')

async function ubiLogin(credentials) {
    try {
        return await loginUbi(credentials)
    } catch (e) {
        console.log(e)
    }
}

async function nadeoLogin(ubiLogin) {
    try {
        const { ticket } = ubiLogin // login to ubi, level 0
        return await loginTrackmaniaUbi(ticket) // login to trackmania, level 1
    } catch (e) {
        // axios error
        console.log(e)
    }
}

async function trackmaniaNadeoLogin(nadeoLogin) {
    try {
        const { accessToken } = nadeoLogin // login to ubi, level 1
        return await loginTrackmaniaNadeo(accessToken, 'NadeoLiveServices') // login to trackmania, level 2
    } catch (e) {
        // axios error
        console.log(e)
    }
}

async function APILogin() {
    const credentials = Buffer.from(process.env.UBI_USERNAME + ':' + process.env.UBI_PASSWORD).toString('base64')
    const loggedIn = await ubiLogin(credentials)
    const nadeoLoggedIn = await nadeoLogin(loggedIn)
    const trackmaniaNadeoLoggedIn = await trackmaniaNadeoLogin(nadeoLoggedIn)
    const nadeoToken = trackmaniaNadeoLoggedIn.accessToken
    return [loggedIn, nadeoLoggedIn, trackmaniaNadeoLoggedIn, nadeoToken]

}

module.exports = {
    APILogin
};