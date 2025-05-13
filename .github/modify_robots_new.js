const fs = require("fs");
const yargs = require("yargs");

// Function to generate a robots.txt file with the correct content
function generateRobotsTxt(outputFile, domain) {
  // Production robots.txt content
  const robotsContent = `User-agent: *
Allow: /
Disallow: /404/
Disallow: /homepage/
Disallow: /landing/
Disallow: /endpoint/
Disallow: /livechat/
Disallow: /storybook/
Disallow: *.binary.sx
Disallow: /?region=*/
Disallow: */eu/*
Disallow: *_page=*
Disallow: *?s=*
Disallow: /cdn-cgi/
Disallow: *?term=*
Disallow: *?login_challenge=*
Disallow: *?question=*
Sitemap: https://${domain}/sitemap.xml
`;

  fs.writeFile(outputFile, robotsContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing the robots.txt file:", err);
      process.exit(1);
    }
    console.log("robots.txt has been generated at", outputFile);
  });
}

const argv = yargs
  .option("domain", {
    alias: "d",
    description: "The domain for the sitemap URL",
    type: "string",
    demandOption: true,
  })
  .option("output-file", {
    alias: "o",
    description: "The output robots.txt file",
    type: "string",
    demandOption: true,
  })
  .help()
  .alias("help", "h").argv;

const domain = argv["domain"];
const outputFile = argv["output-file"];

generateRobotsTxt(outputFile, domain);
