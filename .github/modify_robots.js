const fs = require("fs");
const yargs = require("yargs");

// Function to update Sitemap entry in robots.txt
function updateSitemap(inputFile, newSitemapUrl) {
  fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    let newContent;
    if (data.match(/^Sitemap:/m)) {
      newContent = data.replace(
        /^Sitemap: .*/m,
        `Sitemap: https://urls.deriv.com/sitemap.xml`
      );
    } else {
      newContent =
        data + `\nSitemap: https://urls.deriv.com/sitemap.xml`;
    }
    if (data.match(/^Host:/m)) {
      newContent = newContent.replace(/^Host: .*/m, `Host: https://${newSitemapUrl}`);
    }
    fs.writeFile(inputFile, newContent, "utf8", (err) => {
      if (err) {
        console.error("Error writing the file:", err);
        return;
      }
      console.log("Sitemap entry has been updated in", inputFile);
    });
  });
}

const argv = yargs
  .option("sitemap-url", {
    alias: "s",
    description: "The new domain to replace in the sitemap",
    type: "string",
    demandOption: true,
  })
  .option("input-file", {
    alias: "i",
    description: "The input sitemap file",
    type: "string",
    demandOption: true,
  })
  .help()
  .alias("help", "h").argv;
if (process.argv.length !== 6) {
  console.error("Usage: node update_robots.js <robots_url> <new_sitemap_url>");
  process.exit(1);
}
const inputFile = argv["input-file"];
const newSitemapUrl = argv["sitemap-url"];
updateSitemap(inputFile, newSitemapUrl);
