// Copies ABIs from the Hardhat artifacts into the frontend after `hardhat compile`.
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "..", "..", "src", "contracts");
for (const name of ["ChatContract", "TokenContract"]) {
  const artifact = require(`../artifacts/contracts/${name}.sol/${name}.json`);
  fs.writeFileSync(
    path.join(out, `${name}.json`),
    JSON.stringify(artifact.abi, null, 2) + "\n"
  );
  console.log(`wrote ${name}.json`);
}
