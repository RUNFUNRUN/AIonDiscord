import { Client, ClientApplication } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const ping = {
  name: 'ping',
  description: 'pong!',
};

const comeai = {
  name: 'comeai',
  description: 'come ai',
};

const byeai = {
  name: 'byeai',
  description: 'bye ai',
};

const commands = [
  ping,
  comeai,
  byeai,
];

const client = new Client({
  intents: 0,
});

client.token = process.env.TOKEN;

export const register = async () => {
  client.application = new ClientApplication(client, {});
  await client.application.fetch();
  if (process.argv[2] == null) {
    client.application.commands.set(commands);
  } else {
    client.application.commands.set(commands, process.argv[2]);
  }
  console.log('The commands were registered successfully!');
};

