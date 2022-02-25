const { SlashCommandBuilder } = require('@discordjs/builders')
const { getTopPlayerScores } = require('../functions/functions.js')
const { embedScoresFormatter } = require("../helper/helper.js")
const TMIO = require('trackmania.io'), TMIOclient = new TMIO.Client()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('currentleaders')
		.setDescription('Get current official campaign score leaders.'),
	async execute(interaction) {
		await interaction.deferReply()
		const campaign = await TMIOclient.campaigns.currentSeason()
		const topPlayers = await getTopPlayerScores(process.env.GROUP_UID)
		const result = embedScoresFormatter(topPlayers, campaign.name, campaign.id)
		await interaction.editReply({ embeds: [result] })
	},
};
