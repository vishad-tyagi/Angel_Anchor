/* Angel Anchor journey: timeline engine and scenes */

const CONFIG = {
  // The journey's entry point. Phase 1 starts from a mutual fund redemption.
  // An 'equity-sell' entry can be added to TRIGGERS below with a share holding,
  // a "Sell" button and lienSystem: 'cdsl' (a CDSL pledge in scene 8).
  TRIGGER: 'mf-redeem',
  speeds: [1, 1.5]
};

const TRIGGERS = {
  'mf-redeem': {
    holding: 'Flexicap Equity Fund',
    holdingKind: 'Mutual fund',
    holdingNote: 'Held 4 years',
    action: 'Redeem',
    amountLabel: 'Amount to redeem',
    confirm: 'Confirm redemption',
    continueLabel: 'Continue redeeming',
    startLine: 'He opens Flexicap Equity Fund and taps "Redeem", then enters ₹1,50,000.',
    detects: 'Detects a redemption starting; the nudge engine checks whether a banner is allowed.',
    lienTitle: 'Confirm lien on your Flexicap units',
    lienSending: "Marking a lien with the fund's registrar",
    lienDone: 'Lien marked',
    lienNarration: 'Sends the lien request to the registrar; the user authorises by OTP.',
    lienSystem: 'rta'
  }
};

const TRIG = TRIGGERS[CONFIG.TRIGGER];

// Illustrative figures, all from the brief.
const D = {
  total: '₹6,00,000',
  holdings: [
    { name: 'Flexicap Equity Fund', value: '₹2,80,000' },
    { name: 'Large & Midcap Fund', value: '₹1,90,000' },
    { name: 'Corporate Bond Fund', value: '₹1,30,000' }
  ],
  liquidity: '₹3.4 lakh',
  amount: '₹1,50,000',
  tax: '₹9,750',
  perDay: '₹49',
  fee: '₹1,770',
  total3m: '₹6,270',
  rate: '12% a year',
  feeTerms: '1% plus GST',
  bank: '4417',
  shortfall: '₹18,000',
  deadline: 'Friday, 5 pm',
  dividend: '₹12,000'
};

const BANNER_TEXT = `Selling these units could attract about ${D.tax} in tax. Borrowing ₹1.5 lakh against them costs about ${D.perDay} a day, and your investments stay invested.`;

// Mini architecture strip: the five layers, compact.
const ARCH = [
  { name: 'App', items: [['surfaces', 'Screens and banners', 'system']] },
  { name: 'Agent', items: [['ai', 'AI model', 'ai'], ['guardrails', 'Guardrails', 'ai']] },
  { name: 'Rules engines', items: [['eligibility', 'Eligibility', 'engine'], ['cost', 'Cost and tax', 'engine'], ['ltv', 'LTV monitor', 'engine'], ['nudge', 'Nudge engine', 'engine']] },
  { name: 'Integration', items: [['integration', 'APIs and event stream', 'bar']] },
  { name: 'Systems', items: [['platform', 'Angel One platform', 'system'], ['fincap', 'Angel Fincap', 'system'], ['cdsl', 'CDSL', 'system'], ['rta', 'CAMS and KFintech', 'system'], ['partners', 'Partner lenders', 'system']] }
];

const CHIP = '<span class="anchor-chip"><svg viewBox="0 0 16 16" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="3.6" r="1.4"/><path d="M8 5v8.5M5.5 7.5h5M3.5 9.5c0 2.3 2 3.9 4.5 3.9s4.5-1.6 4.5-3.9"/></g></svg>Angel Anchor</span>';

