require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const axios = require('axios'); 
const cron = require('node-cron'); 
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const channelId = process.env.CHANNEL_ID;
const gameChannelId = process.env.GAME_CHANNEL_ID;
const afkUsers = new Map();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,  // Required to detect presence updates
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const locationCodes = {
    'Gombak': 'sgr-0',
    'Hulu Langat': 'sgr-1',
    'Hulu Selangor': 'sgr-2',
    'Klang': 'sgr-3',
    'Kuala Langat': 'sgr-4',
    'Kuala Selangor': 'sgr-5',
    'Petaling': 'sgr-6',
    'Rawang': 'sgr-7',
    'Sabak Bernam': 'sgr-8',
    'Sepang': 'sgr-9',
    'Shah Alam': 'sgr-10',
    'Alor Gajah': 'mlk-0',
    'Bandar Melaka': 'mlk-1',
    'Jasin': 'mlk-2',
    'Masjid Tanah': 'mlk-3',
    'Merlimau': 'mlk-4',
    'Nyalas': 'mlk-5',
    'Kuala Lumpur': 'wlp-0',
    'Labuan': 'wlp-1',
    'Putrajaya': 'wlp-2'
};

const commands = [
    {
        name: 'ping',
        description: 'Replies with pong!',
    },
    {
        name: 'gerakmakan',
        description: 'Suggests a random time between 12 PM and 1 PM for makan!',
    },
    {
        name: 'geraksolat',
        description: 'Suggests a random time between 12:30 PM and 1 PM for solat!',
    },
    {
        name: 'makanmana',
        description: 'Suggests a random place to eat from a list!',
    },
    {
        name: 'waktusolat',
        description: 'Shows prayer times based on the location!',
        options: [
            {
                type: 3, // String
                name: 'location',
                description: 'Enter your location (e.g., city name)',
                required: true,
            },
        ],
    },
    {
        name: 'lokasiwaktusolat',
        description: 'Lists all available location codes for prayer times!',
    },
    {
        name: 'osom',
        description: 'Play rock-paper-scissors with another user!',
        options: [
            {
                type: 6, // User
                name: 'opponent',
                description: 'Select the user you want to play against',
                required: true,
            },
            {
                type: 3, // String
                name: 'move',
                description: 'Your move: rock, paper, or scissors',
                required: true,
                choices: [
                    { name: 'rock', value: 'rock' },
                    { name: 'paper', value: 'paper' },
                    { name: 'scissors', value: 'scissors' },
                ],
            },
        ],
    }
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    cron.schedule('0 12 * * *', () => {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            channel.send('@everyone Jam dah pukul 12 tengahari. Dah fikir ke nak makan apa? Guna /makanmana & /gerakmakan kalau tak reti buat keputusan!');
        } else {
            console.error('Channel not found.');
        }
    }, {
        timezone: "Asia/Kuala_Lumpur"
    });

    cron.schedule('0 17 * * *', () => {
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            channel.send('@everyone Dah pukul 5 petang. Buat kerja apa lagi? BALIK!');
        } else {
            console.error('Channel not found.');
        }
    }, {
        timezone: "Asia/Kuala_Lumpur"
    });

    cron.schedule('0 16 * * *', () => {
        const channel = client.channels.cache.get(gameChannelId);
        if (channel) {
            channel.send('@everyone Be sure to check your daily & quest from OwO! Type **owo daily** to check!');
        } else {
            console.error('Channel not found.');
        }
    }, {
        timezone: "Asia/Kuala_Lumpur"
    });
});


