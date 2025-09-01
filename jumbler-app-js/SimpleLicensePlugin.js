const crypto = require("crypto");
const { Compilation, sources } = require("webpack");

class SimpleLicensePlugin {
  constructor(options = {}) {
    this.outputFilename = options.outputFilename || "THIRD-PARTY-LICENSES.dev.txt";
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap("SimpleLicensePlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "SimpleLicensePlugin",
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const now = new Date();
          const zurichTime = now.toLocaleString("de-CH", { timeZone: "Europe/Zurich" });
          const ms = String(now.getMilliseconds()).padStart(3, "0");
          const timeStamp = `${zurichTime}.${ms}`;
          // MD5-Hash für den Dateinamen
          const licenseText =
            "<placeholder for license text content of dependencies installed in node_modules>\n"
            + "Generated on: " + timeStamp + "\n";
          const hash = crypto.createHash("md5").update(licenseText).digest("hex").slice(0, 8);

          // Asset hinzufügen
          compilation.emitAsset(this.outputFilename, new sources.RawSource(licenseText));

          console.log("Generated license file:", this.outputFilename);
        }
      );
    });
  }
}

module.exports = SimpleLicensePlugin;
