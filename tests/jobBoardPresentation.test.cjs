const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const companies = require("../content/jobs/companies.json");
const logos = require("../content/jobs/logos.json");
const root = path.resolve(__dirname, "..");

test("every company has an intact, locally hosted logo in the published build", () => {
  assert.deepEqual(Object.keys(logos).sort(), companies.map((company) => company.id).sort());
  for (const [companyId, name] of Object.entries(logos)) {
    assert.match(name, /^[a-z-]+\.(png|svg)$/);
    const source = fs.readFileSync(path.join(root, "assets/companies", name));
    assert.ok(source.length > 100, `Empty logo for ${companyId}`);
    const published = fs.readFileSync(path.join(root, "dist/assets/companies", name));
    assert.deepEqual(published, source, `Missing or changed published logo for ${companyId}`);
    if (name.endsWith("png")) {
      assert.equal(source.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.ok(source.readUInt32BE(16) >= 48, `Logo too small for ${companyId}`);
      assert.ok(source.readUInt32BE(20) >= 48);
    } else {
      const svg = source.toString("utf8");
      assert.match(svg, /<svg\b/);
      assert.ok(!/<script\b|<foreignObject\b|\bon\w+\s*=|(?:href|src)\s*=|url\(\s*["']?https?:/i.test(svg), "Company SVG must not execute code or load remote resources");
    }
  }
});

test("the board has an independent light-default theme, including restricted storage", () => {
  const html = fs.readFileSync(path.join(root, "jobs.html"), "utf8");
  const main = fs.readFileSync(path.join(root, "jobs-main.jsx"), "utf8");
  assert.ok(!main.includes('"./site.css"'));
  assert.ok(!main.includes("leaky-theme"));
  assert.ok(!html.includes("leaky-theme"));
  assert.ok(main.includes('setItem("jobs-theme", next)'));
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const [stored, expected] of [[null, "light"], ["light", "light"], ["dark", "dark"], ["unexpected", "light"]]) {
    const document = { documentElement: { dataset: {} } };
    vm.runInNewContext(script, { document, localStorage: { getItem(key) { assert.equal(key, "jobs-theme"); return stored; } } });
    assert.equal(document.documentElement.dataset.theme, expected);
  }
  const document = { documentElement: { dataset: {} } };
  vm.runInNewContext(script, { document, localStorage: { getItem() { throw new Error("Storage unavailable"); } } });
  assert.equal(document.documentElement.dataset.theme, "light");
});
