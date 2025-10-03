const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const distDir = path.resolve(__dirname, "./dist");
const prodLicenseFile = "THIRD-PARTY-LICENSES.txt";
const prodFaviconFile = "favicon.ico";
const delRegex3rd = /^THIRD-PARTY-LICENSES(?:\.dev|\.[a-f0-9]{8,32})?\.txt$/;
const repRegex3rd = /THIRD-PARTY-LICENSES(?:\.dev|\.[a-f0-9]{8,32})?\.txt/g;
const delRegexFavi = /^favicon(?:\.[a-f0-9]{8,32})?\.ico$/;
const repRegexFavi = /favicon\.ico/g;
const indexHtmlFile = path.join(distDir, "index.html");

// 1) Create distDir if needed
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log(`Created missing directory: ${distDir}`);
}

// 2) Delete old files starting with THIRD-PARTY-LICENSES and matching the regex
fs.readdirSync(distDir).forEach(file => {
    if (delRegex3rd.test(file)) {
        fs.unlinkSync(path.join(distDir, file));
        console.log(`Deleted old license file: ${file}`);
    }
});

// 3) Delete old files starting with favicon and matching the regex
fs.readdirSync(distDir).forEach(file => {
    if (delRegexFavi.test(file)) {
        fs.unlinkSync(path.join(distDir, file));
        console.log(`Deleted old favicon file: ${file}`);
    }
});

// 3) execute webpack --mode=production
console.log("Running webpack build...");
execSync("webpack --mode=production", { stdio: "inherit" });

// 4) Read prod license file and derive hash
const licenseFile = path.join(distDir, prodLicenseFile);
const licenseText = fs.readFileSync(licenseFile, "utf-8");
const licenseHash = crypto.createHash("md5").update(licenseText).digest("hex").slice(0, 16);

// 5) Copy prod license file to new hashed license file
const hashedLicenseFile = `THIRD-PARTY-LICENSES.${licenseHash}.txt`;
fs.copyFileSync(licenseFile, path.join(distDir, hashedLicenseFile));
console.log(`Copied ${prodLicenseFile} → ${hashedLicenseFile}`);

// 6) Read prod favicon file and derive hash
const faviconFile = path.join(distDir, prodFaviconFile);
const faviconBuffer = fs.readFileSync(faviconFile);
const faviconHash = crypto.createHash("md5").update(faviconBuffer).digest("hex").slice(0, 16);

// 7) Copy prod favicon file to new hashed license file
const hashedFaviconFile = `favicon.${faviconHash}.ico`;
fs.copyFileSync(faviconFile, path.join(distDir, hashedFaviconFile));
console.log(`Copied ${prodFaviconFile} → ${hashedFaviconFile}`);

// 6) adapt dist/index.html
let indexHtml = fs.readFileSync(indexHtmlFile, "utf-8");
indexHtml = indexHtml.replace(repRegex3rd, hashedLicenseFile);
indexHtml = indexHtml.replace(repRegexFavi, hashedFaviconFile);
fs.writeFileSync(indexHtmlFile, indexHtml, "utf-8");
console.log(`Updated index.html with new license file ${hashedLicenseFile} and new favicon file ${hashedFaviconFile}`);