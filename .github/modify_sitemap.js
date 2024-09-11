const fs = require("fs");
const yargs = require("yargs");

// Define the input and output file

const argv = yargs
  .option("new-domain", {
    alias: "n",
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

// Get the new domain and input file from command-line arguments
const newDomain = argv["new-domain"];
const inputFile = argv["input-file"];
fs.readFile(inputFile, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  const pattern = /https:\/\/([^.]*\.)?deriv\.(com|be|me)/g;
  const newContent = data.replace(pattern, `https://${newDomain}`);

  const urlBlockPattern = /(<url>[\s\S]*?<\/url>)/g;

  let filteredContent = newContent.replace(urlBlockPattern, (match) => {
    if (/https:\/\/deriv\.com(\/[a-z-]{2,5})?\/eu\//.test(match)) {
      return "";
    }
    return match;
  });

  fs.writeFile(inputFile, filteredContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing the file:", err);
      return;
    }
    console.log("URLs have been replaced successfully.");
  });
});
