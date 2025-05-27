const fs = require("fs");
const yargs = require("yargs");
const xml2js = require("xml2js");

const argv = yargs
  .option("staging-sitemap", {
    alias: "s",
    description: "The staging sitemap file",
    type: "string",
    demandOption: true,
  })
  .option("academy-sitemap", {
    alias: "a",
    description: "The academy sitemap file",
    type: "string",
    demandOption: true,
  })
  .option("output-file", {
    alias: "o",
    description: "The output sitemap file",
    type: "string",
    demandOption: true,
  })
  .option("new-domain", {
    alias: "n",
    description: "The new domain to replace in the sitemap",
    type: "string",
    demandOption: true,
  })
  .help()
  .alias("help", "h").argv;

const stagingSitemapFile = argv["staging-sitemap"];
const academySitemapFile = argv["academy-sitemap"];
const outputFile = argv["output-file"];
const newDomain = argv["new-domain"];

// Function to read and parse XML file
async function readAndParseXml(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(`Error reading file ${filePath}: ${err}`);
        return;
      }

      const parser = new xml2js.Parser();
      parser.parseString(data, (err, result) => {
        if (err) {
          reject(`Error parsing XML from ${filePath}: ${err}`);
          return;
        }
        resolve(result);
      });
    });
  });
}

// Function to filter out academy URLs from staging sitemap
function filterAcademyUrls(stagingSitemap) {
  if (!stagingSitemap.urlset || !stagingSitemap.urlset.url) {
    return stagingSitemap;
  }

  stagingSitemap.urlset.url = stagingSitemap.urlset.url.filter((urlObj) => {
    if (!urlObj.loc || urlObj.loc.length === 0) {
      return true;
    }

    const url = urlObj.loc[0];
    return !url.includes("deriv.com/academy");
  });

  return stagingSitemap;
}

// Function to replace domains in sitemap
function replaceDomains(sitemap, newDomain) {
  if (!sitemap.urlset || !sitemap.urlset.url) {
    return sitemap;
  }

  sitemap.urlset.url.forEach((urlObj) => {
    if (urlObj.loc && urlObj.loc.length > 0) {
      urlObj.loc[0] = urlObj.loc[0].replace(
        /https:\/\/([^.]*\.)?deriv\.(com|be|me)/g,
        `https://${newDomain}`
      );
      urlObj.loc[0] = urlObj.loc[0].replace(
        /https:\/\/academy-v2\.webflow\.io/g,
        `https://${newDomain}`
      );
    }

    // Handle alternate language links if they exist
    if (urlObj["xhtml:link"] && urlObj["xhtml:link"].length > 0) {
      urlObj["xhtml:link"].forEach((link) => {
        if (link.$ && link.$.href) {
          link.$.href = link.$.href.replace(
            /https:\/\/([^.]*\.)?deriv\.(com|be|me)/g,
            `https://${newDomain}`
          );
          link.$.href = link.$.href.replace(
            /https:\/\/academy-v2\.webflow\.io/g,
            `https://${newDomain}`
          );
        }
      });
    }
  });

  return sitemap;
}

// Function to combine sitemaps
function combineSitemaps(stagingSitemap, academySitemap) {
  if (
    !stagingSitemap.urlset ||
    !stagingSitemap.urlset.url ||
    !academySitemap.urlset ||
    !academySitemap.urlset.url
  ) {
    console.error("Invalid sitemap structure");
    return stagingSitemap;
  }

  // Combine URLs from both sitemaps
  stagingSitemap.urlset.url = stagingSitemap.urlset.url.concat(
    academySitemap.urlset.url
  );

  return stagingSitemap;
}