/* ---------- helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);
const screen = $('#screen');
const body = $('#app-body');

function refs(root) {
  const r = {};
  root.querySelectorAll('[data-r]').forEach(el => { r[el.dataset.r] = el; });
  return r;
}

function show(el) { el.classList.add('is-in'); }

function holdingsCard(extra = '') {
  return `<div class="a-card ${extra}">${D.holdings.map(h =>
    `<div class="a-row"><span>${h.name}</span><b>${h.value}</b></div>`).join('')}</div>`;
}

function portfolioHTML(dim) {
  return `<div class="${dim ? 'a-dim' : ''}">
    <p class="a-sub">Total holdings</p>
    <div class="a-big">${D.total}</div>
    <div class="a-label">Mutual funds</div>
    ${holdingsCard()}
  </div>`;
}

// Tap ripple at the centre of an element, in the phone's unscaled coordinates.
function tap(el, instant) {
  if (instant || !el) return;
  const s = screen.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const k = s.width / screen.offsetWidth || 1;
  const dot = document.createElement('span');
  dot.className = 'tap';
  dot.style.left = ((r.left - s.left + r.width / 2) / k) + 'px';
  dot.style.top = ((r.top - s.top + r.height / 2) / k) + 'px';
  screen.appendChild(dot);
  setTimeout(() => dot.remove(), 700);
}

function typeInto(el, text, p) {
  el.textContent = text.slice(0, Math.round(text.length * p));
}

/* ---------- scenes ---------- */

