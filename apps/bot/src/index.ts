import "dotenv/config";
import {
  Client, Events, GatewayIntentBits, REST, Routes,
  SlashCommandBuilder
} from "discord.js";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const apiUrl = process.env.YANAGI_API_URL;
const apiToken = process.env.YANAGI_API_TOKEN;

if (!token || !clientId || !apiUrl || !apiToken) {
  throw new Error("Required env vars: DISCORD_TOKEN, DISCORD_CLIENT_ID, YANAGI_API_URL, YANAGI_API_TOKEN");
}

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("夜凪の応答を確認します"),
  new SlashCommandBuilder()
    .setName("points")
    .setDescription("自分のポイントを確認します")
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(token);
await rest.put(Routes.applicationCommands(clientId), { body: commands });

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`🌙 Yanagi logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply({ content: "Pong! 🌙", ephemeral: true });
    return;
  }

  if (interaction.commandName === "points") {
    if (!interaction.guildId) {
      await interaction.reply({ content: "サーバー内で実行してください。", ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const response = await fetch(
        `${apiUrl}/internal/points/${interaction.guildId}/${interaction.user.id}`,
        { headers: { authorization: `Bearer ${apiToken}` } }
      );
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json() as { balance: number };
      await interaction.editReply(`🪙 あなたの所持ポイント：**${data.balance}**`);
    } catch (error) {
      console.error(error);
      await interaction.editReply("ポイントを取得できませんでした。APIの状態を確認してください。");
    }
  }
});

await client.login(token);
