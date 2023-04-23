import { Client, SlashCommandBuilder, Events, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';
const discordToken = process.env.TOKEN;
const openaiToken = process.env.OPENAI_API_KEY;
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
let AiActive = false;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
const AiLogs = () => AiActive ? 'AI is active.' : 'AI is inactive.';
const ping = new SlashCommandBuilder().setName('ping').setDescription('pong!');
const comeai = new SlashCommandBuilder().setName('comeai').setDescription('come ai');
const byeai = new SlashCommandBuilder().setName('byeai').setDescription('bye ai');
const commands = [
    {
        data: ping,
        execute: async (interaction) => {
            await interaction.reply('pong!');
        },
    },
    {
        data: comeai,
        execute: async (interaction) => {
            AiActive = true;
            AiLogs();
            await interaction.reply('AI is active!');
        },
    },
    {
        data: byeai,
        execute: async (interaction) => {
            AiActive = false;
            AiLogs();
            await interaction.reply('AI is inactive!');
        },
    },
];
const app = client.application;
app?.commands.set(commands.map((command) => command.data));
/* const commands = {
    async ping(interaction) {
        await interaction.reply('pong!');
    },

    async comeai(interaction) {
        AiActive = true;
        AiLogs();
        await interaction.reply('AI is active!');
    },

    async byeai(interaction) {
        AiActive = false;
        AiLogs();
        await interaction.reply('AI is inactive!');
    },
}; */
/* client.on('messageCreate', async (message) => {
    if (AiActive) {
        if (message.author.bot) return;
        try {
            message.channel.sendTyping();
            const completion = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message.content }],
            });
            if (completion.data.choices[0].message.content === undefined) {
                throw new Error('No response from AI.');
            }
            await message.channel.send({
                content: completion.data.choices[0].message.content,
                reply: { messageReference: message.id },
                allowedMentions: { repliedUser: false },
            });
        } catch (err) {
            console.error(err);
        }
    }
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}); */
client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user?.tag}`);
});
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) {
        return;
    }
});
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const commandName = interaction.commandName;
    const command = commands.find((command) => command.data.name === commandName);
    if (!command) {
        return;
    }
    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});
client.login(discordToken);
