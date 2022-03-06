const { Formatters, MessageEmbed } = require('discord.js');
const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client();

function recordPlacingFormatter(playerTimeMapSort) {
    let result = ''
    let count = 1
    let emoji = ''
    playerTimeMapSort.forEach((value, key) => {
        if (count == 1) {
            emoji = ':first_place:'
        } else if (count == 2) {
            emoji = ':second_place:'
        } else if (count == 3) {
            emoji = ':third_place:'
        } else { emoji = '	  ' }

        result += `${emoji} ${Formatters.bold(key)} ${timeFormatter(value)}\n`
        count++
    })
    return result
}

function scoreFormatter(dictionary) {
    let result = []
    let place = ''
    let players = ''
    let scores = ''
    let count = 1
    for (let i = 0; i < dictionary['users'].length; i++) {
        players += `${dictionary['users'][i]['nameOnPlatform']}\n`
        scores += `${dictionary['users'][i]['sp']}\n`
        place += `${count}\n`
        count++
    }
    result.push(place)
    result.push(players)
    result.push(scores)
    return result
}

function timeFormatter(value) {
    const valueToString = value.toString()
    const lastThree = valueToString.substring(valueToString.length - 3)
    let firstHalf = Number(valueToString.substring(0, 2))
    const minutes = Math.floor(firstHalf / 60).toString()
    const seconds = (firstHalf - minutes * 60).toString()
    result = ''
    if (minutes == '0') {
        result = `${seconds}.${lastThree}`
    } else {
        if (seconds < 10) {
            result = `${minutes}:0${seconds}.${lastThree}`
        } else { result = `${minutes}:${seconds}.${lastThree}` }
    }
    return result
}

function embedFormatter(trackName, trackUid, value, authorName, authorAccountId) {
    const replyEmbed = new MessageEmbed()
        .setColor('#f4ca16')
        .setTitle(trackName)
        .setURL(`https://trackmania.io/#/leaderboard/${trackUid}`)
        .setAuthor(`Created by ${authorName}`, 'https://trackmania.io/img/square.png', `https://trackmania.io/#/player/${authorAccountId}`)
        .setThumbnail('https://trackmania.io/img/square.png')
        .addFields(
            { name: 'Track Leaders', value: value },
        )
        .setFooter('This bot is currently in active development.');

    return replyEmbed
}

function embedScoresFormatter(data, campaign, ioCampaignId) {
    const replyEmbed = new MessageEmbed()
        .setColor('#f4ca16')
        .setTitle(`Score Leaders for ${campaign}`)
        .setURL(`https://trackmania.io/#/campaigns/0/${ioCampaignId}`)
        .setDescription(`${campaign} Score Leaders`)
        .addFields(
            { name: 'Rank', value: data[0], inline: true },
            { name: 'Player', value: Formatters.bold(data[1]), inline: true },
            { name: 'Score', value: data[2], inline: true },
        )
        .setFooter('This bot is currently in active development.');

    return replyEmbed
}

async function getPlayerProfile(playerName) {
    let playerCotd, playerMatchmaking, name, playerObject = null

    await TMIOclient.players.search(playerName).then(async player => {
        name = player
        await TMIOclient.players.get(player[0].id).then(async object => {
            playerObject = object
            playerMatchmaking = await object.matchmaking()
            playerCotd = await object.cotd()
        })
    })

    const formatterResult = playerProfileFormatter(playerObject, playerCotd, playerMatchmaking)
    return formatterResult
}

function playerProfileFormatter(playerObject, cotd, matchmaking) {
    let exampleEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(playerObject.name)
        .setURL(`https://trackmania.io/#/player/${playerObject.id}`)
        .setAuthor('Brought to you by Trackmania.io', 'https://trackmania.io/img/square.png', `https://trackmania.io/#/totd`)
        .setDescription(`${playerObject.zone[0].name}, ${playerObject.zone[1].name}, ${playerObject.zone[2].name}`)
        .setThumbnail('https://www.trackmania.com/90987169_2814211285336341_8730731110385844224_o/')
        .addFields(
            { name: `:trophy: Trophy Points`, value: `${(playerObject.trophies.points).toLocaleString("en-US")}` },
            { name: '\u200B', value: '\u200B' },
            { name: `${playerObject.zone[0].name}`, value: `${ordinal_suffix_of(playerObject.zone[0].ranking)}`, inline: true },
            { name: `${playerObject.zone[1].name}`, value: `${ordinal_suffix_of(playerObject.zone[1].ranking)}`, inline: true },
            { name: `${playerObject.zone[2].name}`, value: `${ordinal_suffix_of(playerObject.zone[2].ranking)}`, inline: true },
            { name: `${playerObject.zone[3].name}`, value: `${ordinal_suffix_of(playerObject.zone[3].ranking)}`, inline: true },
            { name: '\u200B', value: '\u200B' },
        )
        .setFooter('This bot is currently in active development.', 'https://www.trackmania.com/90987169_2814211285336341_8730731110385844224_o/');

    if (cotd != null) {
        exampleEmbed = exampleEmbed.addFields(
            { name: `CUP OF THE DAY STATS`, value: `Player's COTD statistics` },
            { name: `Total Played`, value: `${cotd.count}`, inline: true },
            { name: `Total Div Wins`, value: `${cotd.stats.totalDivWins}`, inline: true },
            { name: `Total Wins`, value: `${cotd.stats.totalWins}`, inline: true },
            { name: `Average Div`, value: `${Math.round(cotd.stats.averageDiv * 1000) / 1000}`, inline: true },
            { name: '\u200B', value: '\u200B' })
    }
    if (matchmaking != null) {
        exampleEmbed = exampleEmbed.addFields(
            { name: `MATCHMAKING STATS`, value: `Player's 3v3 matchmaking statistics` },
            { name: `Rank`, value: `${matchmaking.rank} (top ${Math.ceil((matchmaking.rank / matchmaking.totalPlayers) * 100)}%)`, inline: true },
            { name: `Score`, value: `${matchmaking.score}`, inline: true },
            { name: '\u200B', value: '\u200B' })
    }
    if (playerObject.meta.twitch) {
        exampleEmbed = exampleEmbed.addField(`Twitch :purple_circle:`, `${playerObject.meta.twitch}`)
    }
    if (playerObject.meta.youtube) {
        exampleEmbed = exampleEmbed.addField(`Youtube :red_circle:`, `${playerObject.meta.youtube}`)
    }
    return exampleEmbed
}

function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

module.exports = {
    embedFormatter, timeFormatter, embedScoresFormatter, getPlayerProfile, recordPlacingFormatter, playerProfileFormatter, scoreFormatter
};