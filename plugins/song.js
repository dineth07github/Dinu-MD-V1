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

    // YouTube Search safely
    const search = await yts(q).catch(() => null);
    if (!search || !search.videos || search.videos.length === 0)
      return reply("❌ No results found!");

    const data = search.videos[0];
    const url = data?.url;
    if (!url) return reply("❌ Could not get song URL.");

    // Info message with thumbnail
    const desc = `
🎶 *Song Downloader*
🎬 *Title:* ${data?.title || "Unknown"}
⏱️ *Duration:* ${data?.timestamp || "Unknown"}
👀 *Views:* ${data?.views?.toLocaleString() || "N/A"}
🔗 *Watch Here:* ${url}
`;

    // Send thumbnail & info
    await danuwa.sendMessage(
      from,
      { image: { url: data?.thumbnail || "" }, caption: desc },
      { quoted: mek }
    );

    // Stream audio safely
    try {
      await danuwa.sendMessage(
        from,
        {
          audio: ytdl(url, { filter: "audioonly", quality: "highestaudio" }),
          mimetype: "audio/mpeg",
          ptt: false
        },
        { quoted: mek }
      );
    } catch (audioErr) {
      console.error("Audio download error:", audioErr);
      reply("❌ Could not download the audio.");
    }

  } catch (e) {
    console.error("Song command error:", e);
    reply(`❌ Error: ${e.message}`);
  }
});