const SCENES = [
  {
    title: 'Portfolio',
    app: 'Portfolio',
    dur: 5000,
    sees: 'His portfolio screen: holdings of ₹6,00,000, with a new line "Available liquidity: ₹3.4 lakh".',
    agent: 'Pre-computes a borrowing limit from his holdings and the approved-securities list.',
    lit: ['eligibility', 'platform'],
    render() {
      body.innerHTML = `
        <p class="a-sub">Total holdings</p>
        <div class="a-big">${D.total}</div>
        <div class="a-liquidity pop" data-r="liq"><span>Available liquidity: <b>${D.liquidity}</b></span>${CHIP}</div>
        <div class="a-label">Mutual funds</div>
        ${holdingsCard()}`;
    },
    beats: [{ at: 900, run: r => show(r.liq) }]
  },
  {
    title: 'Starts a redemption',
    app: TRIG.action,
    dur: 6000,
    sees: TRIG.startLine,
    agent: TRIG.detects,
    lit: ['nudge', 'platform'],
    render() {
      body.innerHTML = `
        <p class="a-sub">${TRIG.holdingKind}</p>
        <h3 class="a-h">${TRIG.holding}</h3>
        <div class="a-big">${D.holdings[0].value}</div>
        <p class="a-sub">${TRIG.holdingNote}</p>
        <div class="a-btns"><div class="a-btn a-btn--ghost">Invest more</div><div class="a-btn" data-r="act">${TRIG.action}</div></div>
        <div class="pop" data-r="form">
          <div class="a-label">${TRIG.amountLabel}</div>
          <div class="a-input"><span data-r="amt"></span><i class="caret"></i></div>
          <div class="a-btn">${TRIG.confirm}</div>
        </div>`;
    },
    beats: [
      { at: 1200, run: (r, i) => tap(r.act, i) },
      { at: 1500, run: r => show(r.form) },
      { at: 2200, dur: 1400, tick: (r, p) => typeInto(r.amt, D.amount, p) }
    ]
  },
  {
    title: 'The banner',
    app: TRIG.action,
    dur: 7000,
    sees: `Before he confirms, a banner slides up: "${BANNER_TEXT}" Buttons: "See how" and "${TRIG.continueLabel}".`,
    agent: 'Compares the estimated tax on selling with the cost of borrowing; shows the tax only because borrowing is cheaper here.',
    lit: ['cost', 'ai'],
    render() {
      body.innerHTML = `
        <p class="a-sub">${TRIG.holdingKind}</p>
        <h3 class="a-h">${TRIG.holding}</h3>
        <div class="a-label">${TRIG.amountLabel}</div>
        <div class="a-input">${D.amount}</div>
        <div class="a-btn">${TRIG.confirm}</div>
        <div class="anchor-banner" data-r="banner">
          ${CHIP}
          <p>${BANNER_TEXT}</p>
          <div class="a-btns"><div class="a-btn" data-r="how">See how</div><div class="a-btn a-btn--ghost">${TRIG.continueLabel}</div></div>
        </div>`;
    },
    beats: [
      { at: 700, run: r => show(r.banner) },
      { at: 6000, run: (r, i) => tap(r.how, i) }
    ]
  },
  {
    title: 'Borrow or sell',
    app: 'See how',
    dur: 6500,
    sees: 'A detail window: estimated tax ₹9,750; interest ₹49 a day; one-time fee ₹1,770 (incl. GST); total for 3 months ₹6,270. Note: "Tax is an estimate."',
    agent: 'Pulls every figure from the rules engines; the AI model only explains them.',
    lit: ['cost', 'guardrails'],
    render() {
      body.innerHTML = `
        ${CHIP}
        <h3 class="a-h" style="margin-top:12px">Borrow instead of selling?</h3>
        <p class="a-sub">Raising ${D.amount} for 3 months</p>
        <div class="a-card">
          <div class="a-row pop" data-r="r1"><span>Estimated tax if you sell</span><b>${D.tax}</b></div>
          <div class="a-row pop" data-r="r2"><span>Interest if you borrow</span><b>${D.perDay} a day</b></div>
          <div class="a-row pop" data-r="r3"><span>One-time fee</span><b>${D.fee} (incl. GST)</b></div>
          <div class="a-row pop" data-r="r4"><span><b>Total to borrow, 3 months</b></span><b>${D.total3m}</b></div>
        </div>
        <div class="pop" data-r="note">
          <p class="a-note"><b>Tax is an estimate.</b> Rate ${D.rate}; one-time fee ${D.feeTerms}.</p>
          <div class="a-btn">Borrow instead</div>
        </div>`;
    },
    beats: [
      { at: 500, run: r => show(r.r1) },
      { at: 1100, run: r => show(r.r2) },
      { at: 1700, run: r => show(r.r3) },
      { at: 2300, run: r => show(r.r4) },
      { at: 3100, run: r => show(r.note) }
    ]
  },
  {
    title: 'Chat with Angel Anchor',
    app: 'Angel Anchor',
    dur: 7000,
    sees: 'A chat with Angel Anchor: "How long do you need the money?" Rohit taps "About 3 months". The agent replies: "You can borrow up to ₹3.4 lakh. Pledging your Flexicap units is enough for ₹1.5 lakh."',
    agent: 'Runs the conversation; asks the eligibility engine which holdings to pledge.',
    lit: ['ai', 'eligibility'],
    render() {
      body.innerHTML = `
        ${CHIP}
        <div class="chat" style="margin-top:14px">
          <div class="bubble bubble--agent pop" data-r="b1"><span data-r="t1"><span class="typing"><i></i><i></i><i></i></span></span></div>
          <div class="quick pop" data-r="quick"><span data-r="q3">About 3 months</span><span>Not sure yet</span></div>
          <div class="bubble bubble--user pop" data-r="u1">About 3 months</div>
          <div class="bubble bubble--agent pop" data-r="b2"><span data-r="t2"><span class="typing"><i></i><i></i><i></i></span></span></div>
        </div>`;
    },
    beats: [
      { at: 300, run: r => show(r.b1) },
      { at: 1000, dur: 1000, tick: (r, p) => typeInto(r.t1, 'How long do you need the money?', p) },
      { at: 2300, run: r => show(r.quick) },
      { at: 3100, run: (r, i) => tap(r.q3, i) },
      { at: 3400, run: r => { r.quick.style.display = 'none'; show(r.u1); } },
      { at: 3900, run: r => show(r.b2) },
      { at: 4500, dur: 1800, tick: (r, p) => typeInto(r.t2, `You can borrow up to ${D.liquidity}. Pledging your Flexicap units is enough for ₹1.5 lakh.`, p) }
    ]
  },
  {
    title: 'Choose the pledge',
    app: 'Pledge',
    dur: 5500,
    sees: 'A pledge selection screen: Flexicap Equity Fund pre-selected with its value shown and an "Edit" option; amount ₹1,50,000.',
    agent: 'Pre-fills everything from existing KYC and holdings.',
    lit: ['eligibility', 'platform'],
    render() {
      body.innerHTML = `
        <h3 class="a-h">Choose what to pledge</h3>
        <p class="a-sub">Pre-filled from your KYC and holdings</p>
        <div class="a-card pop" data-r="card">
          ${D.holdings.map((h, k) => `<div class="a-row"><span style="display:flex;gap:10px;align-items:center"><i class="a-check ${k === 0 ? 'is-on' : ''}"></i>${h.name}</span><b>${h.value}</b></div>`).join('')}
          <div class="a-row"><span>Selected: ${TRIG.holding}</span><span class="a-edit">Edit</span></div>
        </div>
        <div class="pop" data-r="amt">
          <div class="a-label">Amount to borrow</div>
          <div class="a-input">${D.amount}</div>
          <div class="a-btn" data-r="go">Continue</div>
        </div>`;
    },
    beats: [
      { at: 500, run: r => show(r.card) },
      { at: 1300, run: r => show(r.amt) },
      { at: 4600, run: (r, i) => tap(r.go, i) }
    ]
  },
  {
    title: 'Key Fact Statement',
    app: 'Key Fact Statement',
    dur: 6500,
    sees: 'The Key Fact Statement: interest rate 12% a year, APR, one-time fee, cooling-off period and repayment terms. Button: "Accept and e-sign".',
    agent: "Shows the lender's KFS before any commitment; logs the consent.",
    lit: ['fincap', 'guardrails'],
    render() {
      const kfs = "As stated in Angel Fincap's KFS";
      body.innerHTML = `
        <h3 class="a-h">Key Fact Statement</h3>
        <p class="a-sub">From Angel Fincap, before you commit</p>
        <div class="a-card">
          <div class="a-row"><span>Interest rate</span><b>${D.rate}</b></div>
          <div class="a-row"><span>APR</span><span style="text-align:right;font-size:13px">${kfs}</span></div>
          <div class="a-row"><span>One-time fee</span><b>${D.feeTerms}</b></div>
          <div class="a-row"><span>Cooling-off period</span><span style="text-align:right;font-size:13px">${kfs}</span></div>
          <div class="a-row"><span>Repayment terms</span><span style="text-align:right;font-size:13px">${kfs}</span></div>
        </div>
        <div class="a-row" style="border:0" data-r="ack"><span style="display:flex;gap:10px;align-items:center"><i class="a-check" data-r="box"></i>I have read the Key Fact Statement</span></div>
        <div class="a-btn" data-r="sign">Accept and e-sign</div>
        <p class="a-note pop" data-r="logged">Consent recorded</p>`;
    },
    beats: [
      { at: 3000, run: (r, i) => tap(r.box, i) },
      { at: 3200, run: r => r.box.classList.add('is-on') },
      { at: 4800, run: (r, i) => tap(r.sign, i) },
      { at: 5100, run: r => show(r.logged) }
    ]
  },
  {
    title: 'Approve by OTP',
    app: 'Confirm',
    dur: 7000,
    sees: `An OTP screen: "${TRIG.lienTitle}" with a 6-digit OTP; a progress bar, then "${TRIG.lienDone}".`,
    agent: TRIG.lienNarration,
    lit: [TRIG.lienSystem, 'fincap'],
    render() {
      body.innerHTML = `
        <h3 class="a-h">${TRIG.lienTitle}</h3>
        <p class="a-sub">Enter the 6-digit OTP sent to your mobile</p>
        <div class="a-otp" data-r="otp">${'<span></span>'.repeat(6)}</div>
        <div class="a-btn" data-r="go">Confirm</div>
        <div class="pop" data-r="prog">
          <p class="a-note" data-r="msg">${TRIG.lienSending}</p>
          <div class="a-progress"><i data-r="bar"></i></div>
        </div>
        <div class="pop a-center" data-r="done"><div class="a-ok"></div><h3 class="a-h">${TRIG.lienDone}</h3></div>`;
    },
    beats: [
      { at: 700, dur: 1500, tick: (r, p) => {
        const n = Math.round(p * 6);
        r.otp.querySelectorAll('span').forEach((s, k) => { s.textContent = k < n ? '•' : ''; s.classList.toggle('is-on', k < n); });
      } },
      { at: 2600, run: (r, i) => tap(r.go, i) },
      { at: 2900, run: r => show(r.prog) },
      { at: 3000, dur: 2200, tick: (r, p) => { r.bar.style.transform = `scaleX(${p})`; } },
      { at: 5400, run: r => { r.prog.style.display = 'none'; show(r.done); } }
    ]
  },
  {
    title: 'Money in the bank',
    app: 'Done',
    dur: 6000,
    sees: `A success screen: "${D.amount} sent to your bank account ending ${D.bank}". His portfolio still shows ₹6 lakh invested.`,
    agent: 'Angel Fincap sanctions and disburses to his own bank account.',
    lit: ['fincap'],
    render() {
      body.innerHTML = `
        <div class="a-center pop" data-r="ok">
          <div class="a-ok"></div>
          <h3 class="a-h">${D.amount} sent to your bank account ending ${D.bank}</h3>
        </div>
        <div class="a-card pop" data-r="card" style="margin-top:18px">
          <div class="a-row"><span>Portfolio</span><b>${D.total}</b></div>
          <div class="a-row"><span>Status</span><span class="a-tag a-tag--ok">Still invested</span></div>
          <div class="a-row"><span>Credit line drawn</span><b>${D.amount}</b></div>
        </div>`;
    },
    beats: [
      { at: 300, run: r => show(r.ok) },
      { at: 1500, run: r => show(r.card) }
    ]
  },
  {
    title: 'Early warning',
    app: 'Portfolio',
    dur: 6000,
    sees: 'Weeks later, a "Watch" notification: "Markets are down. If your pledged funds fall about 8% more, you\'ll need to add collateral or repay part."',
    agent: 'The LTV monitor reacts to price moves and sends an early warning.',
    lit: ['ltv', 'nudge'],
    render() {
      body.innerHTML = `
        <span class="a-overlay-label pop" data-r="later">Weeks later</span>
        ${portfolioHTML(true)}
        <div class="notif" data-r="n">
          <div class="notif__head">${CHIP}<span class="a-tag a-tag--watch">Watch</span></div>
          <p>Markets are down. If your pledged funds fall about 8% more, you'll need to add collateral or repay part.</p>
        </div>`;
    },
    beats: [
      { at: 200, run: r => show(r.later) },
      { at: 1000, run: r => show(r.n) }
    ]
  },
  {
    title: 'Shortfall resolved',
    app: 'Shortfall',
    dur: 7000,
    sees: 'A shortfall card: "Shortfall: ₹18,000. Resolve by Friday, 5 pm." Options: "Pledge more", "Repay part", "Sell a holding you choose". Rohit picks "Pledge more: Corporate Bond Fund", confirms by OTP, and the card turns to "Resolved".',
    agent: "Explains the options and the deadline; Angel Fincap's policy sets thresholds and decides any sale.",
    lit: ['ltv', 'ai', 'fincap', 'rta'],
    render() {
      body.innerHTML = `
        <div class="a-card" style="border:2px solid var(--orange)">
          <div class="notif__head">${CHIP}<span class="a-tag a-tag--watch" data-r="tag">Action needed</span></div>
          <h3 class="a-h" style="margin-top:12px">Shortfall: ${D.shortfall}</h3>
          <p class="a-sub" style="margin:0">Resolve by ${D.deadline}.</p>
        </div>
        <div data-r="opts">
          <div class="a-btn" data-r="pm">Pledge more</div>
          <div class="a-btn a-btn--ghost">Repay part</div>
          <div class="a-btn a-btn--ghost">Sell a holding you choose</div>
        </div>
        <div class="pop" data-r="pick">
          <div class="a-label">Pledge more</div>
          <div class="a-card"><div class="a-row"><span style="display:flex;gap:10px;align-items:center"><i class="a-check is-on"></i>Corporate Bond Fund</span><b>${D.holdings[2].value}</b></div></div>
          <p class="a-note" data-r="msg">Confirming by OTP</p>
          <div class="a-progress"><i data-r="bar"></i></div>
        </div>`;
    },
    beats: [
      { at: 1300, run: (r, i) => tap(r.pm, i) },
      { at: 1600, run: r => { r.opts.style.display = 'none'; show(r.pick); } },
      { at: 2600, dur: 2000, tick: (r, p) => { r.bar.style.transform = `scaleX(${p})`; } },
      { at: 4800, run: r => {
        r.tag.textContent = 'Resolved';
        r.tag.className = 'a-tag a-tag--ok';
        r.msg.textContent = 'Pledged. Your shortfall is resolved.';
      } }
    ]
  },
  {
    title: 'Repayment nudge',
    app: 'Portfolio',
    dur: 6000,
    sees: 'A notification: "Dividend of ₹12,000 credited. Repaying it cuts about ₹4 a day in interest." Button: "Repay ₹12,000".',
    agent: 'Uses signals on the platform to suggest repayment; never moves money without his approval.',
    lit: ['nudge', 'cost'],
    render() {
      body.innerHTML = `
        ${portfolioHTML(true)}
        <div class="notif" data-r="n">
          ${CHIP}
          <p>Dividend of ${D.dividend} credited. Repaying it cuts about ₹4 a day in interest.</p>
          <div class="a-btn">Repay ${D.dividend}</div>
        </div>`;
    },
    beats: [{ at: 900, run: r => show(r.n) }]
  }
];

