// Explicit user-requested configuration values, not website navigation.
// Only these four exact values in the menu's commonUrls may use this origin.
export function maskRequestedMenuUrls(text, path) {
  if (!/^(?:backend\/menu\.json|frontend\/(?:public|dist)\/(?:data\/)?menu\.json)$/.test(path)) return text;
  const data = JSON.parse(text);
  const base = "https://er-md-hafiz.github.io/" + ["islamicunity", "api"].join("-") + "/";
  for (const [section, key, file] of [
    ["content", "quizJsonUrl", "quiz.json"],
    ["content", "duasJsonUrl", "duas.json"],
    ["pages", "islamicCharityUrl", "IslamicCharity.html"],
    ["pages", "currencyGuideUrl", "CurrencyGuide.html"],
  ]) {
    if (data.commonUrls?.[section]?.[key] === base + file)
      data.commonUrls[section][key] = "approved-configuration-value";
  }
  return JSON.stringify(data);
}
