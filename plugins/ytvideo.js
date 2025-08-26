const { cmd } = require("../command");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

cmd(
  {
    pattern: "video",
    react: "📹",
    desc: "Download YouTube Video",
    category: "download",
    filename: __filename,
  },
  async (danuwa, mek, m, { from, q, reply }) => {
    try {
      if (!q) return reply("❌ *Please provide a video name or YouTube link*");

      // Search YouTube
      const search = await yts(q);
      const data = search.videos[0];
      if (!data) return reply("❌ *No video found!*");

      // Video info message
      let desc = `
YouTube Video Downloader
🎬 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📅 *Uploaded:* ${data.ago}
👀 *Views:* ${data.views.toLocaleString()}
🔗 *Watch Here:* ${data.url}
`;
      await danuwa.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Check file size before sending
      const url = data.url;
      const info = await ytdl.getInfo(url);
      const format = ytdl.chooseFormat(info.formats, { quality: "highestvideo" });
      const fileSize = parseInt(format.contentLength || 0, 10);

      if (fileSize > 50 * 1024 * 1024) {
        return reply("⏳ *Sorry, videos larger than 50MB cannot be sent.*");
      }

      // Send video
      await danuwa.sendMessage(
        from,
        { video: { url }, caption: `🎬 *${data.title}*`, mimetype: "video/mp4" },
        { quoted: mek }
      );

      // Optionally send as document
      await danuwa.sendMessage(
        from,
        {
          document: { url },
          fileName: `${data.title}.mp4`,
          mimetype: "video/mp4",
          caption: "📥 *Your video is ready!*",
        },
        { quoted: mek }
      );
    } catch (e) {
      console.log(e);
      reply(`❌ *Error:* ${e.message} 😞`);
    }
  }
);
