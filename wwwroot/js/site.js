(function () {
    "use strict";

    const inputEl     = document.getElementById("txtInput");
    const processBtn  = document.getElementById("processBtn");
    const charInfo    = document.getElementById("charInfo");
    const outputPanel = document.getElementById("outputPanel");
    const emptyMsg    = document.getElementById("emptyMsg");
    const resultEl    = document.getElementById("result");
    const resultTag   = document.getElementById("resultTag");
    const resultText  = document.getElementById("resultText");

    /* ── Live char count ── */
    inputEl.addEventListener("input", () => {
        const n = inputEl.value.length;
        charInfo.textContent = n + (n === 1 ? " char" : " chars") +
            "  ·  press Enter or click Process";
        processBtn.disabled = inputEl.value.trim().length === 0;
    });

    /* ── Enter key ── */
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && inputEl.value.trim()) {
            e.preventDefault();
            submit();
        }
    });

    /* ── Button click ── */
    processBtn.addEventListener("click", (e) => {
        addRipple(e);
        submit();
    });

    /* ── Chips ── */
    document.querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", () => {
            inputEl.value = chip.dataset.val;
            inputEl.dispatchEvent(new Event("input"));
            setTimeout(submit, 90);
        });
    });

    /* ── Submit ── */
    function submit() {
        const raw = inputEl.value.trim();
        if (!raw) return;

        const { label, html } = detect(raw);

        resultEl.classList.remove("show");
        emptyMsg.style.opacity = "0";
        outputPanel.classList.add("active");

        requestAnimationFrame(() => requestAnimationFrame(() => {
            resultTag.textContent = label;
            resultText.innerHTML  = html + '<span class="cursor"></span>';
            resultEl.classList.add("show");
        }));
    }

    /* ════════════════════════════════════════
       DETECTION ENGINE — 14 cases
    ════════════════════════════════════════ */
    function detect(s) {

        /* 1. Pure integer */
        if (/^-?\d+$/.test(s)) {
            const n = parseInt(s, 10);
            if (n === 0)
                return mk("zero",
                    `Your number is ${hl("zero")} — the origin of everything.`);
            if (n < 0)
                return mk("negative number",
                    `Your number is ${hl(s)} — below zero, but still valid!`);
            if (isPrime(n))
                return mk("prime number",
                    `${hl(s)} is a prime — only divisible by 1 and itself.`);
            if (Number.isInteger(Math.sqrt(n)))
                return mk("perfect square",
                    `${hl(s)} = ${hl(Math.sqrt(n))}² — a perfect square!`);
            if (n % 2 === 0)
                return mk("even number",
                    `Your number is ${hl(s)} — even and balanced.`);
            return mk("odd number",
                    `Your number is ${hl(s)} — odd, but that is okay.`);
        }

        /* 2. Decimal / float */
        if (/^-?\d+\.\d+$/.test(s)) {
            const f = parseFloat(s);
            return mk("decimal",
                `Your decimal is ${hl(s)} ≈ ${hl(Math.round(f))} when rounded.`);
        }

        /* 3. Math expression */
        if (/^[\d\s\+\-\*\/\(\)\.%]+$/.test(s) && /[\+\-\*\/]/.test(s)) {
            try {
                const r = Function('"use strict"; return (' + s + ')')();
                if (typeof r === "number" && isFinite(r))
                    return mk("math expression",
                        `${hl(s)} = ${hl(+r.toFixed(6).replace(/\.?0+$/, ""))}`);
            } catch (_) {}
        }

        /* 4. HEX color */
        if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s)) {
            const sw = `<span style="display:inline-block;width:14px;height:14px;
                background:${s};border-radius:3px;vertical-align:middle;
                margin:0 4px;border:1px solid rgba(255,255,255,.2)"></span>`;
            return mk("hex color", `Color ${sw}${hl(s)} — that is a nice shade!`);
        }

        /* 5. RGB color */
        if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(s)) {
            const sw = `<span style="display:inline-block;width:14px;height:14px;
                background:${s};border-radius:3px;vertical-align:middle;
                margin:0 4px;border:1px solid rgba(255,255,255,.2)"></span>`;
            return mk("rgb color", `RGB color ${sw}${hl(s)} detected.`);
        }

        /* 6. Email */
        if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) {
            const [user, domain] = s.split("@");
            return mk("email address",
                `Hello, ${hl(user)}! Your inbox at ${hl(domain)} is waiting.`);
        }

        /* 7. URL */
        if (/^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/\S*)?$/.test(s)) {
            const secure = s.startsWith("https");
            return mk(secure ? "secure url" : "url",
                `Navigating to ${hl(s)} — ${secure
                    ? "secured with HTTPS."
                    : "no HTTPS detected, be careful!"}`);
        }

        /* 8. Phone number */
        if (/^[\+\d][\d\s\-\(\)]{6,}$/.test(s) &&
            s.replace(/\D/g, "").length >= 7) {
            return mk("phone number",
                `Calling ${hl(s)} — hope they pick up!`);
        }

        /* 9. Date */
        const dv = Date.parse(s);
        if (!isNaN(dv) && /\d{4}|\d{2}[\-\/]\d{2}/.test(s)) {
            const d    = new Date(dv);
            const days = ["Sunday","Monday","Tuesday","Wednesday",
                          "Thursday","Friday","Saturday"];
            const diff = Math.round((d - new Date()) / 86400000);
            const when = diff === 0 ? "That is today!"
                : diff > 0 ? `${diff} day${diff !== 1 ? "s" : ""} from now.`
                           : `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""} ago.`;
            return mk("date",
                `${hl(s)} falls on a ${hl(days[d.getUTCDay()])}. ${when}`);
        }

        /* 10. Palindrome */
        const letters = s.toLowerCase().replace(/[^a-z]/g, "");
        if (letters.length >= 3 &&
            letters === letters.split("").reverse().join("")) {
            return mk("palindrome",
                `${hl(s)} reads the same forwards and backwards!`);
        }

        /* 11. All-caps */
        if (s === s.toUpperCase() && /[A-Z]{2}/.test(s))
            return mk("all caps",
                `${hl(s)} — why are we shouting? Check that caps lock!`);

        /* 12. Hashtag / Mention */
        if (/^#\w+$/.test(s))
            return mk("hashtag", `Trending? ${hl(s)} could go viral.`);
        if (/^@\w+$/.test(s))
            return mk("mention",  `Pinging ${hl(s)} — notification sent!`);

        /* 13. Single word → name */
        if (/^[A-Za-z\-']{2,}$/.test(s))
            return mk("name",
                `Hello, ${hl(cap(s))}! Great to meet you.`);

        /* 14. Multi-word → sentiment */
        if (s.split(/\s+/).filter(Boolean).length > 1) {
            const mood = detectMood(s);
            return mk(mood.label,
                `${hl("\u201c" + s + "\u201d")} — ${mood.message}`);
        }

        /* Fallback */
        return mk("unknown",
            `${hl(s)} does not match any known pattern. Interesting!`);
    }

    /* ── Helpers ── */
    function mk(label, html)  { return { label, html }; }
    function hl(v)            { return `<span class="hl">${v}</span>`; }
    function cap(s)           { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

    function isPrime(n) {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++)
            if (n % i === 0) return false;
        return true;
    }

    function detectMood(text) {
        const t = text.toLowerCase();
        const pos = ["love","great","awesome","happy","good","wonderful",
                     "amazing","beautiful","fantastic","nice","thanks"];
        const neg = ["hate","bad","sad","awful","terrible","horrible",
                     "worst","angry","boring","ugh"];
        if (t.includes("?"))
            return { label: "question",
                     message: "Curiosity is the engine of progress." };
        if (pos.some(w => t.includes(w)))
            return { label: "positive sentiment",
                     message: "Good vibes detected!" };
        if (neg.some(w => t.includes(w)))
            return { label: "negative sentiment",
                     message: "Hope things look up soon." };
        return { label: "sentence",
                 message: "A thought has been recorded." };
    }

    function addRipple(e) {
        const btn  = processBtn;
        const span = document.createElement("span");
        const d    = Math.max(btn.clientWidth, btn.clientHeight);
        const rect = btn.getBoundingClientRect();
        span.className = "ripple";
        span.style.cssText =
            `width:${d}px;height:${d}px;` +
            `left:${e.clientX - rect.left - d/2}px;` +
            `top:${e.clientY  - rect.top  - d/2}px;`;
        btn.querySelector(".ripple")?.remove();
        btn.appendChild(span);
    }

})();