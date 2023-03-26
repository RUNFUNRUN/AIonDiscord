import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import { register } from './register.js';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let AiActive = false;

const AiLogs = () => {
  if (AiActive) {
    console.log('AI is active.');
  } else {
    console.log('AI is inactive.');
  }
}

const commands = {
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
  }
};

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

async function onInteraction(interaction) {
  if (!interaction.isCommand()) {
    return;
  }
  return commands[interaction.commandName](interaction);
};

client.on('interactionCreate', (interaction) =>
  onInteraction(interaction).catch((err) => console.error(err))
);

client.login(process.env.TOKEN).catch((err) => {
  console.error(err);
  process.exit(-1);
});

register().catch((err) => console.error(err));
client.once('ready', () => {
  console.log('Bot is ready!');
  return;
});

client.on('messageCreate', async (message) => {
  if (AiActive) {
    if (message.author.bot) return;
    try {
      message.channel.sendTyping();
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `${message.content}`,
        max_tokens: 1024,
        temperature: 0.5,
      });
      if (response.data.choices[0].text === undefined) {
        throw new Error('No response from AI.');
      }
      await message.channel.send({
        content: response.data.choices[0].text,
        reply: { messageReference: message.id },
        allowedMentions: { repliedUser: false },
      });
    }
    catch (err) {
      console.error(err);
    }
  }
});