/* ---------- timeline controller ---------- */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const ui = {
  list: $('#scene-list'),
  title: $('#app-title'),
  step: $('#n-step'),
  nTitle: $('#n-title'),
  sees: $('#n-sees'),
  agent: $('#n-agent'),
  strip: $('#strip'),
  stripSr: $('#strip-sr'),
  progress: $('#progress'),
  play: $('#play'),
  playLabel: $('#play-label'),
  playIcon: $('#play-icon'),
  endcard: $('#endcard')
};

const state = {
  index: 0,
  t: 0,
  playing: false,
  speed: 1,
  ended: false,
  complete: false, // scene was shown in its finished state (paused seek or reduced motion)
  r: {},
  finished: [],
  last: 0
};

function buildChrome() {
  ui.list.innerHTML = SCENES.map((s, k) =>
    `<li><button type="button" data-scene="${k}"><span>${k + 1}</span>${s.title}</button></li>`).join('');
  ui.strip.innerHTML = ARCH.map(layer =>
    `<div class="strip__layer"><span>${layer.name}</span><div class="strip__row">${layer.items.map(([id, label, kind]) =>
      `<span class="chip chip--${kind}" data-id="${id}">${label}</span>`).join('')}</div></div>`).join('');
}

function runBeat(beat, instant) {
  if (beat.dur) beat.tick(state.r, 1);
  else beat.run(state.r, instant);
}

