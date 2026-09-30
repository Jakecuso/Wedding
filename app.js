(function () {
  const W = window.WEDDING;
  const $ = (s) => document.querySelector(s);

  // Fill in values from config.js
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const v = W[el.dataset.bind];
    if (v) el.textContent = v;
  });
  const maps = $("#mapsLink");
  if (maps) maps.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(W.mapsQuery);
  const frame = $("#mapFrame");
  if (frame) frame.src = "https://www.google.com/maps?q=" + encodeURIComponent(W.mapsQuery) + "&z=11&output=embed";

  // Countdown
  const cd = $("#countdown");
  if (cd) {
    const target = new Date(W.ceremonyDate).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60;
      cd.innerHTML = diff === 0
        ? "<div><b>🎉</b><span>Today!</span></div>"
        : `<div><b>${d}</b><span>days</span></div><div><b>${h}</b><span>hours</span></div><div><b>${m}</b><span>min</span></div>`;
    };
    tick();
    setInterval(tick, 30000);
  }

  // Show extra RSVP fields when attending
  const yes = $("#yesFields");
  document.querySelectorAll('input[name="attending"]').forEach((r) =>
    r.addEventListener("change", () => yes && yes.classList.toggle("hidden", r.value !== "Yes" || !r.checked))
  );

  function status(el, ok, msg) {
    el.className = "status " + (ok ? "ok" : "err");
    el.textContent = msg;
  }

  // Send a form to the Google Apps Script backend
  async function send(form, statusEl, okMsg) {
    const data = new FormData(form);
    const required = [...form.querySelectorAll("[required]")];
    for (const f of required) {
      if (f.type === "radio" ? !form.querySelector(`input[name="${f.name}"]:checked`) : !f.value.trim()) {
        status(statusEl, false, "Please fill in the required fields.");
        f.focus();
        return false;
      }
    }
    if (!W.scriptUrl) {
      status(statusEl, false, "The RSVP system isn't connected yet. Please text Lindsey or Jake!");
      return false;
    }
    const body = new URLSearchParams();
    const multi = {};
    for (const [k, v] of data) (multi[k] = multi[k] || []).push(v);
    for (const k in multi) body.append(k, multi[k].join(", "));

    const btn = form.querySelector("button");
    btn.disabled = true;
    try {
      await fetch(W.scriptUrl, { method: "POST", mode: "no-cors", body });
      status(statusEl, true, okMsg);
      form.reset();
      if (yes) yes.classList.add("hidden");
      return true;
    } catch (e) {
      status(statusEl, false, "Something went wrong. Please try again, or text us.");
      return false;
    } finally {
      btn.disabled = false;
    }
  }

  const rsvp = $("#rsvpForm");
  if (rsvp) rsvp.addEventListener("submit", (e) => {
    e.preventDefault();
    const going = rsvp.querySelector('input[name="attending"]:checked');
    const msg = going && going.value === "No"
      ? "Thank you for letting us know. We'll miss you! 🍂"
      : "Thank you! We can't wait to celebrate with you. 🎃🍁";
    send(rsvp, $("#rsvpStatus"), msg);
  });

  const qForm = $("#questionForm");
  if (qForm) qForm.addEventListener("submit", (e) => {
    e.preventDefault();
    send(qForm, $("#qStatus"), "Got it! We'll post an answer here soon.");
  });

  // Load answered questions
  const qaList = $("#qaList");
  if (qaList) {
    if (!W.scriptUrl) {
      qaList.innerHTML = '<p class="empty">No questions answered yet.</p>';
    } else {
      fetch(W.scriptUrl + "?action=questions")
        .then((r) => r.json())
        .then((items) => {
          qaList.innerHTML = "";
          if (!items.length) {
            qaList.innerHTML = '<p class="empty">No questions answered yet. Be the first to ask!</p>';
            return;
          }
          items.forEach((it) => {
            const div = document.createElement("div");
            div.className = "qa";
            const q = document.createElement("div");
            q.className = "q";
            q.textContent = it.question + " ";
            const who = document.createElement("small");
            who.textContent = "from " + it.name;
            q.appendChild(who);
            const a = document.createElement("div");
            a.className = "a";
            a.textContent = it.answer;
            div.append(q, a);
            qaList.appendChild(div);
          });
        })
        .catch(() => (qaList.innerHTML = '<p class="empty">Couldn\'t load questions right now.</p>'));
    }
  }

  // ---------- Password unlock (shared by both pages) ----------
  const sha = async (t) => {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(t).trim().toLowerCase()));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  };
  async function checkCode(code) {
    if (!code || (await sha(code)) !== W.overnightCodeHash) return false;
    // Not remembered: a refresh locks it again. Carry the code to the other page's links instead.
    document.querySelectorAll('a[href^="stay.html"], a[href^="./"]').forEach((a) => {
      const [path, hash] = a.getAttribute("href").split("#");
      a.href = path + "?code=" + encodeURIComponent(code) + (hash ? "#" + hash : "");
    });
    return true;
  }
  async function savedCodeOk() {
    const urlCode = new URLSearchParams(location.search).get("code");
    try { localStorage.removeItem("stayCode"); } catch (e) {} // clear codes saved by older versions
    const ok = await checkCode(urlCode);
    // Remove the code from the address bar so a refresh locks the page again
    if (urlCode) history.replaceState(null, "", location.pathname + location.hash);
    return ok;
  }

  // Main invite: reveal Friday details + Friday RSVP option
  const pwBox = $("#pwBox");
  if (pwBox) {
    const unlockInvite = () => {
      document.querySelectorAll(".private").forEach((el) => el.classList.remove("hidden"));
      document.querySelectorAll(".private input").forEach((el) => (el.disabled = false));
      document.querySelectorAll(".public-only").forEach((el) => (el.disabled = true));
      pwBox.classList.add("hidden");
    };
    savedCodeOk().then((ok) => ok && unlockInvite());
    $("#pwOpen").addEventListener("click", () => {
      $("#pwOpen").classList.add("hidden");
      $("#pwForm").classList.remove("hidden");
      $("#pw").focus();
    });
    $("#pwForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (await checkCode($("#pw").value)) unlockInvite();
      else status($("#pwStatus"), false, "That password doesn't match. Check the message we sent you.");
    });
  }

  // Overnight page code gate
  const gate = $("#gate");
  if (gate) {
    const content = $("#stayContent");
    const unlock = () => { gate.classList.add("hidden"); content.classList.remove("hidden"); };
    savedCodeOk().then((ok) => ok && unlock());

    $("#gateForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (await checkCode($("#code").value)) unlock();
      else status($("#gateStatus"), false, "That password doesn't match. Check the message we sent you.");
    });

    const stay = $("#stayForm");
    stay.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = stay.querySelector('input[name="staying"]:checked');
      send(stay, $("#stayStatus"), s && s.value === "No"
        ? "Thanks for letting us know! We'll still see you during the day. 🍂"
        : "You're all set! We'll save you a spot. 🛏️🎃");
    });
    stay.querySelectorAll('input[name="staying"]').forEach((r) =>
      r.addEventListener("change", () => $("#nightFields").classList.toggle("hidden", r.value !== "Yes" || !r.checked))
    );
  }
})();
