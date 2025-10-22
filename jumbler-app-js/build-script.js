const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const distDir = path.resolve(__dirname, "./dist");

// index 0 prod file name
// index 1 regex for file deletion
// index 2 regex for filename replacement
// index 3 endcoding
// index 4 referencing html file
const params = {
    license: [
        "THIRD-PARTY-LICENSES.txt",
        /^THIRD-PARTY-LICENSES(?:\.dev|\.[a-f0-9]{8,32})?\.txt$/,
        "utf-8",
        "index.html",
        /THIRD-PARTY-LICENSES(?:\.dev|\.[a-f0-9]{8,32})?\.txt/g
    ],
    favicon: [
        "favicon.ico",
        /^favicon(?:\.[a-f0-9]{8,32})?\.ico$/,
        null,
        "index.html",
        /favicon\.ico/g
    ],
    chart: [
        "AWS-services.svg",
        /^AWS-services(?:\.[a-f0-9]{8,32})?\.svg$/,
        "utf-8",
        "wrapper.html",
        /AWS-services\.svg/g
    ],
    portrait: [
        "portrait-mg.png",
        /^portrait-mg(?:\.[a-f0-9]{8,32})?\.png$/,
        "utf-8",
        "asset-manifest.json",
        /portrait-mg\.png/g
    ]
}

// 1) Create distDir if needed
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log(`Created missing directory: ${distDir}`);
}

// 2) Delete old files
for (const key in params) {
    fs.readdirSync(distDir).forEach(file => {
        if (params[key][1].test(file)) {
            fs.unlinkSync(path.join(distDir, file));
            console.log(`Deleted old ${key} file: ${file}`);
        } else if (params[key][3] === file) {
            fs.unlinkSync(path.join(distDir, file));
            console.log(`Deleted file: ${file}`);
        }
    });
}

// 3) execute webpack --mode=production
console.log("Running webpack build...");
execSync("webpack --mode=production", { stdio: "inherit" });

// 4) Create hashed files and update index.html
const resource = new Map();
resource.set("index.html", fs.readFileSync(path.join(distDir, "index.html"), "utf-8"));
resource.set("wrapper.html", fs.readFileSync(path.join(distDir, "wrapper.html"), "utf-8"));
resource.set("asset-manifest.json", fs.readFileSync(path.join(distDir, "asset-manifest.json"), "utf-8"));
for (const key in params) {
    // 4.1) Derive hash from file
    const absFilename = path.join(distDir, params[key][0]);
    const content = fs.readFileSync(absFilename, params[key][2]);
    const hash = crypto.createHash("md5").update(content).digest("hex").slice(0, 16);
    // 4.2) Create new filename
    const dotIndex = params[key][0].lastIndexOf(".");
    const hashedFilename = `${params[key][0].slice(0, dotIndex)}.${hash}${params[key][0].slice(dotIndex)}`;
    // 4.3) Copy orig file to hashed file
    fs.copyFileSync(absFilename, path.join(distDir, hashedFilename));
    console.log(`Copied ${params[key][0]} → ${hashedFilename}`);
    // 4.4) Update content of html file
    resource.set(params[key][3], resource.get(params[key][3]).replace(params[key][4], hashedFilename));
    console.log(`Updated ${params[key][3]} content with new ${key} file ${hashedFilename}`);
}
fs.writeFileSync(path.join(distDir, "index.html"), resource.get("index.html"), "utf-8");
console.log("Wrote index.html");
fs.writeFileSync(path.join(distDir, "wrapper.html"), resource.get("wrapper.html"), "utf-8");
console.log("Wrote wrapper.html");
fs.writeFileSync(path.join(distDir, "asset-manifest.json"), resource.get("asset-manifest.json"), "utf-8");
console.log("Wrote asset-manifest.json");

