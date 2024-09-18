
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const srcFile = path.join(rootDir, "dist/js/footer_scripts.min.js");
const destFile = path.join(rootDir, "src/bundle-script.min.js");

// Step 1: Run the build command
exec("npm run build", { cwd: rootDir }, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error during build: ${stderr}`);
    process.exit(1);
  }
  console.log(stdout);

  // Step 2: Copy the file from dist/js/footer_scripts.min.js to src/bundle-script.min.js
  fs.copyFile(srcFile, destFile, (copyErr) => {
    if (copyErr) {
      console.error(`Error copying file: ${copyErr.message}`);
      process.exit(1);
    }

    // Step 3: Add the file to git
    exec(
      `git add ${destFile}`,
      { cwd: rootDir },
      (gitErr, gitStdout, gitStderr) => {
        if (gitErr) {
          console.error(`Error adding file to git: ${gitStderr}`);
          process.exit(1);
        }
      }
    );
  });
});
