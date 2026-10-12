/* ============================================================
   Things to Do: community events carousel + submission form
   Events live in the "Visit Watseka Events" Google Sheet and are
   served by its Apps Script web app. Only approved, upcoming
   events come back. Paste the web app URL below after deploying.
   ============================================================ */

var EVENTS_API_URL = 'https://script.google.com/macros/s/AKfycbwTDH8nIEx15IzDbsR5pxHwq-GxlsMjPDPxzwHFiRA_g22DohQBv6VrPW5w9f9xdqCQ/exec';

(function () {
  var MAX_SIDE = 1600;       // flyers are shrunk to this before upload
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function parseIso(s) {
    var p = String(s).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function fmtDay(s, withYear) {
    var d = parseIso(s);
    var out = DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
    return withYear ? out + ', ' + d.getFullYear() : out;
  }

  function fmtWhen(ev, withYear) {
    var when = fmtDay(ev.startDate, withYear);
    if (ev.endDate) when += ' to ' + fmtDay(ev.endDate, withYear);
    return when;
  }

  function fmtTime(ev) {
    if (ev.startTime && ev.endTime) return ev.startTime + ' to ' + ev.endTime;
    return ev.startTime || '';
  }

  /* ── Carousel ─────────────────────────────────────────── */
  function initCarousel() {
    var wrap = document.getElementById('events-carousel');
    if (!wrap) return;
    var track = wrap.querySelector('.ev-track');
    var status = wrap.querySelector('.ev-status');
    var prev = wrap.querySelector('.ev-prev');
    var next = wrap.querySelector('.ev-next');

    function showStatus(msg) {
      status.textContent = msg;
      status.hidden = false;
      track.hidden = true;
      prev.hidden = next.hidden = true;
    }

    if (!EVENTS_API_URL) {
      showStatus('Community events are coming soon. Have one to share? Submit it below.');
      return;
    }

    fetch(EVENTS_API_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var events = (data && data.events) || [];
        if (!events.length) {
          showStatus('No upcoming events are posted right now. Have one to share? Submit it below.');
          return;
        }
        status.hidden = true;
        track.hidden = false;
        events.forEach(function (ev) { track.appendChild(card(ev)); });
        updateArrows();
      })
      .catch(function () {
        showStatus('We could not load events right now. Please check back soon.');
      });

    function card(ev) {
      var btn = el('button', 'ev-card');
      btn.type = 'button';
      btn.setAttribute('aria-label', ev.title + ', ' + fmtWhen(ev, false) + '. View details');

      var media = el('div', 'ev-card-media');
      if (ev.image) {
        var img = el('img');
        img.src = ev.image;
        img.alt = '';
        img.loading = 'lazy';
        media.appendChild(img);
      } else {
        media.appendChild(el('span', 'ev-card-noimg', ev.title));
      }
      btn.appendChild(media);

      var body = el('div', 'ev-card-body');
      body.appendChild(el('div', 'ev-card-date', fmtWhen(ev, false)));
      body.appendChild(el('div', 'ev-card-title', ev.title));
      var meta = [fmtTime(ev), ev.location].filter(Boolean).join(' · ');
      if (meta) body.appendChild(el('div', 'ev-card-meta', meta));
      btn.appendChild(body);

      btn.addEventListener('click', function () { openModal(ev, btn); });
      return btn;
    }

    function step() {
      var c = track.querySelector('.ev-card');
      return c ? c.getBoundingClientRect().width + 20 : 300;
    }
    function updateArrows() {
      var max = track.scrollWidth - track.clientWidth;
      prev.hidden = next.hidden = max <= 4;
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= max - 4;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
  }

  /* ── Event detail modal ───────────────────────────────── */
  var modal, lastFocus;

  function openModal(ev, from) {
    modal = modal || document.getElementById('ev-modal');
    lastFocus = from;
    var img = modal.querySelector('.ev-modal-flyer img');
    var flyer = modal.querySelector('.ev-modal-flyer');
    if (ev.image) {
      img.src = ev.image;
      img.alt = 'Flyer for ' + ev.title;
      flyer.hidden = false;
    } else {
      flyer.hidden = true;
    }
    modal.querySelector('.ev-modal-title').textContent = ev.title;
    modal.querySelector('.ev-modal-when').textContent = fmtWhen(ev, true);
    setLine('.ev-modal-time', fmtTime(ev));
    setLine('.ev-modal-where', [ev.location, ev.address].filter(Boolean).join(', '));
    setLine('.ev-modal-host', ev.hostedBy ? 'Hosted by ' + ev.hostedBy : '');
    modal.querySelector('.ev-modal-desc').textContent = ev.description || '';

    var link = modal.querySelector('.ev-modal-link');
    link.hidden = !ev.link;
    if (ev.link) link.href = ev.link;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.ev-modal-close').focus();
  }

  function setLine(sel, text) {
    var n = modal.querySelector(sel);
    n.hidden = !text;
    n.querySelector('span').textContent = text;
  }

  function closeModal() {
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function initModal() {
    var m = document.getElementById('ev-modal');
    if (!m) return;
    m.addEventListener('click', function (e) {
      if (e.target === m || e.target.closest('.ev-modal-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ── Submission form ──────────────────────────────────── */
  function to12h(v) {
    if (!v) return '';
    var p = v.split(':');
    var h = +p[0];
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + p[1] + ' ' + ampm;
  }

  // Shrink big phone photos so uploads are quick and under the limit.
  function readFlyer(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        var dataUrl = c.toDataURL('image/jpeg', 0.85);
        resolve({ name: file.name, type: 'image/jpeg', data: dataUrl.split(',')[1] });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('That file could not be read as an image. Please try a JPG or PNG.'));
      };
      img.src = url;
    });
  }

  function initForm() {
    var form = document.getElementById('event-form');
    if (!form) return;
    var fileInput = form.querySelector('input[name="flyer"]');
    var preview = form.querySelector('.ev-flyer-preview');
    var errorBox = form.querySelector('.ev-form-error');
    var submitBtn = form.querySelector('button[type="submit"]');
    var startInput = form.querySelector('input[name="startDate"]');
    var endInput = form.querySelector('input[name="endDate"]');

    var today = new Date();
    var iso = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    startInput.min = iso;
    endInput.min = iso;
    startInput.addEventListener('change', function () { endInput.min = startInput.value || iso; });

    fileInput.addEventListener('change', function () {
      preview.innerHTML = '';
      var f = fileInput.files[0];
      if (!f) { preview.hidden = true; return; }
      var img = el('img');
      img.alt = 'Flyer preview';
      img.src = URL.createObjectURL(f);
      preview.appendChild(img);
      preview.hidden = false;
    });

    function fail(msg) {
      errorBox.textContent = msg;
      errorBox.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Event';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorBox.hidden = true;

      if (!EVENTS_API_URL) {
        fail('Event submissions are not open yet. Please check back soon.');
        return;
      }
      var fd = new FormData(form);
      if (fd.get('endDate') && fd.get('endDate') < fd.get('startDate')) {
        fail('The end date is before the start date.');
        return;
      }
      var file = fileInput.files[0];
      if (!file) { fail('Please attach a flyer image.'); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      readFlyer(file).then(function (image) {
        var payload = {
          title: fd.get('title'),
          startDate: fd.get('startDate'),
          endDate: fd.get('endDate'),
          startTime: to12h(fd.get('startTime')),
          endTime: to12h(fd.get('endTime')),
          location: fd.get('location'),
          address: fd.get('address'),
          description: fd.get('description'),
          link: fd.get('link'),
          hostedBy: fd.get('hostedBy'),
          contactName: fd.get('contactName'),
          contactEmail: fd.get('contactEmail'),
          contactPhone: fd.get('contactPhone'),
          note: fd.get('note'),
          website: fd.get('website'),
          image: image
        };
        // Sent as plain text so the browser skips the CORS preflight,
        // which Apps Script does not answer.
        return fetch(EVENTS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        }).then(function (r) { return r.json(); });
      }).then(function (res) {
        if (!res || !res.ok) { fail((res && res.error) || 'Something went wrong. Please try again.'); return; }
        form.hidden = true;
        var thanks = document.getElementById('event-thanks');
        thanks.hidden = false;
        thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).catch(function (err) {
        fail(err && err.message && err.message.indexOf('image') !== -1
          ? err.message
          : 'We could not send your event. Please check your connection and try again.');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCarousel();
    initModal();
    initForm();
  });
})();
