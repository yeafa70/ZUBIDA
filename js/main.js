var GAS_URL = 'https://script.google.com/macros/s/AKfycbw6sS6qFtJUgIzg0rs3vuSBv7eb8LHnoEKOOwVMtHiJAbDnq35sAMLaweF5RnZgMqAg/exec';

function trackEvent(eventName, eventParams) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, eventParams || {});
  }
}

function getFieldValue(id) {
  var field = document.getElementById(id);
  return field && field.value ? field.value.replace(/^\s+|\s+$/g, '') : '';
}

function addHiddenField(form, name, value) {
  var input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value || '';
  form.appendChild(input);
}

function initMobileMenu() {
  var btn = document.getElementById('mobile-menu-btn');
  var menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'mobile-menu');
  btn.setAttribute('aria-expanded', 'false');

  btn.onclick = function (event) {
    event.preventDefault();
    var isHidden = menu.className.indexOf('hidden') !== -1 || menu.style.display === 'none';
    if (isHidden) {
      menu.className = menu.className.replace(/\bhidden\b/g, '').replace(/\s+/g, ' ');
      menu.style.display = 'block';
      btn.setAttribute('aria-expanded', 'true');
    } else {
      if (menu.className.indexOf('hidden') === -1) menu.className += ' hidden';
      menu.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
    }
  };

  var links = menu.getElementsByTagName('a');
  for (var i = 0; i < links.length; i += 1) {
    links[i].onclick = function () {
      if (menu.className.indexOf('hidden') === -1) menu.className += ' hidden';
      menu.style.display = 'none';
      btn.setAttribute('aria-expanded', 'false');
    };
  }
}

function initGaClickEvents() {
  var gaElements = document.querySelectorAll('[data-ga-event]');
  for (var i = 0; i < gaElements.length; i += 1) {
    gaElements[i].addEventListener('click', function () {
      trackEvent(this.getAttribute('data-ga-event'), {
        event_label: this.getAttribute('data-ga-label') || this.textContent.replace(/^\s+|\s+$/g, ''),
        page_path: location.pathname
      });
    });
  }
}

function submitRentalForm(event) {
  if (event && event.preventDefault) event.preventDefault();

  var form = document.getElementById('rentalForm');
  var btn = document.getElementById('submitBtn');
  if (!form) return false;

  var old = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '送出中...';
  }

  var name = getFieldValue('entryName');
  var phone = getFieldValue('entryPhone');
  var service = getFieldValue('entryService');
  var date = getFieldValue('entryDate');
  var message = getFieldValue('entryMsg');
  var leadEventParams = {
    event_category: 'lead',
    service: service,
    page_path: location.pathname,
    page_title: document.title
  };

  trackEvent('form_submit_attempt', leadEventParams);

  var payload = {
    name: name,
    phone: phone,
    service: service,
    date: date,
    message: message,
    entryName: name,
    entryPhone: phone,
    entryService: service,
    entryDate: date,
    entryMsg: message,
    contact_name: name,
    contact_phone: phone,
    rental_item: service,
    event_date: date,
    note: message,
    userAgent: navigator.userAgent,
    '姓名/單位': name,
    '電話': phone,
    '主要需求設備': service,
    '預計活動日期': date,
    '活動地點與需求備註': message,
    '來源頁面': location.href,
    'User Agent': navigator.userAgent,
    'IP/備註': '',
    '處理狀態': '未處理',
    'Telegram通知狀態': '未通知',
    page: location.href,
    page_path: location.pathname,
    page_title: document.title,
    submitted_at: new Date().toISOString(),
    source: 'zubida_website'
  };

  var iframeName = 'gas-submit-frame';
  var iframe = document.querySelector('iframe[name="' + iframeName + '"]');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  var postForm = document.createElement('form');
  postForm.method = 'POST';
  postForm.action = GAS_URL;
  postForm.target = iframeName;
  postForm.style.display = 'none';

  for (var key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      addHiddenField(postForm, key, payload[key]);
    }
  }

  document.body.appendChild(postForm);

  var finished = false;
  function finishSubmit() {
    if (finished) return;
    finished = true;
    alert('表單已送出，租必達將儘快與您聯繫。若需求急迫，也歡迎直接來電：0920-633-116');
    trackEvent('form_submit_success', leadEventParams);
    trackEvent('generate_lead', {
      currency: 'TWD',
      value: 1,
      lead_type: service,
      page_path: location.pathname
    });
    form.reset();
    if (postForm.parentNode) postForm.parentNode.removeChild(postForm);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = old;
    }
  }

  iframe.onload = finishSubmit;
  postForm.submit();
  window.setTimeout(finishSubmit, 1800);
  return false;
}

function initRentalForm() {
  var form = document.getElementById('rentalForm');
  if (form) form.onsubmit = submitRentalForm;
}

document.addEventListener('DOMContentLoaded', function () {
  initMobileMenu();
  initGaClickEvents();
  initRentalForm();
});
