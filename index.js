const express = require("express");
const fs = require("fs");
let cors = require("cors");
const http = require("https");

const app = express();

const port = 3000;

app.use(cors());
app.use(express());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/videoplayer", (req, res) => {
  const range = req.headers.range;
  const videoPath = "./tmp/video.mp4";
  const videoSize = fs.statSync(videoPath).size;
  const chunkSize = 1 * 1e6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const stream = fs.createReadStream(videoPath, {
    start,
    end,
  });
  stream.pipe(res);
});

app.listen(port, () => {
  console.log(`Example app listen at http://localhost:${port}`);

  const file = fs.createWriteStream("./tmp/video.mp4");
  const request = http
    .get("https://res.cloudinary.com/dtv9lwjso/video/upload/v1694956219/video_w5ta68.mp4", function (response) {
      response.pipe(file);

      console.log(response.statusCode);
      console.log(response.statusMessage);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        console.log("Download Completed");
      });

      file.on("error", (e) => {
        console.log("Error Occured!", e);
      });
    })
    .on("error", (e) => {
      console.log("Error Occured!", e);
    });
});

module.exports = app;
