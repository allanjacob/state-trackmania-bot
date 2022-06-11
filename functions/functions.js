const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client();
const { getTopPlayersGroup, getTopPlayersMap, getMaps, getMapRecords, getProfiles, getProfilesById } = require('trackmania-api-node')
const { APILogin } = require("../functions/authentication.js")
const { embedFormatter, recordPlacingFormatter, scoreFormatter } = require("../helper/helper.js")

TMIOclient.setUserAgent('Project Name: state-trackmania-bot, Contact: Bladed#1980 on Discord')

async function getTopPlayerTimes(mapUid) {
    const APICredentials = await APILogin()

    const topPlayersResult = await getTopPlayersMap(APICredentials[3], mapUid)
    const map = await getMaps(APICredentials[1].accessToken, [mapUid])
    const mapId = map[0]['mapId']
    const playerList = topPlayersResult['tops'][3]['top']
    const accountIds = []
    for (const i in playerList) {
        accountIds.push(playerList[i]["accountId"])
    }

    const playerProfiles = await getProfiles(APICredentials[1].accessToken, accountIds)
    const profileIdAccountIdMap = new Map();
    const profileIds = []
    for (const i in playerProfiles) {
        let uid = playerProfiles[i]['uid']
        let accountId = playerProfiles[i]['accountId']
        profileIds.push(uid)
        profileIdAccountIdMap.set(uid, accountId)
    }

    const profiles = await getProfilesById(APICredentials[0].ticket, profileIds)
    const playerTimeMap = new Map()
    for (const i in profiles['profiles']) {
        let { nameOnPlatform, profileId } = profiles['profiles'][i]
        let record = await getMapRecords(APICredentials[1].accessToken, profileIdAccountIdMap.get(profileId), mapId)
        let time = record[0]['recordScore']['time']
        playerTimeMap.set(nameOnPlatform, time)
    }
    const playerTimeMapSort = new Map([...playerTimeMap.entries()].sort((a, b) => a[1] - b[1])); // Re-orders players' records from best to worst
    console.log(playerTimeMapSort)
    return recordPlacingFormatter(playerTimeMapSort)
}

async function getCampaignRecords(campaignObject, trackNumber) {
    let authorAccountId, trackName, trackUid, authorName = null

    trackUid = campaignObject['_data']['playlist'][trackNumber - 1].mapUid
    trackName = campaignObject['_data']['playlist'][trackNumber - 1].name
    authorAccountId = campaignObject['_data']['playlist'][trackNumber - 1].author
    if (campaignObject.mapCount < trackNumber) {
        console.log(`Campaign does not contain track #${trackNumber}`)
        return 'No Track Found'
    }

    await TMIOclient.players.get(authorAccountId).then(player => {
        authorName = player.name
    })

    const topTimesResult = await getTopPlayerTimes(trackUid)
    const replyEmbed = embedFormatter(trackName, trackUid, topTimesResult, authorName, authorAccountId)
    return replyEmbed
}

async function getTotdRecords(date) {
    let trackName, totdSearch, totdauthor, authorAccountId, trackUid = null
    await TMIOclient.totd.get(date).then(async totd => {
        trackUid = totd.map().id
        totdSearch = await totd.map().then(async map => {
            trackUid = map.uid
            trackName = map.fileName.replace(/\.[^/.]+$/, "").replace(/\.[^/.]+$/, "")
            await map.author().then(async author => {
                totdauthor = author.name
                authorAccountId = author.id
            })
        })
    })
    const topTimesResult = await getTopPlayerTimes(trackUid)
    const replyEmbed = embedFormatter(trackName, trackUid, topTimesResult, totdauthor, authorAccountId)
    return replyEmbed
}

async function getTopPlayerScores(groupUId) {
    const APICredentials = await APILogin()

    try {
        const topPlayersResult = await getTopPlayersGroup(APICredentials[3], groupUId)
        const playerList = topPlayersResult['tops'][3]['top']
        const dictionary = {
            'users': []
        }
        const accountIds = []
        for (const i in playerList) {
            dictionary['users'].push({
                'accountId': playerList[i]["accountId"],
                'uid': '',
                'nameOnPlatform': '',
                'position': playerList[i]["position"],
                'sp': playerList[i]["sp"]
            })
            accountIds.push(playerList[i]["accountId"])
        }
        const playerProfiles = await getProfiles(APICredentials[1].accessToken, accountIds)
        const profileIdAccountIdMap = new Map();
        const profileIds = []
        for (const i in playerProfiles) {
            let uid = playerProfiles[i]["uid"]
            let accountId = playerProfiles[i]["accountId"]
            profileIds.push(uid)
            profileIdAccountIdMap.set(accountId, uid)
        }
        for (let i = 0; i < dictionary['users'].length; i++) {
            dictionary['users'][i]['uid'] = profileIdAccountIdMap.get(dictionary['users'][i]['accountId'])
        }
        const profiles = await getProfilesById(APICredentials[0].ticket, profileIds)
        for (const i in profiles["profiles"]) {
            let { nameOnPlatform, profileId } = profiles["profiles"][i]
            for (let i = 0; i < dictionary['users'].length; i++) {
                if (profileId == dictionary['users'][i]['uid']) {
                    dictionary['users'][i]['nameOnPlatform'] = nameOnPlatform
                    break
                }
            }
        }
        const result = scoreFormatter(dictionary)
        return result
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    getCampaignRecords, getTotdRecords, getTopPlayerScores
};