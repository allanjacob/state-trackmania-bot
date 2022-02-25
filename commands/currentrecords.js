const { SlashCommandBuilder } = require('@discordjs/builders');
const { getCampaignRecords } = require('../functions/functions.js')
const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('currentrecords')
        .setDescription('Get top records for current season of the official campaign.')
        .addNumberOption(option => option.setName('tracknumber').setDescription('Enter the track number of the campaign')),

    async execute(interaction) {
        await interaction.deferReply();
        username = interaction.user['username']
        userOptionInput = interaction.options._hoistedOptions

        if (!userOptionInput.length) {
            console.log(`User ${username} entered no options for command.`)
            await interaction.editReply("Please enter a track number. \n*Example: /currentrecords tracknumber: 1*")
            return
        }

        const trackNumber = parseInt(userOptionInput[0]['value'], 10)
        let result = null

        const campaignObject = await TMIOclient.campaigns.currentSeason()
        if (campaignObject._data.playlist.length < trackNumber || trackNumber < 1) {
            console.log(`Campaign does not contain track #${trackNumber}`)
            await interaction.editReply(`${username} has entered an invalid track number`)
            return
        }

        try {
            result = await getCampaignRecords(campaignObject, trackNumber)
        } catch (e) {
            console.log(e)
        }

        if (result == null) {
            await interaction.editReply('Unable to calculate records.')
        } else if (typeof result === 'string') {
            await interaction.editReply(result)
        } else { await interaction.editReply({ embeds: [result] }) }
    },
};