// Apply every remaining beat at once, with transitions switched off.
function finishScene() {
  screen.classList.add('no-anim');
  SCENES[state.index].beats.forEach((b, k) => {
    if (!state.finished[k]) { runBeat(b, true); state.finished[k] = true; }
  });
  requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.remove('no-anim')));
}

function load(index, complete) {
  const scene = SCENES[index];
  state.index = index;
  state.t = 0;
  state.ended = false;
  state.finished = scene.beats.map(() => false);
  ui.endcard.hidden = true;
  screen.querySelectorAll('.tap').forEach(el => el.remove());
  ui.title.textContent = scene.app;
  scene.render();
  state.r = refs(body);
  state.complete = !!complete;
  if (complete) finishScene();
  updateUI();
}

function updateUI() {
  const scene = SCENES[state.index];
  ui.list.querySelectorAll('button').forEach((b, k) => {
    if (k === state.index) b.setAttribute('aria-current', 'step');
    else b.removeAttribute('aria-current');
  });
  const current = ui.list.querySelector('[aria-current]');
  if (current && ui.list.scrollWidth > ui.list.clientWidth) {
    ui.list.scrollTo({ left: current.parentElement.offsetLeft - 16, behavior: reduced.matches ? 'auto' : 'smooth' });
  }
  ui.step.textContent = `Scene ${state.index + 1} of ${SCENES.length}`;
  ui.nTitle.textContent = scene.title;
  ui.sees.textContent = scene.sees;
  ui.agent.textContent = scene.agent;

  const names = [];
  ui.strip.querySelectorAll('.chip').forEach(c => {
    const on = scene.lit.includes(c.dataset.id);
    c.classList.toggle('is-lit', on);
    if (on) names.push(c.textContent);
  });
  ui.stripSr.textContent = `Working in this scene: ${names.join(', ')}.`;
  updatePlayButton();
  setProgress();
}

