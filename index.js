require('dotenv').config();

const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const axios = require('axios'); 
const cron = require('node-cron'); 
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const channelId = process.env.CHANNEL_ID;
const gameChannelId = process.env.GAME_CHANNEL_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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

    cron.schedule('0 15 * * *', () => {
        const channel = client.channels.cache.get(gameChannelId);
        if (channel) {
            channel.send('@everyone Be sure to check your daily & quest from OwO! Type **owo quest** to check!');
        } else {
            console.error('Channel not found.');
        }
    }, {
        timezone: "Asia/Kuala_Lumpur"
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    const spinningMessage = await interaction.reply({
        content: '🌀 Spinning...',
        fetchReply: true
    });

    if (commandName === 'ping') {
        setTimeout(async () => {
            await spinningMessage.edit({
                content: 'pong!',
            });
        }, 2000); 
    } else if (commandName === 'gerakmakan') {
        setTimeout(async () => {
            const hour = 12;
            const minute = Math.floor(Math.random() * 60); // Random minute between 0 and 59
            const formattedTime = `${hour}:${minute < 10 ? '0' : ''}${minute} PM`;
            await spinningMessage.edit({
                content: `You should go makan at ${formattedTime}. Happy makan!`,
            });
        }, 2000); 
    } else if (commandName === 'geraksolat') {
        setTimeout(async () => {
            const hour = 12;
            const minStart = 30;
            const minEnd = 60;
            const minute = Math.floor(Math.random() * (minEnd - minStart) + minStart); // Random minute between 30 and 59
            const formattedTime = `${hour}:${minute < 10 ? '0' : ''}${minute} PM`;
            await spinningMessage.edit({
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
            await spinningMessage.edit({
                content: `${randomPlace} has been selected! Pergi makan kat sana!`,
            });
        }, 2000); 
    } else if (commandName === 'waktusolat') {
        const location = interaction.options.getString('location'); // User input
        const code = locationCodes[location];

        if (!code) {
            await spinningMessage.edit({ content: 'Invalid location code. Please select a valid location.' });
            return;
        }

        try {
            const response = await axios.get(`https://mpt.i906.my/api/prayer/${code}`);
            const data = response.data.data;
            
            const today = new Date().getDate();
            const timesForToday = data.times[today - 1];

            if (!timesForToday) {
                await spinningMessage.edit({ content: 'No prayer times available for today.' });
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

            await spinningMessage.edit({ content: '', embeds: [embed] });
        } catch (error) {
            console.error(error);
            await spinningMessage.edit({ content: 'Failed to fetch prayer times. Please try again later.' });
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
    
        await spinningMessage.edit({ content: '', embeds: [embed] });
    }
});

client.login(token);