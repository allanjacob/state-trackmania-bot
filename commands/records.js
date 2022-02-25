const { SlashCommandBuilder } = require('@discordjs/builders');
const { getCampaignRecords } = require('../functions/functions.js')
const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('records')
        .setDescription('Get top records for a campaign track.')
        .addStringOption(option => option.setName('campaign').setDescription('Enter the name of the campaign you are requesting records for.'))
        .addNumberOption(option => option.setName('tracknumber').setDescription('Enter the track number of the campaign')),

    async execute(interaction) {
        await interaction.deferReply();
        username = interaction.user['username']
        userOptionInput = interaction.options._hoistedOptions

        if (!userOptionInput.length) {
            console.log(`User ${username} entered no options for command.`)
            await interaction.editReply("Please enter a campaign name and track number.\n*Example: /records campaign: Fall 2021 tracknumber: 1*")
            return
        }
        if (userOptionInput[0]["name"] != 'campaign') {
            console.log(`User ${username} entered options for command in wrong order.`)
            await interaction.editReply("Please enter a campaign name and track number.\n*Example: /records campaign: Fall 2021 tracknumber: 1*")
            return
        }
        if (typeof userOptionInput[1] === 'undefined') {
            console.log(`User ${username} entered options for command incorrectly. User missing tracknumber option.`)
            await interaction.editReply("Please dont forget to enter the track number you want to request records for.\n*Example: /records campaign: Fall 2021 tracknumber: 1*")
            return
        }

        const campaignName = userOptionInput[0]['value']
        const trackNumber = userOptionInput[1]['value']
        let result, campaignObject = null
        let searchIsValid = true

        await TMIOclient.campaigns.search(campaignName).then(async campaigns => {
            if (campaigns[0] === undefined) {
                console.log('No campaigns were found when searched.')
                searchIsValid = false
            } else {
                campaignObject = await campaigns[0].getCampaign()
            }
        })

        if (searchIsValid == false) {
            await interaction.editReply('No campaigns were found when searched.')
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