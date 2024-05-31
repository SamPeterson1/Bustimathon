const { SlashCommandBuilder } = require('discord.js');
const data = require('../../data.js');

module.exports = {
    data: new SlashCommandBuilder()
	.setName('estimate')
	.setDescription('Attempt to solve a bustimathon problem')
    .setDMPermission(false)
    .addIntegerOption(option => option
        .setName('problem-number')
        .setDescription('The number of the problem you are attempting to solve')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption(option => option
		.setName('minimum')
		.setDescription('The lower bound of your estimate')
		.setRequired(true)
		.setMinValue(1))
    .addIntegerOption(option => option
        .setName('maximum')
        .setDescription('The upper bound of your estimate')
        .setRequired(true)
        .setMinValue(1)),
    async execute(interaction) {
        const problems = await data.readJSONFile('data/problems.json');
        const teams = await data.readJSONFile('data/teams.json');

        const problemNumber = interaction.options.getInteger('problem-number') - 1;

        const minimum = interaction.options.getInteger('minimum');
        const maximum = interaction.options.getInteger('maximum');

        console.log("Answer submitted for problem " + (problemNumber + 1) + " by " + interaction.user.id + " with bounds " + minimum + " to " + maximum);

        const bustimathon = await data.readJSONFile('data/bustimathon.json');

        if (!bustimathon.active) {
            interaction.reply({content: 'The Bustimathon has not started yet.', ephemeral: true});
            return;
        }

        if (minimum > maximum) {
            interaction.reply({content: 'The minimum must be less than or equal to the maximum.', ephemeral: true});
            return;
        }

        if (!problems[problemNumber]) {
            interaction.reply({content: `Problem ${problemNumber} does not exist.`, ephemeral: true});
            return;
        }

        let team;

        for (const teamName in teams) {
            if (teams[teamName].creator === interaction.user.id) {
                team = teams[teamName];
                break;
            }
        }

        if (!team) {
            interaction.reply({content: 'You are not the creator of any team.', ephemeral: true});
            return;
        }

        if (team.guesses === 0) {
            interaction.reply({content: 'Your team has no guesses remaining.', ephemeral: true});
            return;
        }

        team.guesses --;

        const score = getProblemScore(minimum, maximum, problems[problemNumber]);

        if (score === -1) {
            team.scores[problemNumber] = -1;
            team.score = getTeamScore(team);

            if (team.attempts[problemNumber] === -1) {
                team.attempts[problemNumber] = 1;
            } else {
                team.attempts[problemNumber] ++;
            }

            interaction.reply({content: `Incorrect. You have ${team.guesses} guesses remaining. Your team's score is now ${team.score}.`, ephemeral: true});
        } else {
            team.scores[problemNumber] = score;
            team.score = getTeamScore(team);
            interaction.reply({content: `Correct! You have ${team.guesses} guesses remaining. Your team's score is now ${team.score}.`, ephemeral: true});
        }

        data.writeJSONFile('data/teams.json', teams);
    }
}

function getTeamScore(team) {
    let goodIntervals = 0;
    let intervalScores = 10;

    for (let i = 0; i < process.env.NUM_PROBLEMS; i++) {
        if (team.scores[i] !== -1) {
            intervalScores += team.scores[i];
            goodIntervals ++;
        }
    }

    return intervalScores * Math.pow(2, process.env.NUM_PROBLEMS - goodIntervals);
}

function getProblemScore(minimum, maximum, answer) {
    if (minimum <= answer && maximum >= answer) {
        return Math.floor(maximum / minimum);
    } else {
        return -1;
    }
}