function updatePlayButton() {
  ui.play.setAttribute('aria-pressed', String(state.playing));
  ui.playLabel.textContent = state.playing ? 'Pause' : 'Play';
  ui.playIcon.innerHTML = state.playing
    ? '<path d="M5 4h3.5v12H5zM11.5 4H15v12h-3.5z" fill="currentColor"/>'
    : '<path d="M6 4l10 6-10 6z" fill="currentColor"/>';
}

function setProgress() {
  const p = state.ended ? 1 : (state.index + Math.min(1, state.t / SCENES[state.index].dur)) / SCENES.length;
  ui.progress.style.transform = `scaleX(${p})`;
}

function end() {
  state.ended = true;
  state.playing = false;
  ui.endcard.hidden = false;
  updatePlayButton();
  setProgress();
}

function play() {
  if (state.ended) { load(0, reduced.matches); }
  else if (state.complete && !reduced.matches) { load(state.index, false); }
  state.playing = true;
  state.last = performance.now();
  updatePlayButton();
}

function pause() {
  state.playing = false;
  updatePlayButton();
}

function toggle() { state.playing ? pause() : play(); }

// Stepping while playing replays the scene; while paused it shows the scene finished.
function seek(index) {
  load(index, !state.playing || reduced.matches);
}

function next() {
  if (state.index < SCENES.length - 1) seek(state.index + 1);
  else end();
}

