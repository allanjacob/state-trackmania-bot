const { SlashCommandBuilder } = require('@discordjs/builders');
const helper = require("../helper/helper.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerprofile')
        .addStringOption(option => option.setName('playername').setDescription('Enter the day of the month the track appeared.'))
        .setDescription('Get stats and details of a player.'),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            let userOptionInput = interaction.options._hoistedOptions[0]['value']
            const result = await helper.getPlayerProfile(userOptionInput)
            console.log(userOptionInput)
            await interaction.editReply({ embeds: [result] })
        } catch (e) {
            console.log(e)
            await interaction.editReply("Oh no! An error has occured with calculating records.")
        }
    },
};