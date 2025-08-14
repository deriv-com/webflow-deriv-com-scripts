const fs = require("fs");
const yargs = require("yargs");
const xml2js = require("xml2js");
const _ = require("lodash");

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

      // Clean up common XML issues before parsing
      let cleanedData = data;

      // Fix common XML entity issues
      // Replace unescaped & characters that are not part of valid entities
      cleanedData = cleanedData.replace(/&(?![a-zA-Z0-9#]{1,7};)/g, "&amp;");

      // Fix any malformed entities
      cleanedData = cleanedData.replace(/&([^;]*);/g, (match, entity) => {
        // Check if it's a valid XML entity
        const validEntities = ["amp", "lt", "gt", "quot", "apos"];
        const numericEntity =
          /^#\d+$/.test(entity) || /^#x[0-9a-fA-F]+$/.test(entity);

        if (validEntities.includes(entity) || numericEntity) {
          return match; // Keep valid entities
        }

        // For invalid entities, escape the ampersand
        return "&amp;" + entity + ";";
      });

      // Remove any control characters that might cause issues
      cleanedData = cleanedData.replace(
        /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
        ""
      );

      const parser = new xml2js.Parser({
        // Add options to be more lenient with XML parsing
        trim: true,
        normalize: true,
        explicitArray: true,
        mergeAttrs: false,
      });

      parser.parseString(cleanedData, (err, result) => {
        if (err) {
          console.error(`Detailed XML parsing error for ${filePath}:`);
          console.error(`Error: ${err.message}`);

          // Try to show the problematic line if possible
          if (err.message.includes("Line:")) {
            const lines = cleanedData.split("\n");
            const lineMatch = err.message.match(/Line: (\d+)/);
            const colMatch = err.message.match(/Column: (\d+)/);

            if (lineMatch) {
              const lineNum = parseInt(lineMatch[1]) - 1;
              const colNum = colMatch ? parseInt(colMatch[1]) - 1 : 0;

              if (lines[lineNum]) {
                console.error(
                  `Problematic line ${lineNum + 1}: ${lines[lineNum]}`
                );
                if (colNum > 0) {
                  console.error(
                    `Problem at column ${colNum + 1}: "${lines[
                      lineNum
                    ].substring(Math.max(0, colNum - 10), colNum + 10)}"`
                  );
                }

                // Try to fix the specific line and retry parsing
                console.log(
                  "Attempting to fix the problematic line and retry..."
                );
                let fixedData = cleanedData;
                const problematicLine = lines[lineNum];

                // Additional fixes for common XML issues
                let fixedLine = problematicLine
                  .replace(/&(?![a-zA-Z0-9#]{1,7};)/g, "&amp;") // Fix unescaped ampersands
                  .replace(/</g, "&lt;") // Escape < characters in content
                  .replace(/>/g, "&gt;") // Escape > characters in content
                  .replace(/&lt;(\/?[a-zA-Z][^>]*)&gt;/g, "<$1>") // Restore XML tags
                  .replace(/&lt;!\[CDATA\[/g, "<![CDATA[") // Restore CDATA sections
                  .replace(/\]\]&gt;/g, "]]>"); // Restore CDATA end

                lines[lineNum] = fixedLine;
                fixedData = lines.join("\n");

                // Try parsing again with the fixed data
                const retryParser = new xml2js.Parser({
                  trim: true,
                  normalize: true,
                  explicitArray: true,
                  mergeAttrs: false,
                });

                retryParser.parseString(fixedData, (retryErr, retryResult) => {
                  if (retryErr) {
                    console.error(
                      "Retry parsing also failed:",
                      retryErr.message
                    );
                    reject(`Error parsing XML from ${filePath}: ${err}`);
                  } else {
                    console.log(
                      "Successfully parsed XML after fixing problematic line"
                    );
                    resolve(retryResult);
                  }
                });
                return;
              }
            }
          }

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
    return !url.match(/deriv\.(com|be|me)\/academy/);
  });

  return stagingSitemap;
}

// Function to filter out URLs with '/ae/' or '/ae' in academySitemap
function filterAeUrls(sitemap) {
  if (!sitemap.urlset || !sitemap.urlset.url) {
    return sitemap;
  }

  sitemap.urlset.url = sitemap.urlset.url.filter((urlObj) => {
    if (!urlObj.loc || urlObj.loc.length === 0) {
      return true;
    }

    const url = urlObj.loc[0];

    // Check for various patterns of '/ae' in the URL
    if (url.includes("/ae/")) return false; // URLs containing /ae/ anywhere
    if (url.endsWith("/ae")) return false; // URLs ending with /ae
    if (url.endsWith("/ae/")) return false; // URLs ending with /ae/

    // Check for /ae as a path segment (e.g., /academy/ae or /academy/ae/)
    const urlParts = new URL(url).pathname.split("/");
    if (urlParts.includes("ae")) return false;

    return true;
  });

  return sitemap;
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
    "https://deriv.com/derivlife-search",
    "https://deriv.com/blog-search",
    "https://deriv.com/derivtech-search",
    "https://deriv.com/newsroom/newsroom-search",
    "https://deriv.com/blog/posts/eur-usd-forecast-dollar-weakness",
    "https://deriv.com/fr/blog/posts/price-weighted-vs-market-cap-weighted-indices",
    "https://deriv.com/fr/blog/posts/5-strategies-to-balance-risk-and-reward-in-trading",
  ];

  const excludedPatterns = [
    "/partners-help-centre-questions/",
    "/blog-categories/press-releases-2",
  ];

  const safeNewDomain = _.escapeRegExp(newDomain);
  const locPattern = new RegExp(
    `https://${safeNewDomain}\/[^\/]+\/locations`,
    "i"
  );
  const locDirectPattern = new RegExp(
    `https://${safeNewDomain}\/locations\/`,
    "i"
  );

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
    if (
      new RegExp(`https://${safeNewDomain}(\/[a-z-]{2,5})?\/eu(\/)?`).test(url)
    ) {
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

    console.log("Replacing domains in sitemaps...");
    const processedStagingSitemap = replaceDomains(stagingSitemap, newDomain);

    console.log("Filtering academy URLs from staging sitemap...");
    const filteredStagingSitemap = filterAcademyUrls(processedStagingSitemap);

    console.log(
      "Filtering out URLs containing '/ae' path segment from academy sitemap..."
    );
    const filteredAcademySitemap = filterAeUrls(academySitemap);

    const processedAcademySitemap = replaceDomains(
      filteredAcademySitemap,
      `${newDomain}/academy`
    );

    console.log("Combining sitemaps...");
    const combinedSitemap = combineSitemaps(
      filteredStagingSitemap,
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
        indent: "    ", // Use 4 spaces for indentation to match original format
        newline: "\n",
      },
      xmldec: { version: "1.0", encoding: "UTF-8" },
    });

    let xml = builder.buildObject(finalSitemap);

    // Additional formatting to match the original sitemap format
    // Add line breaks around <loc> tags
    xml = xml.replace(
      /<loc>([^<]+)<\/loc>/g,
      "<loc>\n            $1\n        </loc>"
    );

    // Ensure the closing urlset tag is properly formatted
    if (!xml.endsWith("</urlset>")) {
      if (xml.endsWith("</urlset")) {
        xml += ">";
      } else {
        xml += "\n</urlset>";
      }
    }

    // Ensure there's a newline at the end of the file
    if (!xml.endsWith("\n")) {
      xml += "\n";
    }

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
