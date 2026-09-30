# Lindsey & Jake · Wedding Website 🍂

Electronic invitation with RSVP, guest Q&A, and a code-protected page for overnight guests.

- **Main invite (everyone):** `https://jakecuso.github.io/Wedding/`
- **Friday / overnight guests:** same link, then tap **Enter Password** (default `pumpkin`)

## 1. Turn on the website (GitHub Pages)

1. On GitHub, open the repo and go to **Settings → Pages**.
2. Under **Build and deployment**, pick **Deploy from a branch**, choose `main` and `/ (root)`, and click **Save**.
3. After a minute or two the site is live at `https://jakecuso.github.io/Wedding/`.

## 2. Connect RSVPs & Questions to a Google Sheet (free, ~5 min)

GitHub Pages can't store anything by itself, so the answers go to a Google Sheet you own.

1. Go to <https://sheets.new> and name the sheet something like "Wedding RSVPs".
2. Click **Extensions → Apps Script**. Delete what's there and paste in everything from [`apps-script/Code.gs`](apps-script/Code.gs). Click 💾 **Save**.
3. In the function dropdown at the top pick **setup** and click **Run**. Approve the permissions (it's your own script). This creates the **RSVPs**, **Overnight** and **Questions** tabs.
4. Click **Deploy → New deployment**. Click the ⚙️ gear icon and pick **Web app**. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy** and copy the **Web app URL** (ends in `/exec`).
6. Open [`config.js`](config.js) in this repo and paste it in: `scriptUrl: "https://script.google.com/macros/s/..../exec",`

Now:
- RSVPs show up in the **RSVPs** tab and overnight confirmations in the **Overnight** tab.
- Questions show up in the **Questions** tab. **Type your reply in the "Answer" column** and it appears on the website for everyone. Leave it blank and the question stays hidden.

> If you ever change `Code.gs`, use **Deploy → Manage deployments → ✏️ Edit → Version: New version** so the URL stays the same.

## 3. Things to fill in (`config.js`)

| Setting | What to put |
|---|---|
| `ceremonyTime` | e.g. `"2:00 PM"` |
| `ceremonyDate` | same time for the countdown, e.g. `"2026-10-31T14:00:00-04:00"` |
| `venueAddress` | The house address (set to 64420 Bethel Rd, Creola, OH 45622) |
| `mapsQuery` | Same address, so the map and "Open in Maps" button point to the house |
| `overnightCodeHash` | Only if you change the code (see below) |

The **RSVP by October 14** date is in `index.html` and `stay.html`. Search for "October 14" to change it.

## 4. Password for Friday / overnight guests

- The main invite only shows **Saturday**. There's a **🔑 Enter Password (if given)** button under "The Weekend".
- With the right password (default `pumpkin`), the page reveals the **Friday 6 PM arrival** and **Sunday checkout** details, adds a **Friday option to the RSVP**, and links to the overnight guest page (`stay.html`).
- The password is **not** remembered: refreshing the page locks it again. Buttons between the two pages carry the password along, so guests only type it once per visit.
- Shortcut link that unlocks automatically: `https://jakecuso.github.io/Wedding/?code=pumpkin`
- To change the password, run `echo -n "newpassword" | sha256sum` (use lowercase) and paste the result into `overnightCodeHash` in `config.js`.
- The password keeps casual guests from seeing Friday info, but anyone technical could read it in the page source. **Don't put door codes or Wi-Fi passwords on the site.** Text them to overnight guests instead.

## Files

- `index.html`: main invitation, RSVP, Q&A
- `stay.html`: overnight guest page and stay confirmation
- `style.css`: plum, moss, champagne and ivory theme
- `app.js`: forms, countdown, Q&A loading, code gate
- `config.js`: **the details you edit**
- `apps-script/Code.gs`: Google Sheet backend
