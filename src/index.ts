import { Message, Client, Interaction, Collection, SlashCommandBuilder, Events, ChatInputCommandInteraction, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';

const discordToken = process.env.TOKEN;
const openaiToken = process.env.OPENAI_API_KEY;

/* interface */

interface Command {
    data: { name: string, description: string };
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let ifActive = false;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const AiLogs = () => ifActive ? 'AI is active.' : 'AI is inactive.';


const ping = new SlashCommandBuilder().setName('ping').setDescription('pong!');
const comeai = new SlashCommandBuilder().setName('comeai').setDescription('come ai');
const byeai = new SlashCommandBuilder().setName('byeai').setDescription('bye ai');

const commands: Command[] = [
    {
        data: ping,
        execute: async (interaction) => {
            await interaction.reply('pong!');
        },
    },
    {
        data: comeai,
        execute: async (interaction) => {
            ifActive = true;
            await interaction.reply(AiLogs());
        },
    },
    {
        data: byeai,
        execute: async (interaction) => {
            ifActive = false;
            AiLogs();
            await interaction.reply(AiLogs());
        },
    },
];

const app = client.application;
app?.commands.set(commands.map((command) => command.data));

client.once(Events.ClientReady, (c: Client) => {
    console.log(`Ready! Logged in as ${c.user?.tag}`);
});

client.on(Events.MessageCreate, async (message: Message) => {
    if (message.author.bot || !ifActive) {
        return;
    }
    try {
        message.channel.sendTyping();
        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message.content }],
        });
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

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const commandName = interaction.commandName;
    const command = commands.find((command) => command.data.name === commandName);
    if (!command) {
        // command is not found
        return;
    }
    try {
        // execute command
        await command.execute(interaction as ChatInputCommandInteraction);
        console.log(`Command ${commandName} executed.\nifActive: ${ifActive}`);
    } catch (error) {
        // error occurred
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(discordToken);
