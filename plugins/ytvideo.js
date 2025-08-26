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
      reply,
    }
  ) => {
    try {
      if (!q) return reply("❌ *Please provide a video name or YouTube link*");

      const search = await yts(q);
      const data = search.videos[0];
      if (!data) return reply("❌ *No video found!*");

      let desc = `
YouTube Video Downloader
🎬 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📅 *Uploaded:* ${data.ago}
👀 *Views:* ${data.views.toLocaleString()}
🔗 *Watch Here:* ${data.url}
`;

      // Send video info first
      await danuwa.sendMessage(
        from,
        { image: { url: data.thumbnail }, caption: desc },
        { quoted: mek }
      );

      // Limit video size to 50 MB for sending via WhatsApp
      const videoStream = ytdl(data.url, { quality: "highestvideo" });
      let size = 0;
      videoStream.on("data", (chunk) => (size += chunk.length));

      videoStream.on("end", async () => {
        // If video is too large
        if (size > 50 * 1024 * 1024) {
          return reply("⏳ *Sorry, videos larger than 50MB cannot be sent.*");
        }

        // Send video
        await danuwa.sendMessage(
          from,
          {
            video: { url: data.url },
            caption: `🎬 *${data.title}*`,
            mimetype: "video/mp4",
          },
          { quoted: mek }
        );

        // Optional: send as document if needed
        await danuwa.sendMessage(
          from,
          {
            document: { url: data.url },
            fileName: `${data.title}.mp4`,
            mimetype: "video/mp4",
            caption: "📥 *Your video is ready!*",
          },
          { quoted: mek }
        );
      });

    } catch (e) {
      console.log(e);
      reply(`❌ *Error:* ${e.message} 😞`);
    }
  }
);
