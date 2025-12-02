import fs from "fs";
import http from "http";
import https from "https";

const port = 8000;

fs.readFile("file.txt", "utf-8", (err, data) => {
  if (err) {
    console.log("Something fishy happening in the background!", err);
  }
  console.log("This is the file's content:\n", data);
});

let server = http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("This is the end!!!");
  })

server.listen(8000, () => {
    console.log("this is this")
})

global.val = 22;
console.log(val);

// https.get("https://www.w3schools.com/", (res) => {
//   let data = "";
//   res.on("readable", (chunk) => (data += chunk));
//   res.on("end", () => console.log(data));
// });
