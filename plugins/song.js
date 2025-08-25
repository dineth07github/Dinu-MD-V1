const { cmd } = require("../command");
const yts = require("yt-search");
const { ytmp3 } = require("@vreden/youtube_scraper");

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

    await danuwa.sendMessage(
      from,
      { image: { url: data.thumbnail }, caption: desc },
      { quoted: mek }
    );

    let songData;
    try {
      songData = await ytmp3(url, "192");
      if (!songData?.download?.url) {
        return reply("❌ Could not fetch download link. Video may be restricted.");
      }
    } catch (err) {
      console.log(err);
      return reply("❌ Error fetching download link: " + err.message);
    }

    await danuwa.sendMessage(
      from,
      {
        audio: { url: songData.download.url },
        mimetype: "audio/mpeg",
      },
      { quoted: mek }
    );

  } catch (e) {
    console.log(e);
    reply(`❌ Error: ${e.message}`);
  }
});
