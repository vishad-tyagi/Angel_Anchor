/* Angel Anchor: interactions on the strategy page */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Phone scaling: the 390 x 844 phone is scaled to its container width. */
  $$('.phone-fit').forEach(fit => {
    const phone = $('.phone', fit);
    const apply = () => phone.style.setProperty('--s', fit.clientWidth / 390);
    apply();
    if ('ResizeObserver' in window) new ResizeObserver(apply).observe(fit);
    else window.addEventListener('resize', apply);
  });

  /* Mobile navigation */
  const navToggle = $('.nav-toggle');
  const navList = $('#nav-list');
  function setNav(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navList.classList.toggle('is-open', open);
  }
  navToggle.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
  navList.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navList.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
  });

  /* Routing diagram */
  const route = $('#route');
  const routeStatus = $('#route-status');
  const ROUTE_TEXT = {
    covers: 'Holdings cover the need: the eligibility engine routes to own-book LAS, Phase 1.',
    short: 'Holdings fall short: the eligibility engine routes to all matching offers, Phase 2.'
  };
  $$('[data-route]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.route;
      $$('[data-route]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      route.removeAttribute('data-active');
      void route.offsetWidth; // restart the line animation
      route.dataset.active = key;
      routeStatus.textContent = ROUTE_TEXT[key];
    });
  });

  /* Architecture diagram side panel */
  const ARCH = {
    surfaces: ['App surfaces', 'Where customers meet the agent: the portfolio screen, banners at the moment of need, the hand-off from Ask Angel, and alerts.'],
    ai: ['AI model', 'Understands what the customer asks and explains the options in plain language. It never calculates: every number it uses comes from a rules engine.'],
    guardrails: ['Guardrails', 'Checks every action against the customer\'s consent and the agent\'s action limits, and keeps an audit log of engine calls, messages and authorisations.'],
    eligibility: ['Eligibility engine', 'Works out how much a customer can borrow from their holdings, using the approved-securities list and haircuts.'],
    cost: ['Cost and tax engine', 'Calculates interest, the fee and the estimated tax on selling, so the customer can compare borrowing with selling.'],
    ltv: ['LTV monitor', 'Watches the value of pledged holdings daily and on market events, and raises an early warning before a margin call.'],
    nudge: ['Nudge engine', 'Decides when a banner, alert or reminder is allowed and which approved template to use.'],
    integration: ['Integration layer', 'APIs and an event stream connect the agent to the systems of record. Events, such as a redemption starting, wake the agent up.'],
    platform: ['Angel One platform', 'Holdings, KYC and customer events. The agent reads these to pre-fill every journey.'],
    fincap: ['Angel Fincap', 'The lender. It sanctions the loan, issues the Key Fact Statement, collects the e-signature, and decides any sale of pledged holdings.'],
    rails: ['CDSL, CAMS and KFintech', 'Where pledges and liens are recorded. Shares are pledged through CDSL, where Angel One is the depository participant; mutual fund liens go by API to CAMS or KFintech.'],
    partners: ['Partner lenders', 'Phase 2. When LAS cannot fully serve a need, partner offers are shown alongside it, ranked by APR, and the customer chooses.']
  };
  const panel = $('#arch-panel');
  const panelTitle = $('#arch-panel-title');
  const panelText = $('#arch-panel-text');
  const narrow = window.matchMedia('(max-width: 1000px)');
  // On narrow screens the panel sits under the selected layer, so it stays in view.
  function placePanel(btn) {
    if (narrow.matches && btn) btn.closest('.arch__layer').after(panel);
    else $('#arch').after(panel);
  }
  $$('[data-arch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [title, text] = ARCH[btn.dataset.arch];
      $$('[data-arch]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      panelTitle.textContent = title;
      panelText.textContent = text;
      placePanel(btn);
    });
  });
  narrow.addEventListener('change', () => placePanel($('[data-arch][aria-pressed="true"]')));

  /* State machine */
  const SM = {
    healthy: { label: 'Healthy', tag: 'a-tag--ok', msg: 'Dividend of ₹12,000 credited. Repaying it cuts about ₹4 a day in interest.' },
    watch: { label: 'Watch', tag: 'a-tag--watch', msg: 'Markets are down. If your pledged funds fall about 8% more, you\'ll need to add collateral or repay part.' },
    shortfall: { label: 'Shortfall', tag: 'a-tag--watch', msg: 'Shortfall: ₹18,000. Resolve by Friday, 5 pm. Options: pledge more, repay part, or sell a holding you choose.' },
    cured: { label: 'Cured', tag: 'a-tag--ok', msg: 'Resolved. Your pledged holdings cover your loan again.' },
    invoked: { label: 'Invoked', tag: 'a-tag--grey', msg: 'The deadline has passed. Angel Fincap is selling pledged holdings under its policy and will confirm what was sold.' }
  };
  const MOVES = {
    fall: { healthy: 'watch', watch: 'shortfall', cured: 'watch' },
    pledge: { watch: 'healthy', shortfall: 'cured' },
    miss: { shortfall: 'invoked' },
    reset: { healthy: 'healthy', watch: 'healthy', shortfall: 'healthy', cured: 'healthy', invoked: 'healthy' }
  };
  const NO_MOVE = {
    fall: 'Prices fall further, but the state stays the same.',
    pledge: 'Nothing to cure in this state.',
    miss: 'No deadline is running in this state.'
  };
  let smState = 'healthy';
  const smNotif = $('#sm-notif');
  const smTag = $('#sm-tag');
  const smMsg = $('#sm-msg');
  const smStatus = $('#sm-status');
  function setState(next) {
    smState = next;
    const s = SM[next];
    $$('.sm__state').forEach(li => li.classList.toggle('is-current', li.dataset.state === next));
    smTag.textContent = s.label;
    smTag.className = 'a-tag ' + s.tag;
    smMsg.textContent = s.msg;
    smNotif.classList.toggle('notif--grey', next === 'invoked');
    smNotif.classList.remove('is-swap');
    void smNotif.offsetWidth;
    smNotif.classList.add('is-swap');
  }
  $$('[data-sm]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.sm;
      const next = MOVES[action][smState];
      if (next) {
        setState(next);
        smStatus.textContent = `Current state: ${SM[next].label}. Message: ${SM[next].msg}`;
      } else {
        smStatus.textContent = `Current state: ${SM[smState].label}. ${NO_MOVE[action]}`;
      }
    });
  });

  /* Cost comparison */
  const costStatus = $('#cost-status');
  function setCost(mode) {
    $$('[data-cost]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cost === mode)));
    $$('#cost-bars .bar').forEach(bar => {
      const bank = Number(bar.dataset.bank);
      const v = Number(bar.dataset[mode]) / bank;
      const fill = $('.bar__fill', bar);
      fill.style.setProperty('--v', v);
      fill.classList.toggle('bar__fill--orange', mode === 'agent');
      $('.bar__val', bar).textContent = bar.dataset[mode + 'Label'];
    });
    costStatus.textContent = mode === 'bank'
      ? 'Showing the bank-style model. The thin line marks the bank-style level.'
      : 'Showing the model with Angel Anchor. The thin line marks the bank-style level.';
  }
  $$('[data-cost]').forEach(b => b.addEventListener('click', () => setCost(b.dataset.cost)));
  setCost('bank');

  /* Year 3 scenario tabs */
  const SCENARIOS = {
    conservative: { book: '₹850 cr', interest: '₹102 cr', net: '₹50 cr', profit: '₹40 cr', note: 'Conservative: 0.5% of custody assets.' },
    base: { book: '₹1,700 cr', interest: '₹204 cr', net: '₹101 cr', profit: '₹81 cr', note: 'Base: 1% of custody assets.' },
    ambitious: { book: '₹3,400 cr', interest: '₹408 cr', net: '₹202 cr', profit: '₹161 cr', note: 'Ambitious: 2% of custody assets.' }
  };
  const tabs = $$('#sc-tabs [role="tab"]');
  const scPanel = $('#sc-panel');
  const grid = $('#sc-grid');
  function selectTab(tab, focus) {
    const key = tab.dataset.sc;
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    scPanel.setAttribute('aria-labelledby', tab.id);
    grid.classList.toggle('scenario--base', key === 'base');
    $$('[data-k]', grid).forEach(el => {
      el.textContent = SCENARIOS[key][el.dataset.k];
      el.classList.remove('is-swap');
      void el.offsetWidth;
      el.classList.add('is-swap');
    });
    $('#sc-note').textContent = SCENARIOS[key].note;
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); selectTab(tabs[j], true); }
    });
  });
})();
