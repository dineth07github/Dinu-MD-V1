const { cmd } = require("../command");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

cmd({
  pattern: "song",
  react: "🎶",
  desc: "Download Song from YouTube",
  category: "download",
  filename: __filename
}, async (danuwa, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a song name or YouTube link");

    // YouTube Search
    const search = await yts(q);
    if (!search.videos || search.videos.length === 0)
      return reply("❌ No results found!");

    const data = search.videos[0];
    const url = data.url;

    // Info message with thumbnail
    let desc = `
🎶 *Song Downloader*
🎬 *Title:* ${data.title || "Unknown"}
⏱️ *Duration:* ${data.timestamp || "Unknown"}
👀 *Views:* ${data.views ? data.views.toLocaleString() : "N/A"}
🔗 *Watch Here:* ${data.url}
`;
    await danuwa.sendMessage(
      from,
      { image: { url: data.thumbnail }, caption: desc },
      { quoted: mek }
    );

    // Stream audio directly to WhatsApp (no temp file needed)
    await danuwa.sendMessage(
      from,
      {
        audio: ytdl(url, { filter: "audioonly", quality: "highestaudio" }),
        mimetype: "audio/mpeg",
        ptt: false // true 하면 음성메시지(story voice) වගේ යයි
      },
      { quoted: mek }
    );

  } catch (e) {
    console.error("Song command error:", e);
    reply(`❌ Error: ${e.message}`);
  }
});
