const { cmd } = require("../command");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

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

      // Search YouTube if query is not a URL
      let videoUrl = q;
      if (!ytdl.validateURL(q)) {
        const search = await yts(q);
        if (!search.videos.length) return reply("❌ *No video found!*");
        videoUrl = search.videos[0].url;
      }

      const info = await ytdl.getInfo(videoUrl);
      const videoDetails = info.videoDetails;

      // Video info message
      let desc = `
YouTube Video Downloader
🎬 *Title:* ${videoDetails.title}
⏱️ *Duration:* ${new Date(videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8)}
👀 *Views:* ${parseInt(videoDetails.viewCount).toLocaleString()}
🔗 *Watch Here:* ${videoDetails.video_url}
`;
      await danuwa.sendMessage(
        from,
        { image: { url: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url }, caption: desc },
        { quoted: mek }
      );

      // Choose the highest quality format
      const format = ytdl.chooseFormat(info.formats, { quality: "highestvideo" });
      const fileSize = parseInt(format.contentLength || 0, 10);

      if (!fileSize || fileSize > 50 * 1024 * 1024) {
        return reply("⏳ *Sorry, videos larger than 50MB cannot be sent.*");
      }

      // Save temp file
      const tempPath = path.join(__dirname, `${videoDetails.videoId}.mp4`);
      const stream = ytdl(videoUrl, { format });
      const writeStream = fs.createWriteStream(tempPath);
      stream.pipe(writeStream);

      writeStream.on("finish", async () => {
        // Send video
        await danuwa.sendMessage(
          from,
          { video: fs.readFileSync(tempPath), caption: `🎬 *${videoDetails.title}*`, mimetype: "video/mp4" },
          { quoted: mek }
        );

        // Send as document
        await danuwa.sendMessage(
          from,
          {
            document: fs.readFileSync(tempPath),
            fileName: `${videoDetails.title}.mp4`,
            mimetype: "video/mp4",
            caption: "📥 *Your video is ready!*",
          },
          { quoted: mek }
        );

        fs.unlinkSync(tempPath); // clean up
      });
    } catch (e) {
      console.log(e);
      reply(`❌ *Error:* ${e.message} 😞`);
    }
  }
);
