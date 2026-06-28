import fs from "fs";

for (const locale of ["pl", "en", "de", "es"]) {
  const text = fs.readFileSync(`messages/${locale}.json`, "utf8");
  const keys = [...text.matchAll(/^\s{2}"([^"]+)":/gm)].map((m) => m[1]);
  const dups = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (dups.length) {
    console.error(`${locale}: DUPLICATE TOP-LEVEL: ${[...new Set(dups)].join(", ")}`);
    process.exitCode = 1;
  }
  const j = JSON.parse(text);
  if (!j.favorites?.title) {
    console.error(`${locale}: MISSING favorites.title`);
    process.exitCode = 1;
  } else {
    console.log(`${locale}: ok — favorites.title="${j.favorites.title}"`);
  }
}
