# Lindsey & Jake · Wedding Website 🍂

Electronic invitation with RSVP, guest Q&A, and a code-protected page for overnight guests.

- **Main invite (everyone):** `https://jakecuso.github.io/Wedding/`
- **Overnight guests only:** `https://jakecuso.github.io/Wedding/stay.html?code=pumpkin`

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
| `ceremonyTime` | e.g. `"4:00 PM"` |
| `ceremonyDate` | same time for the countdown, e.g. `"2026-10-31T16:00:00-04:00"` |
| `venueAddress` | The exact address from your Airbnb reservation. Airbnb hides it until you book, so it couldn't be looked up. |
| `mapsQuery` | Same address, so the map and "Open in Maps" button point to the house |
| `overnightCodeHash` | Only if you change the code (see below) |

The **RSVP by October 15** date is in `index.html` and `stay.html`. Search for "October 15" to change it.

## 4. Overnight guests

- Everyone gets the main link. Only people you want to stay over get the **stay link**. It has the code built in, so they don't have to type it:
  `https://jakecuso.github.io/Wedding/stay.html?code=pumpkin`
- To change the code, run `echo -n "newcode" | sha256sum` (use lowercase) and paste the result into `overnightCodeHash`.
- The code keeps casual visitors out, but anyone technical could read the page's source. **Don't put door codes or Wi-Fi passwords on the site.** Text them to overnight guests instead.

## Files

- `index.html`: main invitation, RSVP, Q&A
- `stay.html`: overnight guest page and stay confirmation
- `style.css`: fall theme (burnt orange, maroon, olive green)
- `app.js`: forms, countdown, Q&A loading, code gate
- `config.js`: **the details you edit**
- `apps-script/Code.gs`: Google Sheet backend
