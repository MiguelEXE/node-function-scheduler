const fs = require("fs");
const {createHash} = require("crypto");
process.chdir("./build");
if(!fs.existsSync("hashes")) fs.mkdirSync("hashes");
fs.readdirSync(".").forEach(f => {
    if(f == "hashes") return;
    const sha256 = createHash("sha256");
    sha256.update(fs.readFileSync(f));
    fs.writeFileSync(`hashes/${f}.hash`,`${sha256.digest("hex")} ${f}`);
    console.log(`${f}: OK`);
});