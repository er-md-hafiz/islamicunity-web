import { sitePageHref } from "../../../shared/site-navigation.mjs";
export const footerColumns = [
  { title: "Quick Links", links: [
    ["Privacy Policy", sitePageHref("privacy")],
    ["Terms & Conditions", sitePageHref("terms")],
    ["About Us", sitePageHref("about")],
    ["Download App", "https://play.google.com/store/apps/details?id=com.islamicunity.android&hl=en"],
    ["Donate & Support", sitePageHref("donate")],
  ] },
  { title: "Islamic Resources", links: [
    ["Hajj Information", sitePageHref("hajj")],
    ["Umrah Information", sitePageHref("umrah")],
    ["Islamic Articles", sitePageHref("library")],
    ["Fatwa & Rulings", sitePageHref("library")],
    ["Islamic Calendar 2026", sitePageHref("library")],
  ] },
  { title: "Contact Us", links: [
    ["islamic.unity.app@gmail.com", "mailto:islamic.unity.app@gmail.com"],
    ["Send Feedback", sitePageHref("library")],
    ["Help & Support", sitePageHref("library")],
    ["Report an Issue", sitePageHref("library")],
    ["Request a Feature", sitePageHref("library")],
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
