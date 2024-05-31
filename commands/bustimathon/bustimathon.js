const { SlashCommandBuilder } = require('discord.js');
const data = require('../../data.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bustimathon')
        .setDescription('Start a Bustimathon')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('start')
            .setDescription('Start the Bustimathon')
        )
        .addSubcommand(subcommand => subcommand
            .setName('end')
            .setDescription('End the Bustimathon')
        ),
    async execute(interaction) {
        const bustimathon = await data.readJSONFile('data/bustimathon.json');

        let isAdmin = false;

        for (const admin of bustimathon.admins) {
            if (interaction.user.id === admin) {
                isAdmin = true;
                break;
            }
        }

        if (!isAdmin) {
            interaction.reply({content: 'You do not have permission to use this command.', ephemeral: true});
            return;
        }

        if (interaction.options.getSubcommand() === 'start') {
            console.log("Bustimathon started by " + interaction.user.id + " at " + new Date().toISOString());

            if (bustimathon.active) {
                interaction.reply({content: 'The Bustimathon has already started.', ephemeral: true});
                return;
            }

            bustimathon.active = true;

            await data.writeJSONFile('data/bustimathon.json', bustimathon);

            interaction.reply({content: 'The Bustimathon has started.', ephemeral: true});
        } else if (interaction.options.getSubcommand() === 'end') {
            console.log("Bustimathon ended by " + interaction.user.id + " at " + new Date().toISOString());

            if (!bustimathon.active) {
                interaction.reply({content: 'The Bustimathon has not started yet.', ephemeral: true});
                return;
            }

            bustimathon.active = false;

            await data.writeJSONFile('data/bustimathon.json', bustimathon);

            interaction.reply({content: 'The Bustimathon has ended.', ephemeral: true});
        }
    }
}