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
// Define the new domain
// Read the input file
fs.readFile(inputFile, "utf-8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  // Define the pattern to match the URLs
  const pattern = /https:\/\/([^.]*\.)?deriv\.(com|be|me)/g;

  // Replace the matched URLs with the new domain
  const newContent = data.replace(pattern, `https://${newDomain}`);

  // Write the modified content to the output file
  fs.writeFile(inputFile, newContent, "utf-8", (err) => {
    if (err) {
      console.error("Error writing the file:", err);
      return;
    }
    console.log("URLs have been replaced successfully.");
  });
});
