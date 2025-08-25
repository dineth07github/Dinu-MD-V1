const { cmd, commands } = require("../command");
const yts = require("yt-search");
const { ytmp3 } = require("@vreden/youtube_scraper");

cmd(
  {
    pattern: "song",
    react: "🎶",
    desc: "Download Song",
    category: "download",
    filename: __filename,
  },
  async (
    danuwa,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("❌ *Please provide a song name or YouTube link*");

      const search = await yts(q);

      // 🔹 Fix: check if result is empty
      if (!search.videos || search.videos.length === 0) {
        return reply("❌ No results found! Try another song name.");
      }

      const data = search.videos[0];
      if (!data) return reply("❌ Failed to fetch video info.");

      const url = data.url;

      let desc = `
🎶 *Song Downloader*
🎬 *Title:* ${data.title || "Unknown"}
⏱️ *Duration:* ${data.timestamp || "Unknown"}
📅 *Uploaded:* ${data.ago || "N/A"}
👀 *Views:* ${data.views ? data.views.toLocaleString() : "N/A"}
🔗 *Watch Here:* ${data.url}
`;

      await danuwa.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      const quality = "192";
      const songData = await ytmp3(url, quality);

      if (!songData?.download?.url) {
        return reply("❌ Could not fetch download link.");
      }

      // 🔹 Fix: safer duration handling
      let durationParts = data.timestamp
        ? data.timestamp.split(":").map(Number)
        : [0];

      let totalSeconds = durationParts
        .reverse()
        .reduce((acc, val, i) => acc + val * 60 ** i, 0);

      if (totalSeconds > 1800) {
        return reply("⏳ *Sorry, audio files longer than 30 minutes are not supported.*");
      }

      await danuwa.sendMessage(
        from,
        {
          audio: { url: songData.download.url },
          mimetype: "audio/mpeg",
        },
        { quoted: mek }
      );

      await danuwa.sendMessage(
        from,
        {
          document: { url: songData.download.url },
          mimetype: "audio/mpeg",
          fileName: `${data.title}.mp3`,
          caption: "🎶 *Your song is ready to be played!*",
        },
        { quoted: mek }
      );

      return reply("✅ Thank you");
    } catch (e) {
      console.log(e);
      reply(`❌ *Error:* ${e.message} 😞`);
    }
  }
);
