import {
    Message,
    Client,
    Interaction,
    SlashCommandBuilder,
    Events,
    ChatInputCommandInteraction,
    GatewayIntentBits,
} from 'discord.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';
import Datastore from 'nedb-promises';

const discordToken = process.env.TOKEN;

/* interface */

interface Command {
    data: { name: string; description: string };
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
// interface of database
interface tokenData {
    token: string;
    guildId: string;
}

/* config */
// if ./db directory does not exist, create it.
(() => {
    if (!fs.existsSync('./db')) {
        fs.mkdirSync('./db');
        console.log('db directory created.');
    } else {
        console.log('db directory already exists.');
    }
})();

const db = Datastore.create('./db/ai.db');
let activeGuilds: string[] = [];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const checkIfActive = (guildId: string) => activeGuilds.includes(guildId);
const aiLogs = (guildId: string) => {
    const isActive = checkIfActive(guildId);
    return isActive ? 'AI is active.' : 'AI is inactive.';
};

const commands: Command[] = [
    {
        data: new SlashCommandBuilder().setName('ping').setDescription('pong!'),
        execute: async (interaction) => {
            await interaction.reply('pong!');
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('comeai')
            .setDescription('come ai'),
        execute: async (interaction) => {
            const guildId = interaction.guildId as string;
            // if database does not have token data, return.
            const tokens = await db.find({ guildId: guildId });
            if (tokens.length === 0) {
                await interaction.reply('Token is not set.');
                return;
            }
            //if guildId is already in activeGuilds, return.
            if (checkIfActive(guildId)) {
                await interaction.reply('AI is already active.');
                return;
            }
            activeGuilds.push(guildId);
            await interaction.reply(aiLogs(guildId));
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('byeai')
            .setDescription('bye ai'),
        execute: async (interaction) => {
            const guildId = interaction.guildId as string;
            if (!checkIfActive(guildId)) {
                await interaction.reply('AI is already inactive.');
                return;
            }
            activeGuilds = activeGuilds.filter(
                (guildId) => guildId !== guildId
            );
            await interaction.reply(aiLogs(guildId));
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('inittoken')
            .setDescription('set openai api token')
            .addStringOption((option) =>
                option
                    .setName('token')
                    .setDescription('openai api token')
                    .setRequired(true)
            ),
        execute: async (interaction) => {
            const token = interaction.options.getString('token');
            const guildId = interaction.guildId;
            // if guildId is already in database, return.
            const tokens = await db.find({ guildId: guildId });
            if (tokens.length !== 0) {
                await interaction.reply('Token is already set.');
                return;
            }
            if (token === null || guildId === null) {
                await interaction.reply('Error occurred.');
                return;
            }
            const insData: tokenData = { token, guildId };
            await db.insert(insData);
            await interaction.reply({ content: 'Token set successfully. ', ephemeral: true });
        },
    },
    {
        data: new SlashCommandBuilder().setName('removetoken').setDescription('remove openai api token'),
        execute: async (interaction) => {
            const guildId = interaction.guildId;
            if (guildId === null) {
                await interaction.reply('Error occurred.');
                return;
            }
            const tokens = await db.find({ guildId: guildId });
            if (tokens.length === 0) {
                await interaction.reply('Token is not set.');
                return;
            }
            await db.remove({ guildId: guildId }, { multi: true });
            await interaction.reply({ content: 'Token removed successfully. ', ephemeral: true });
        },
    },
    {
        data: new SlashCommandBuilder().setName('edittoken').setDescription('edit openai api token').addStringOption((option) =>
            option
                .setName('token')
                .setDescription('openai api token')
                .setRequired(true)
        ),
        execute: async (interaction) => {
            const token = interaction.options.getString('token');
            const guildId = interaction.guildId;
            if (token === null || guildId === null) {
                await interaction.reply('Error occurred.');
                return;
            }
            const tokens = await db.find({ guildId: guildId });
            if (tokens.length === 0) {
                await interaction.reply('Token is not set.');
                return;
            }
            await db.update({ guildId: guildId }, { $set: { token: token } });
            await interaction.reply({ content: 'Token edited successfully. ', ephemeral: true });
        },
    }
];

client.once(Events.ClientReady, (c: Client) => {
    console.log(`Ready! Logged in as ${c.user?.tag}`);
    c.application?.commands.set(Array.from(commands.map((command) => command.data))).then(() => {
        console.log('Commands set.');
    });
});

client.on(Events.MessageCreate, async (message: Message) => {
    const guildId = message.guildId;
    if (message.author.bot) {
        return;
    } else if (!checkIfActive(guildId || '')) {
        return;
    }
    const token = (await db.findOne({ guildId: message.guildId }) as tokenData).token;
    try {
        message.channel.sendTyping();
        const openai = new OpenAIApi(
            new Configuration({ apiKey: token })
        );
        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message.content }],
        });
        message.channel.sendTyping();
        if (completion.data.choices[0].message === undefined) {
            throw new Error('No response from AI.');
        }
        await message.channel.send({
            content: completion.data.choices[0].message.content,
            reply: { messageReference: message.id },
            allowedMentions: { repliedUser: false },
        });
    } catch (err) {
        console.error(err);
        const errMsg = err as Error;
        message.channel.send('Error occurred.\n' + errMsg.message);
    }
});

/* command handling */
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const commandName = interaction.commandName;
    const command = commands.find(
        (command) => command.data.name === commandName
    );
    if (!command) {
        // command is not found
        return;
    }
    try {
        // execute command
        await command.execute(interaction as ChatInputCommandInteraction);
        console.log(`Command ${commandName} executed.`);
        console.log(`activeGuilds: ${activeGuilds}`);
    } catch (error) {
        // error occurred
        console.error(error);
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        });
    }
});

client.login(discordToken);
