# Discord Bot by Firdaus

This is a Discord bot built using Node.js and Discord.js. It includes various commands and scheduled tasks to enhance user experience in a Discord server.

## Features

- **Scheduled Messages**: Sends daily reminders at specified times.
- **Commands**:
  - `/ping` - Responds with "Pong!".
  - `/gerakmakan` - Suggests a random time between 12 PM and 1 PM for makan.
  - `/geraksolat` - Suggests a random time between 12:30 PM and 1 PM for solat.
  - `/makanmana` - Suggests a random place to eat from a list.
  - `/waktusolat` - Shows prayer times based on the location.
  - `/lokasiwaktusolat` - Lists all available location codes for prayer times.
  - `/quest` - Reminds everyone to check their daily quest from OwO bot.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/your-repository.git
   cd your-repository

2. **Install dependencies**:
    ```bash
    npm install

3. **Create a .env file in the root directory and add your environment variables:**:
    ```bash
    DISCORD_TOKEN=your-discord-bot-token
    CLIENT_ID=your-client-id
    GUILD_ID=your-guild-id
    CHANNEL_ID=your-channel-id
    GAME_CHANNEL_ID=your-channel-id

4. **Run the bot**:
    ```bash
    node index.js

## Usage
  - Starting the Bot: Run the bot using ```node index.js```
  - Commands: Use the / prefix followed by the command name in a Discord channel where the bot has access.
  - Example: To check the time for makan, type **/gerakmakan**.
  - To see prayer times, type **/waktusolat** and provide a location.

## Contributing
  1. Fork the repository.
  2. Create a feature branch (git checkout -b feature/your-feature).
  3. Commit your changes (git commit -am 'Add new feature').
  4. Push to the branch (git push origin feature/your-feature).
  5. Create a new Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](https://en.wikipedia.org/wiki/MIT_License) file for details.

## Acknowledgments
  - [Malaysia Prayer Times](https://mpt.i906.my/) - API used to fetch prayer times data from JAKIM website.
  - [Discord.js](https://discord.js.org/) - The library used for interacting with the Discord API.
  - [Node.js](https://nodejs.org/en) - JavaScript runtime used for running the bot.
  - [Dotenv](https://www.dotenv.org/) - Loads environment variables from a .env file.
