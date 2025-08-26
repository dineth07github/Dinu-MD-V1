const { cmd } = require("../command");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

cmd({
  pattern: "song",
  react: "🎶",
  desc: "Download Song from YouTube",
  category: "download",
  filename: __filename
}, async (danuwa, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a song name or YouTube link");

    const search = await yts(q);
    if (!search.videos || search.videos.length === 0)
      return reply("❌ No results found!");

    const data = search.videos[0];
    const url = data.url;

    let desc = `
🎶 *Song Downloader*
🎬 *Title:* ${data.title || "Unknown"}
⏱️ *Duration:* ${data.timestamp || "Unknown"}
👀 *Views:* ${data.views ? data.views.toLocaleString() : "N/A"}
🔗 *Watch Here:* ${data.url}
`;

    // Send video info first
    await danuwa.sendMessage(
      from,
      { image: { url: data.thumbnail }, caption: desc },
      { quoted: mek }
    );

    // Temp file path
    const filePath = path.join(__dirname, "../temp", `${Date.now()}.mp3`);

    // Download audio
    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio",
    });

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    writeStream.on("finish", async () => {
      await danuwa.sendMessage(
        from,
        {
          audio: { url: filePath },
          mimetype: "audio/mpeg",
        },
        { quoted: mek }
      );

      // Cleanup
      fs.unlinkSync(filePath);
    });

    stream.on("error", (err) => {
      console.error(err);
      reply("❌ Error downloading audio.");
    });

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});