client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.user) return;

    const member = newPresence.member;
    const userId = member.id;
    const status = newPresence.status;

    const afkChannel = client.channels.cache.get(channelId);

    if (status === 'idle') {
        if (!afkUsers.has(userId)) {
            afkUsers.set(userId, Date.now());
            afkChannel.send(`${member.user.tag} is now AFK.`);
        }
    }

    if (status === 'online' || status === 'dnd') {
        if (afkUsers.has(userId)) {
            const afkTime = Date.now() - afkUsers.get(userId);
            afkUsers.delete(userId);
            afkChannel.send(`${member.user.tag} is back after being AFK for ${Math.round(afkTime / 60000)} minutes.`);
        }
    }
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    try {
        await interaction.deferReply();

        if (commandName === 'ping') {
            setTimeout(async () => {
                await interaction.editReply({ 
                    content: 'pong!' });
                }, 2000); 
        } else if (commandName === 'gerakmakan') {
            setTimeout(async () => {
                const hour = 12;
                const minute = Math.floor(Math.random() * 60); // Random minute between 0 and 59
                const formattedTime = `${hour}:${minute < 10 ? '0' : ''}${minute} PM`;
                await interaction.editReply({ 
                    content: `You should go makan at ${formattedTime}. Happy makan!` });
                }, 2000);
        } else if (commandName === 'geraksolat') {
            setTimeout(async () => {
                const hour = 12;
                const minStart = 30;
                const minEnd = 60;
                const minute = Math.floor(Math.random() * (minEnd - minStart) + minStart); // Random minute between 30 and 59
                const formattedTime = `${hour}:${minute < 10 ? '0' : ''}${minute} PM`;
                await interaction.editReply({
                    content: `Gerak solat Jumaat is set at ${formattedTime}. Please bring your items and selamat menunaikan solat!`,
                });
            }, 2000); 
        } else if (commandName === 'makanmana') {
            setTimeout(async () => {
                const places = [
                    'Mamak Bawah',
                    'Mamak Nasi Ayam',
                    'Bunian',
                    'Mek Kelate',
                    'Jayagrocer',
                    'Maggi',
                    'Kat Masjid',
                ];
                const randomPlace = places[Math.floor(Math.random() * places.length)];
                await interaction.editReply({
                    content: `${randomPlace} has been selected! Pergi makan kat sana!`,
                });
            }, 2000); 
        } else if (commandName === 'waktusolat') {
            const location = interaction.options.getString('location'); // User input
            const code = locationCodes[location];
    
            if (!code) {
                await interaction.editReply({ 
                    content: 'Invalid location code. Please select a valid location.' });
                return;
            }
    
            try {
                const response = await axios.get(`https://mpt.i906.my/api/prayer/${code}`);
                const data = response.data.data;
                
                const today = new Date().getDate();
                const timesForToday = data.times[today - 1];
    
                if (!timesForToday) {
                    await interaction.editReply({ 
                        content: 'No prayer times available for today.' });
                    return;
                }
    
                const prayerTimes = {
                    Subuh: new Date(timesForToday[0] * 1000).toLocaleTimeString(),
                    Syuruk: new Date(timesForToday[1] * 1000).toLocaleTimeString(),
                    Zohor: new Date(timesForToday[2] * 1000).toLocaleTimeString(),
                    Asar: new Date(timesForToday[3] * 1000).toLocaleTimeString(),
                    Maghrib: new Date(timesForToday[4] * 1000).toLocaleTimeString(),
                    Isya: new Date(timesForToday[5] * 1000).toLocaleTimeString()
                };
    
                const embed = new EmbedBuilder()
                    .setTitle('Prayer Times')
                    .setDescription(`Prayer times for ${data.place} on ${new Date().toLocaleDateString()}`)
                    .addFields(
                        { name: 'Subuh', value: prayerTimes.Subuh, inline: true },
                        { name: 'Syuruk', value: prayerTimes.Syuruk, inline: true },
                        { name: 'Zohor', value: prayerTimes.Zohor, inline: true },
                        { name: 'Asar', value: prayerTimes.Asar, inline: true },
                        { name: 'Maghrib', value: prayerTimes.Maghrib, inline: true },
                        { name: 'Isya', value: prayerTimes.Isya, inline: true }
                    )
                    .setColor('#0099ff');
    
                await interaction.editReply({ 
                    content: '', embeds: [embed] });
            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: 'Failed to fetch prayer times. Please try again later.' });
            }
        } else if (commandName === 'lokasiwaktusolat') {
            const locationsList = Object.keys(locationCodes)
                .map(location => location)
                .join('\n');
        
            const embed = new EmbedBuilder()
                .setTitle('Prayer Time Locations')
                .setDescription('Here is a list of available prayer time locations:')
                .addFields([
                    { name: 'Locations', value: locationsList }
                ])
                .setColor('#0099ff');
        
            await interaction.editReply({ content: '', embeds: [embed] });
        }  else if (commandName === 'osom') {
            const challenger = interaction.user;
            const opponent = interaction.options.getUser('opponent');
            const challengerMove = interaction.options.getString('move');
    
            // Inform both players about the challenge
            const embed = new EmbedBuilder()
                .setTitle('Rock-Paper-Scissors Challenge')
                .setDescription(`${challenger} has challenged ${opponent} to a game of Rock-Paper-Scissors! 🪨📃✂️`)
                .setColor('#00FF00')
                .setFooter({ text: 'Both players need to submit their moves!' });
    
            await interaction.editReply({ embeds: [embed] });
    
            // Ask opponent to submit their move ephemerally
            await interaction.followUp({
                content: `⏳ ${opponent}, please submit your move (rock, paper, or scissors). ⏳`,
                ephemeral: false
            });
    
            const filter = message => {
                // Ensure the message is from the opponent and is a valid move
                return message.author.id === opponent.id && ['rock', 'paper', 'scissors'].includes(message.content.toLowerCase());
            };
    
            const moveCollector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });
    
            moveCollector.on('collect', async message => {
                const opponentMove = message.content.toLowerCase();
    
                // Determine the winner
                const winner = determineWinner(challengerMove, opponentMove);
    
                let resultMessage;
                if (winner === 'draw') {
                    resultMessage = `👏 It's a draw! Both players chose ${challengerMove}. 👏`;
                } else if (winner === challengerMove) {
                    resultMessage = `${challenger} wins with ${challengerMove} against ${opponentMove}! 🎉`;
                } else {
                    resultMessage = `${opponent} wins with ${opponentMove} against ${challengerMove}! 🎉`;
                }
    
                // Announce the result publicly
                await interaction.followUp({ content: resultMessage });
            });
    
            moveCollector.on('end', async collected => {
                if (!collected.size) {
                    await interaction.followUp({ content: '⏰ Time ran out! The opponent did not submit a move.' });
                }
            });
        }
    } catch (error) {
        console.error(error);
    }

});

function determineWinner(move1, move2) {
    const moves = {
        'rock': 0,
        'paper': 1,
        'scissors': 2
    };

    const result = (3 + moves[move1] - moves[move2]) % 3;
    if (result === 0) return 'draw';
    return result === 1 ? move1 : move2;
}

client.login(token);