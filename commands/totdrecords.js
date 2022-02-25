const { SlashCommandBuilder } = require('@discordjs/builders');
const helper = require("../helper/helper.js")
const { getTotdRecords } = require('../functions/functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('totdrecords')
		.setDescription('Get top records for TOTD'),

	async execute(interaction) {
		await interaction.deferReply();
		username = interaction.user['username']
		userOptionInput = interaction.options._hoistedOptions
		const date = new Date()
		const result = await getTotdRecords(date)
		await interaction.editReply({ embeds: [result] })

	},
};