function prev() {
  if (state.ended) { load(SCENES.length - 1, true); return; }
  seek(Math.max(0, state.index - 1));
}

function restart() {
  load(0, reduced.matches);
  play();
}

function frame(now) {
  const dt = Math.min(100, now - state.last);
  state.last = now;
  if (state.playing && !state.ended) {
    const scene = SCENES[state.index];
    state.t += dt * state.speed;
    scene.beats.forEach((b, k) => {
      if (state.finished[k] || state.t < b.at) return;
      if (b.dur) {
        const p = Math.min(1, (state.t - b.at) / b.dur);
        b.tick(state.r, p);
        if (p === 1) state.finished[k] = true;
      } else {
        b.run(state.r, false);
        state.finished[k] = true;
      }
    });
    setProgress();
    if (state.t >= scene.dur) {
      if (state.index < SCENES.length - 1) load(state.index + 1, reduced.matches);
      else end();
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- phone scaling ---------- */

function fitPhones() {
  document.querySelectorAll('.phone-fit').forEach(fit => {
    const phone = fit.querySelector('.phone');
    const apply = () => phone.style.setProperty('--s', fit.clientWidth / 390);
    apply();
    if ('ResizeObserver' in window) new ResizeObserver(apply).observe(fit);
    else window.addEventListener('resize', apply);
  });
}

/* ---------- wiring ---------- */

function init() {
  buildChrome();
  fitPhones();

  ui.list.addEventListener('click', e => {
    const b = e.target.closest('[data-scene]');
    if (b) seek(Number(b.dataset.scene));
  });
  ui.play.addEventListener('click', toggle);
  $('#next').addEventListener('click', next);
  $('#prev').addEventListener('click', prev);
  $('#restart').addEventListener('click', restart);
  $('#replay').addEventListener('click', restart);

  document.querySelectorAll('[data-speed]').forEach(b => {
    b.addEventListener('click', () => {
      state.speed = Number(b.dataset.speed);
      document.querySelectorAll('[data-speed]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    });
  });

  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === ' ' || e.code === 'Space') {
      if (tag === 'BUTTON' || tag === 'A') return; // let the focused control act
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    }
  });

  const startAt = Math.max(0, Math.min(SCENES.length - 1, (parseInt(new URLSearchParams(location.search).get('scene'), 10) || 1) - 1));
  load(startAt, reduced.matches);
  if (!reduced.matches) play();
  requestAnimationFrame(now => { state.last = now; frame(now); });
}

init();
