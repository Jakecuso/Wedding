// ============================================================
//  EDIT THIS FILE to change the details on the site.
// ============================================================
window.WEDDING = {
  couple: "Lindsey & Jake",
  fullNames: "Lindsey Adams & Jake Mancuso",

  // Paste your Google Apps Script "Web app" URL here (see README.md).
  // Until it's set, RSVPs and questions can't be saved.
  scriptUrl: "",

  ceremonyDate: "2026-10-31T14:00:00-04:00", // used for the countdown
  ceremonyTime: "2:00 PM",                   // shown on the page, e.g. "4:00 PM"

  venueName: "Serenity Ridge",
  // Airbnb shows the exact address in your reservation. Paste it here.
  venueAddress: "Creola, Ohio (Hocking Hills). Full address coming soon",
  mapsQuery: "Creola, Ohio",

  // SHA-256 hash of the overnight guest code. The default code is: pumpkin
  // To change it, run in a terminal:  echo -n "yournewcode" | sha256sum
  overnightCodeHash: "ff48e511e1638fc379cb75de1c28fe2016051b167f9aa8cac3dd86c6f4787539",
};
