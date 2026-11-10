const API = "https://er-md-hafiz.github.io/islamicunity-api/";
export const footerColumns = [
  { title: "Quick Links", links: [
    ["Privacy Policy", `${API}PrivacyPolicy.html`],
    ["Terms & Conditions", `${API}terms_and_conditions.html`],
    ["About Us", `${API}SupportOurCommunity.html`],
    ["Download App", "https://play.google.com/store/apps/details?id=com.islamicunity.android&hl=en"],
    ["Donate & Support", `${API}donate.html`],
  ] },
  { title: "Islamic Resources", links: [
    ["Hajj Information", `${API}Hajj.html`],
    ["Umrah Information", `${API}Umrah.html`],
    ["Islamic Articles", `${API}islamicunity.html`],
    ["Fatwa & Rulings", `${API}islamicunity.html`],
    ["Islamic Calendar 2026", `${API}islamicunity.html`],
  ] },
  { title: "Contact Us", links: [
    ["islamic.unity.app@gmail.com", "mailto:islamic.unity.app@gmail.com"],
    ["Send Feedback", `${API}islamicunity.html`],
    ["Help & Support", `${API}islamicunity.html`],
    ["Report an Issue", `${API}islamicunity.html`],
    ["Request a Feature", `${API}islamicunity.html`],
  ] },
];
// User-supplied profiles checked before publication. A URL alone does not enable
// an unavailable or unverified account. See docs/social-profile-verification.json.
export const socialMedia = Object.freeze({
  facebook: { name: "Facebook", icon: "facebook", url: "https://www.facebook.com/m3hmedia/", enabled: false },
  instagram: { name: "Instagram", icon: "instagram", url: "https://www.instagram.com/m3hmedia/", enabled: true },
  youtube: { name: "YouTube", icon: "youtube", url: "https://www.youtube.com/@m3hmedia", enabled: true },
  x: { name: "Twitter / X", icon: "x", url: "https://x.com/m3hmedia", enabled: false },
});
export const socialProfiles = Object.values(socialMedia);
