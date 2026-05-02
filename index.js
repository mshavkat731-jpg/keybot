const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder,
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  Events 
} = require('discord.js');

const fs = require('fs');

const TOKEN = "YOUR_BOT_TOKEN_HERE";

// 🔥 COOLDOWN (6 SOAT)
const cooldowns = new Map();
const COOLDOWN_TIME = 6 * 60 * 60 * 1000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🔥 PANEL COMMAND
client.on('messageCreate', async (message) => {
  if (message.content === "!panel") {

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("FREE KEYS")
      .setDescription("Click the button below to request a BP Key.")
      .setImage("https://i.postimg.cc/xjRCJ445/Chat-GPT-Image-2-maa-2026-g-22-17-35.png");

    const button = new ButtonBuilder()
      .setCustomId('get_key')
      .setLabel('BP Key')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

// 🔘 BUTTON BOSILGANDA
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'get_key') {

    const userId = interaction.user.id;
    const now = Date.now();

    // ⏱ COOLDOWN CHECK
    if (cooldowns.has(userId)) {
      const lastUsed = cooldowns.get(userId);
      const timeLeft = COOLDOWN_TIME - (now - lastUsed);

      if (timeLeft > 0) {
        const minutes = Math.floor(timeLeft / 60000);
        const hours = Math.floor(minutes / 60);

        return interaction.reply({
          content: `⏳ You can get a new key in ${hours}h ${minutes % 60}m`,
          ephemeral: true
        });
      }
    }

    try {
      let keys = fs.readFileSync('keys.txt', 'utf-8')
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keys.length === 0) {
        return interaction.reply({
          content: "❌ No keys left!",
          ephemeral: true
        });
      }

      const randomIndex = Math.floor(Math.random() * keys.length);
      const key = keys[randomIndex];

      // 🔥 KEYNI O‘CHIRISH
      keys.splice(randomIndex, 1);
      fs.writeFileSync('keys.txt', keys.join('\n'));

      // ⏱ vaqtni saqlash
      cooldowns.set(userId, now);

      // SERVER RESPONSE
      await interaction.reply({
        content: "📩 Your key has been sent to your DM!",
        ephemeral: true
      });

      // 🔥 DM
      await interaction.user.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle("🔑 Your keys are ready!")
            .setDescription(
`Hello ${interaction.user}

Here are your keys — use them responsibly.

⚠️ These keys are **personal** — do not share them.

🎮 **Hack Key**
\`\`\`
${key}
\`\`\``
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ text: "MAMBA SYSTEM • Secure Keys" })
        ]
      });

    } catch (err) {
      console.error(err);

      await interaction.reply({
        content: "❌ Failed to send DM! Enable Direct Messages.",
        ephemeral: true
      });
    }
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);