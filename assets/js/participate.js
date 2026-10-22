// Participate pages: step tick boxes with saved progress, request forms that
// open a pre-filled email, the newsletter sign-up check and the ELIXIR Europe
// group tabs. Everything still works as plain links without this script.
(function () {
  'use strict';

  // navigation.js re-injects page scripts on AJAX navigation; listeners are
  // delegated on document, so a second copy would bind them twice
  if (window.initializeParticipate) return;

  const CONTACT = 'elixir@ul.ie';

  // MailerLite embedded forms, one per group. Each form adds people to its
  // own group: Irish HEI and partner emails to "ELIXIR Ireland members", other
  // academic/work emails to "Pending approval". Paste each form's action URL
  // from its embed code (https://assets.mailerlite.com/jsonp/.../subscribe).
  // While empty, sign-ups open a pre-filled email to CONTACT instead.
  const MAILERLITE = {
    member: 'https://assets.mailerlite.com/jsonp/2732019/forms/201986291520242908/subscribe',
    pending: 'https://assets.mailerlite.com/jsonp/2732019/forms/201986229959394818/subscribe'
  };

  // Email domains that go straight to the members group: Irish higher
  // education institutions (current and pre-merger domains), ICHEC, Asiera
  // and Teagasc. Subdomains match too, so student mail such as
  // studentmail.ul.ie, umail.ucc.ie or student.tus.ie needs no entry.
  const MEMBER_DOMAINS = [
    // Universities
    'tcd.ie', 'ucd.ie', 'ucdconnect.ie', 'ucc.ie', 'universityofgalway.ie',
    'nuigalway.ie', 'mu.ie', 'mumail.ie', 'nuim.ie', 'ul.ie', 'dcu.ie',
    'rcsi.ie', 'rcsi.com',
    // Technological universities, with the institutes they merged from
    'tudublin.ie', 'mytudublin.ie', 'dit.ie', 'mydit.ie', 'itb.ie',
    'it-tallaght.ie', 'ittdublin.ie',
    'mtu.ie', 'mymtu.ie', 'cit.ie', 'mycit.ie', 'ittralee.ie',
    'setu.ie', 'wit.ie', 'itcarlow.ie', 'waltoninstitute.ie',
    'atu.ie', 'gmit.ie', 'lyit.ie', 'itsligo.ie',
    'tus.ie', 'ait.ie', 'lit.ie',
    // Other higher education institutions
    'dkit.ie', 'iadt.ie', 'ncirl.ie', 'ncad.ie', 'mie.ie', 'riam.ie', 'dias.ie',
    // Partners and research bodies
    'ichec.ie', 'asiera.ie', 'teagasc.ie'
  ];

  // Personal webmail is refused everywhere
  const WEBMAIL_DOMAINS = [
    'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.co.uk', 'hotmail.ie',
    'outlook.com', 'outlook.ie', 'live.com', 'live.ie', 'live.co.uk', 'msn.com',
    'yahoo.com', 'yahoo.ie', 'yahoo.co.uk', 'ymail.com', 'icloud.com', 'me.com',
    'mac.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'gmx.net',
    'mail.com', 'eircom.net', 'zoho.com', 'yandex.com', 'qq.com'
  ];

  function storageGet(key) {
    try { return JSON.parse(window.localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }

  function storageSet(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  function domainOf(email) {
    const at = email.lastIndexOf('@');
    return at === -1 ? '' : email.slice(at + 1).trim().toLowerCase();
  }

  function matchesDomain(domain, list) {
    return list.some(function (d) { return domain === d || domain.endsWith('.' + d); });
  }

  function emailRoute(email) {
    const domain = domainOf(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'invalid';
    if (matchesDomain(domain, WEBMAIL_DOMAINS)) return 'webmail';
    if (matchesDomain(domain, MEMBER_DOMAINS)) return 'member';
    return 'pending';
  }

  function openMail(to, subject, body, cc) {
    let url = 'mailto:' + to + '?subject=' + encodeURIComponent(subject);
    if (cc) url += '&cc=' + encodeURIComponent(cc);
    url += '&body=' + encodeURIComponent(body);
    window.location.href = url;
  }

  function setMessage(form, text, kind) {
    const msg = form.querySelector('.onb-form__msg');
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'onb-form__msg' + (kind ? ' onb-form__msg--' + kind : '');
  }

  // Label text for a form field, without the "(optional)" hint
  function labelFor(form, field) {
    const label = form.querySelector('label[for="' + field.id + '"]');
    return label ? label.textContent.replace(/\s*\(optional\)\s*$/i, '').trim() : field.name;
  }

  // ---- Step tick boxes and progress ----

  function renderProgress(list) {
    const key = list.getAttribute('data-progress-key');
    const steps = list.querySelectorAll('.onb-step[data-step]');
    const done = storageGet(key);
    let count = 0;

    steps.forEach(function (step) {
      const isDone = done.indexOf(step.getAttribute('data-step')) !== -1;
      step.classList.toggle('onb-step--done', isDone);
      const btn = step.querySelector('.onb-step__done');
      if (btn) {
        btn.setAttribute('aria-pressed', isDone ? 'true' : 'false');
        const text = btn.querySelector('.onb-step__done-text');
        if (text) text.textContent = isDone ? 'Done' : 'Mark as done';
      }
      if (isDone) count++;
    });

    const progress = document.querySelector('.onb-progress[data-progress-key="' + key + '"]');
    if (progress) {
      const total = steps.length;
      progress.querySelector('.onb-progress__count').textContent = count + ' of ' + total + ' done';
      progress.querySelector('.onb-progress__bar').style.width = (total ? (count / total) * 100 : 0) + '%';
      progress.querySelector('.onb-progress__track').setAttribute('aria-valuenow', String(count));
    }
  }

  function toggleStep(btn) {
    const step = btn.closest('.onb-step');
    const list = btn.closest('.onb-steps');
    if (!step || !list) return;
    const key = list.getAttribute('data-progress-key');
    const id = step.getAttribute('data-step');
    const done = storageGet(key);
    const i = done.indexOf(id);
    if (i === -1) done.push(id); else done.splice(i, 1);
    storageSet(key, done);
    renderProgress(list);
  }

  function resetSteps(btn) {
    const key = btn.closest('.onb-progress').getAttribute('data-progress-key');
    storageSet(key, []);
    const list = document.querySelector('.onb-steps[data-progress-key="' + key + '"]');
    if (list) renderProgress(list);
  }

  // A step's main action also ticks it off, so people don't have to
  function autoComplete(link) {
    const step = link.closest('.onb-step[data-step]');
    const list = link.closest('.onb-steps[data-progress-key]');
    if (!step || !list || !(link.hasAttribute('data-completes') || link.matches('form'))) return;
    const key = list.getAttribute('data-progress-key');
    const done = storageGet(key);
    if (done.indexOf(step.getAttribute('data-step')) === -1) {
      done.push(step.getAttribute('data-step'));
      storageSet(key, done);
      renderProgress(list);
    }
  }

  // ---- Forms ----

  // Generic request form: lists every filled field and ticked box in the
  // email body. data-to, data-cc and data-subject set the envelope.
  function submitRequest(form) {
    if (form.hasAttribute('data-needs-choice') && !form.querySelector('input[type="checkbox"]:checked')) {
      setMessage(form, 'Please tick at least one item.', 'error');
      return;
    }

    const required = form.querySelectorAll('[required]');
    for (let i = 0; i < required.length; i++) {
      if (!required[i].value.trim()) {
        setMessage(form, 'Please fill in ' + labelFor(form, required[i]).toLowerCase() + '.', 'error');
        required[i].focus();
        return;
      }
    }

    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value.trim()) {
      const route = emailRoute(emailField.value);
      if (route === 'invalid' || route === 'webmail') {
        setMessage(form, 'Please use your institutional email address.', 'error');
        emailField.focus();
        return;
      }
    }

    const ticked = Array.prototype.map.call(
      form.querySelectorAll('input[type="checkbox"]:checked'),
      function (box) { return box.getAttribute('data-label') || box.value; }
    );
    const lines = [];
    if (ticked.length) {
      lines.push(form.getAttribute('data-list-heading') || 'Please give me access to:');
      ticked.forEach(function (t) { lines.push('- ' + t); });
      lines.push('');
    }
    form.querySelectorAll('input[type="text"], input[type="email"], select, textarea').forEach(function (field) {
      if (field.value.trim()) lines.push(labelFor(form, field) + ': ' + field.value.trim());
    });
    lines.push('', 'Thanks');

    let subject = form.getAttribute('data-subject') || 'Request';
    const nameField = form.querySelector('[name="name"]');
    if (nameField && nameField.value.trim()) subject += ': ' + nameField.value.trim();

    setMessage(form, 'Your email app should open with the request ready to send.', 'ok');
    openMail(form.getAttribute('data-to') || CONTACT, subject, lines.join('\n'), form.getAttribute('data-cc'));
  }

  function submitNewsletter(form) {
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const institute = form.querySelector('[name="institute"]');
    const consent = form.querySelector('[name="consent"]');

    if (!name) { setMessage(form, 'Please enter your name.', 'error'); return; }
    const route = emailRoute(email);
    if (route === 'invalid') { setMessage(form, 'Please enter a valid email address.', 'error'); return; }
    if (route === 'webmail') {
      setMessage(form, 'Please use your institutional email address. Personal addresses (Gmail, Outlook.com and similar) are not accepted.', 'error');
      return;
    }
    if (consent && !consent.checked) { setMessage(form, 'Please tick the box to agree to receive the newsletter.', 'error'); return; }

    const instituteName = institute && institute.value ? institute.value : '';

    const action = MAILERLITE[route === 'member' ? 'member' : 'pending'];
    if (action) {
      const data = new FormData();
      data.append('fields[name]', name);
      data.append('fields[email]', email);
      if (instituteName) data.append('fields[company]', instituteName);
      data.append('ml-submit', '1');
      data.append('anticsrf', 'true');
      setMessage(form, 'Sending…', 'ok');
      fetch(action, { method: 'POST', body: data, mode: 'no-cors' })
        .then(function () {
          setMessage(form, route === 'member'
            ? 'Thanks. Check your inbox and click the link to confirm your subscription.'
            : 'Thanks. Check your inbox to confirm, then we will review your subscription because your email is not from an Irish higher education institution.', 'ok');
          form.reset();
        })
        .catch(function () {
          setMessage(form, 'That did not go through. Please email ' + CONTACT + ' and we will add you.', 'error');
        });
      return;
    }

    const body = [
      'Please add me to the ELIXIR Ireland newsletter.',
      '',
      'Name: ' + name,
      'Email: ' + email,
      instituteName ? 'Institute: ' + instituteName : '',
      '',
      'Thanks'
    ].filter(function (l, i, arr) { return l !== '' || arr[i - 1] !== ''; }).join('\n');
    setMessage(form, 'Your email app should open with the request ready to send.', 'ok');
    openMail(CONTACT, 'Newsletter sign-up: ' + name, body);
  }

  // VIBE list: LISTSERV subscribes from a one-line email command
  function submitListserv(form) {
    const name = form.querySelector('[name="name"]').value.trim();
    if (!name) {
      setMessage(form, 'Please enter your full name.', 'error');
      return;
    }
    setMessage(form, 'Your email app should open with the sign-up email ready to send.', 'ok');
    openMail('LISTSERV@LISTSERV.HEANET.IE', 'Subscribe', 'SUBSCRIBE BIOINFORMATICS ' + name);
    autoComplete(form);
  }

  function copyText(btn) {
    const text = btn.getAttribute('data-copy');
    const label = btn.textContent;
    const done = function () {
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = label; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { window.prompt('Copy this link:', text); });
    } else {
      window.prompt('Copy this link:', text);
    }
  }

  // ---- Group tabs ----

  function selectTab(tab) {
    const tabs = tab.closest('.onb-tabs');
    tabs.querySelectorAll('.onb-tab').forEach(function (t) {
      const selected = t === tab;
      t.setAttribute('aria-selected', selected ? 'true' : 'false');
      t.setAttribute('tabindex', selected ? '0' : '-1');
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
  }

  // ---- Delegated listeners (bound once) ----

  document.addEventListener('click', function (e) {
    const doneBtn = e.target.closest('.onb-step__done');
    if (doneBtn) { toggleStep(doneBtn); return; }

    const resetBtn = e.target.closest('.onb-progress__reset');
    if (resetBtn) { resetSteps(resetBtn); return; }

    const tab = e.target.closest('.onb-tab');
    if (tab) { selectTab(tab); return; }

    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) { copyText(copyBtn); return; }

    const link = e.target.closest('a[data-completes]');
    if (link) autoComplete(link);
  });

  document.addEventListener('keydown', function (e) {
    const tab = e.target.closest && e.target.closest('.onb-tab');
    if (!tab || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    const all = Array.prototype.slice.call(tab.closest('.onb-tabs').querySelectorAll('.onb-tab'));
    const next = all[(all.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
    selectTab(next);
    next.focus();
  });

  document.addEventListener('submit', function (e) {
    const form = e.target;
    if (form.matches('form[data-onb-newsletter]')) {
      e.preventDefault();
      submitNewsletter(form);
    } else if (form.matches('form[data-onb-listserv]')) {
      e.preventDefault();
      submitListserv(form);
    } else if (form.matches('form[data-onb-request]')) {
      e.preventDefault();
      submitRequest(form);
    }
  });

  window.initializeParticipate = function () {
    document.querySelectorAll('.onb-steps[data-progress-key]').forEach(renderProgress);
  };

  window.resetParticipate = function () { /* listeners are delegated; nothing to tear down */ };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeParticipate);
  } else {
    window.initializeParticipate();
  }
})();
