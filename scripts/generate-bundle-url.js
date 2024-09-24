// scripts/generate-latest-url.js
const { exec } = require('child_process');

// Define your GitHub repository details
const repoName = 'deriv-com/webflow-deriv-com-scripts';
const filePath = 'src/bundle-script.min.js';

// Step 1: Get the latest commit hash
exec('git rev-parse HEAD', (err, stdout, stderr) => {
  if (err) {
    console.error(`Error getting latest commit hash: ${stderr}`);
    process.exit(1);
  }

  const latestCommitHash = stdout.trim();

  // Step 2: Generate the URL with the latest commit hash
  const generatedUrl = `https://cdn.jsdelivr.net/gh/${repoName}@${latestCommitHash}/${filePath}`;
  console.log(`Generated URL: ${generatedUrl}`);
});
