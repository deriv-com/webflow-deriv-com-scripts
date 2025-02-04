const fs = require("fs");
const yargs = require("yargs");

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
  const xhtmlLinkPattern =
    /(<xhtml:link[^>]*?href="https:\/\/[^\/]+\/[^\/]+\/locations[^"]*"[^>]*?>)/g;
  const linkPattern =
    /(<xhtml:link[^>]*?href="https:\/\/[^\/]+\/[^\/]+[^"]*"[^>]*?>)/g;
  const locPattern = new RegExp(`https://${newDomain}\/[^\/]+\/locations`, "i");
  const locDirectPattern = new RegExp(`https://${newDomain}\/locations\/`, "i");

  const staticDocUrls = [
    "https://deriv.com/signup",
    "https://deriv.com/blog/posts/eur-usd-holds-strong-before-ecb-meeting",
    "https://deriv.com/ko/blog/posts/automated-trading-the-future-is-now-5cc7f",
    "https://deriv.com/zh-cn/blog/posts/benefits-of-forex-trading-f2da0",
    "https://deriv.com/ko/blog/posts/dalembert-strategy-in-deriv-bot-ce538",
    "https://deriv.com/ko/blog/posts/financial-markets-rally-us-inflation-data-close-to-expected-2c856",
    "https://deriv.com/ko/blog/posts/japans-approach-to-currency-intervention-281b0",
    "https://deriv.com/ko/blog/posts/market-recap-week-of-06-10-nov-2023-c51af",
    "https://deriv.com/ko/blog/posts/market-recap-week-of-23-27-oct-2023-8d176",
    "https://deriv.com/ko/blog/posts/market-recap-week-of-30-oct---03-nov-2023-5181a",
    "https://deriv.com/ko/blog/posts/oscars-grind-strategy-in-deriv-bot-d78a7",
    "https://deriv.com/ko/blog/posts/rollover---what-are-rollovers-and-how-they-affect-forex-trading-9c7a2",
    "https://deriv.com/ko/blog/posts/what-influences-commodities-market-prices-a47cd",
    "https://deriv.com/ko/blog/posts/what-is-margin-in-forex-trading-ab49a",
    "https://deriv.com/ko/blog/posts/whats-expected-in-gold-after-the-recent-rally-ff68c",
    "https://deriv.com/es/blog/posts/5-strategies-to-balance-risk-and-reward-in-trading",
    "https://deriv.com/dynamic-trading-specifications",
    "https://deriv.com/locations/guernsey",
    "https://deriv.com/eu/locations/guernsey",
  ];

  let filteredContent = newContent.replace(urlBlockPattern, (match) => {
    // First check if the entire URL block contains any of the static URLs
    const containsExcludedUrl = staticDocUrls.some((url) =>
      match.includes(url)
    );
    if (containsExcludedUrl) {
      return "";
    }

    // Check for EU URLs
    if (/https:\/\/deriv\.com(\/[a-z-]{2,5})?\/eu(\/)?/.test(match)) {
      return "";
    }

    // Check for location URLs
    if (locPattern.test(match) && !locDirectPattern.test(match)) {
      return "";
    }

    // Clean xhtml:link tags
    const cleanedMatch = match.replace(xhtmlLinkPattern, (xhtmlLink) => {
      if (locPattern.test(xhtmlLink) && !locDirectPattern.test(xhtmlLink)) {
        return "";
      }
      if (staticDocUrls.some((url) => xhtmlLink.includes(url))) {
        return "";
      }
      return xhtmlLink;
    });

    return cleanedMatch;
  });

  fs.writeFile(inputFile, filteredContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing the file:", err);
      return;
    }
    console.log("URLs have been replaced successfully.");
  });
});