// Function to filter out excluded URLs and patterns
function filterExcludedUrls(sitemap, newDomain) {
  if (!sitemap.urlset || !sitemap.urlset.url) {
    return sitemap;
  }

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

  const excludedPatterns = ["/partners-help-centre-questions/"];

  const locPattern = new RegExp(`https://${newDomain}\/[^\/]+\/locations`, "i");
  const locDirectPattern = new RegExp(`https://${newDomain}\/locations\/`, "i");

  sitemap.urlset.url = sitemap.urlset.url.filter((urlObj) => {
    if (!urlObj.loc || urlObj.loc.length === 0) {
      return false;
    }

    const url = urlObj.loc[0];

    // Check for excluded patterns
    if (excludedPatterns.some((pattern) => url.includes(pattern))) {
      return false;
    }

    // Check for static URLs - more lenient matching like in modify_sitemap.js
    // Check if the URL contains any of the static URLs (not just exact matches)
    if (
      staticDocUrls.some((staticUrl) => {
        const modifiedStaticUrl = staticUrl.replace(
          /https:\/\/([^.]*\.)?deriv\.(com|be|me)/g,
          `https://${newDomain}`
        );
        return url.includes(modifiedStaticUrl);
      })
    ) {
      return false;
    }

    // Check for EU URLs
    if (new RegExp(`https://${newDomain}(\/[a-z-]{2,5})?\/eu(\/)?`).test(url)) {
      return false;
    }

    // Check for location URLs
    if (locPattern.test(url) && !locDirectPattern.test(url)) {
      return false;
    }

    // Filter xhtml:link tags if they exist
    if (urlObj["xhtml:link"] && urlObj["xhtml:link"].length > 0) {
      urlObj["xhtml:link"] = urlObj["xhtml:link"].filter((link) => {
        if (!link.$ || !link.$.href) {
          return true;
        }

        const href = link.$.href;

        // Check for location URLs
        if (locPattern.test(href) && !locDirectPattern.test(href)) {
          return false;
        }

        // Check for static URLs - more lenient matching
        if (
          staticDocUrls.some((staticUrl) => {
            const modifiedStaticUrl = staticUrl.replace(
              /https:\/\/([^.]*\.)?deriv\.(com|be|me)/g,
              `https://${newDomain}`
            );
            return href.includes(modifiedStaticUrl);
          })
        ) {
          return false;
        }

        return true;
      });
    }

    return true;
  });

  return sitemap;
}

// Main function to process sitemaps
async function processSitemaps() {
  try {
    console.log("Reading sitemap files...");
    const stagingSitemap = await readAndParseXml(stagingSitemapFile);
    const academySitemap = await readAndParseXml(academySitemapFile);

    console.log("Filtering academy URLs from staging sitemap...");
    const filteredStagingSitemap = filterAcademyUrls(stagingSitemap);

    console.log("Replacing domains in sitemaps...");
    const processedStagingSitemap = replaceDomains(
      filteredStagingSitemap,
      newDomain
    );
    const processedAcademySitemap = replaceDomains(academySitemap, newDomain);

    console.log("Combining sitemaps...");
    const combinedSitemap = combineSitemaps(
      processedStagingSitemap,
      processedAcademySitemap
    );

    console.log("Filtering excluded URLs...");
    const finalSitemap = filterExcludedUrls(combinedSitemap, newDomain);

    console.log("Writing combined sitemap to output file...");

    // Clean up URLs to remove carriage returns and line feeds
    if (finalSitemap.urlset && finalSitemap.urlset.url) {
      finalSitemap.urlset.url.forEach((urlObj) => {
        if (urlObj.loc && urlObj.loc.length > 0) {
          // Remove carriage returns and line feeds from URLs
          urlObj.loc[0] = urlObj.loc[0].replace(/[\r\n\s]+/g, "");
        }

        // Clean up alternate language links if they exist
        if (urlObj["xhtml:link"] && urlObj["xhtml:link"].length > 0) {
          urlObj["xhtml:link"].forEach((link) => {
            if (link.$ && link.$.href) {
              link.$.href = link.$.href.replace(/[\r\n\s]+/g, "");
            }
          });
        }
      });
    }

    // Configure XML builder to handle line endings properly
    const builder = new xml2js.Builder({
      renderOpts: {
        pretty: true,
        indent: "  ",
        newline: "\n",
      },
      xmldec: { version: "1.0", encoding: "UTF-8" },
    });

    const xml = builder.buildObject(finalSitemap);

    fs.writeFile(outputFile, xml, "utf8", (err) => {
      if (err) {
        console.error("Error writing output file:", err);
        process.exit(1);
      }
      console.log("Combined sitemap has been written to", outputFile);
    });
  } catch (error) {
    console.error("Error processing sitemaps:", error);
    process.exit(1);
  }
}

// Run the main function
processSitemaps();
