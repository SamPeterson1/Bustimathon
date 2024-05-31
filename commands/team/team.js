const { SlashCommandBuilder } = require('discord.js');
const data = require('../../data.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Register or remove a team')
        .setDMPermission(false)
        .addSubcommand(subcommand => subcommand
            .setName('register')
            .setDescription('Register a new team')
            .addStringOption(option => option
                .setName('team-name')
                .setDescription('the name of the team')
                .setRequired(true))
            )
        .addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('Remove a team')
            .addStringOption(option => option
                .setName('team-name')
                .setDescription('the name of the team')
                .setRequired(true)
            )
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'register') {
            registerTeam(interaction);
        } else if (interaction.options.getSubcommand() === 'remove') {
            removeTeam(interaction);
        } 
    }
}

async function registerTeam(interaction) {
    const teams = await data.readJSONFile('data/teams.json');

    const teamName = interaction.options.getString('team-name');
    const creator = interaction.user.id;

    console.log("Create team: " + teamName + " by " + creator);

    for (const team in teams) {
        if (teams[team].creator === creator) {
            interaction.reply({content: `You are already a member of the team ${team}.`, ephemeral: true});
            return;
        }
    }

    if (teams[teamName]) {
        interaction.reply({content: `The team ${teamName} already exists.`, ephemeral: true});
    } else {
        teams[teamName] = {
            creator: creator,
            guesses: 15,
            scores: [],
            attempts: [],
            score: 10 * Math.pow(2, process.env.NUM_PROBLEMS)
        }

        for (var i = 0; i < process.env.NUM_PROBLEMS; i++) {
            teams[teamName].scores.push(-1);
            teams[teamName].attempts.push(-1);
        }
        
        data.writeJSONFile('data/teams.json', teams);
        interaction.reply({content: `The team ${teamName} has been registered.`, ephemeral: true});
    }
}

async function removeTeam(interaction) {
    const teams = await data.readJSONFile('data/teams.json');

    const teamName = interaction.options.getString('team-name');

    console.log("Remove team " + teamName + "by " + interaction.user.id);

    if (!teams[teamName]) {
        interaction.reply({content: `The team ${teamName} does not exist.`, ephemeral: true});
    } else {
        const bustimathon = await data.readJSONFile('data/bustimathon.json');

        let isAdmin = false;

        for (const admin of bustimathon.admins) {
            if (interaction.user.id === admin) {
                isAdmin = true;
                break;
            }
        }

        if (!isAdmin && teams[teamName].creator !== interaction.user.id) {
            interaction.reply({content: `You do not have permission to remove the team ${teamName}.`, ephemeral: true});
            return;
        }

        delete teams[teamName];
        data.writeJSONFile('data/teams.json', teams);
        interaction.reply({content: `The team ${teamName} has been removed.`, ephemeral: true});
    }
}