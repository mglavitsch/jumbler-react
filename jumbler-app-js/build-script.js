const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const distDir = path.resolve(__dirname, "./dist");
const prodLicenseFile = "THIRD-PARTY-LICENSES.txt";
const delRegex = /^THIRD-PARTY-LICENSES(?:\.dev|\.[a-f0-9]{8})?\.txt$/;
const repRegex = /THIRD-PARTY-LICENSES(?:\.dev|\.[a-f0-9]{8})?\.txt/g;
const indexHtmlFile = path.join(distDir, "index.html");

// 1) Create distDir if needed
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log(`Created missing directory: ${distDir}`);
}

// 2) Delete old files starting with THIRD-PARTY-LICENSES and matching the regex
fs.readdirSync(distDir).forEach(file => {
    if (delRegex.test(file)) {
        fs.unlinkSync(path.join(distDir, file));
        console.log(`Deleted old license file: ${file}`);
    }
});

// 3) execute webpack --mode=production
console.log("Running webpack build...");
execSync("webpack --mode=production", { stdio: "inherit" });

// 4) Read prod license file and derive hash
const licenseFile = path.join(distDir, prodLicenseFile);
const licenseText = fs.readFileSync(licenseFile, "utf-8");
const hash = crypto.createHash("md5").update(licenseText).digest("hex").slice(0, 8);

// 5) Copy prod license file to new hashed license file
const hashedLicenseFile = `THIRD-PARTY-LICENSES.${hash}.txt`;
fs.copyFileSync(licenseFile, path.join(distDir, hashedLicenseFile));
console.log(`Copied ${prodLicenseFile} → ${hashedLicenseFile}`);

// 6) adapt dist/index.html
let indexHtml = fs.readFileSync(indexHtmlFile, "utf-8");
indexHtml = indexHtml.replace(repRegex, hashedLicenseFile);
fs.writeFileSync(indexHtmlFile, indexHtml, "utf-8");
console.log(`Updated index.html with new license file: ${hashedLicenseFile}`);