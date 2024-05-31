const { SlashCommandBuilder } = require('discord.js');
const data = require('../../data.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the leaderboard')
        .setDMPermission(false),
    async execute(interaction) {
        const teams = await data.readJSONFile('data/teams.json');

        var leaderboard = [];

        for (const teamName in teams) {
            leaderboard.push({
                name: teamName,
                score: teams[teamName].score,
                scores: teams[teamName].scores,
                attempts: teams[teamName].attempts
            });
        }

        leaderboard.sort((a, b) => b.score - a.score);

        var leaderboardString = '';

        for (var i = 0; i < process.env.NUM_PROBLEMS; i += 5) {
            leaderboardString += '```ansi\n';
            leaderboardString += `Team Name          `

            for (var j = i; j < Math.min(i + 5, process.env.NUM_PROBLEMS); j++) {
                leaderboardString += `P${j + 1} `;

                if (j + 1 < 10) {
                    leaderboardString += ' ';
                }
            }

            for (const team of leaderboard) {
                leaderboardString += '\n';

                if (team.name.length > 18) {
                    leaderboardString += team.name.substring(0, 18) + ' ';
                } else {
                    leaderboardString += team.name.padEnd(19);
                }

                for (var j = i; j < Math.min(i + 5, process.env.NUM_PROBLEMS); j ++) {
                    let scoreString;
                    
                    if (team.scores[j] === -1) {
                        if (team.attempts[j] !== -1) {
                            scoreString = `${team.attempts[j]}X`;
                        } else {
                            scoreString = '-';
                        }
                    } else {
                        if (team.scores[j] > 99) {
                            scoreString = '>99';
                        } else {
                            scoreString = team.scores[j].toString();
                        }
                    }

                    leaderboardString += scoreString.padEnd(4);
                }
            }

            leaderboardString += '\n```';
        }

        leaderboardString += '```ansi\n';
        leaderboardString += `Rank  Team Name          Total`;

        let k = 0;

        for (const team of leaderboard) {
            leaderboardString += '\n';

            leaderboardString += `${k+1}.`.padEnd(6);

            if (team.name.length > 18) {
                leaderboardString += team.name.substring(0, 18) + ' ';
            } else {
                leaderboardString += team.name.padEnd(19);
            }

            leaderboardString += team.score.toString();

            k ++;
        }

        leaderboardString += '\n```';

        interaction.reply({content: leaderboardString, ephemeral: true});
    }
}