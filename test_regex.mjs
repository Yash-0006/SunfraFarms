const failedGen = "<function=query_sales={\"date\":\"2026-06-05\"}</function>";
const regex = /<function=([a-zA-Z0-9_]+)[=>\s]*(\{[\s\S]*?\})\s*<\/function>/i;
const match = failedGen.match(regex);
console.log("Match:", match);
if (match) {
  console.log("Tool Name:", match[1]);
  console.log("Tool Args:", match[2]);
  try {
    const args = JSON.parse(match[2]);
    console.log("Parsed Args:", args);
  } catch (e) {
    console.error("Parse Error:", e);
  }
} else {
  console.log("No match!");
}
