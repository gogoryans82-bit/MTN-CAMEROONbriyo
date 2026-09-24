:root {
  --mtn-dark: #003366;
  --mtn-gold: #FFD700;
  --mtn-light: #004080;
  --grad: linear-gradient(to right, #003366, #004080);
  --page-bg: #F5F5F5;
  --white: #FFFFFF;
  --text-dark: #1C2340;
  --text-mid: #444;
  --text-light: #888;
  --border: #ddd;
  --radius: 12px;
  --radius-sm: 8px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--page-bg);
  color: var(--text-dark);
  min-height: 100vh;
}

.mtn-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.mtn-logo-icon {
  width: 45px;
  height: 45px;
  background: var(--mtn-gold);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--mtn-dark);
  position: relative;
}

.mtn-logo-icon::after {
  content: 'M';
  font-size: 2rem;
  font-weight: 900;
}

.mtn-logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--mtn-dark);
}

.mtn-logo-sub {
  font-size: 0.65rem;
  color: #888;
  font-weight: 500;
}

.page {
  display: none;
  min-height: 100vh;
  animation: fadeIn 0.3s ease;
}

.page.active {
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px);
  z-index: 999;
  align-items: center;
  justify-content: center;
}

.overlay.show {
  display: flex;
}

.modal {
  background: var(--white);
  border-radius: var(--radius);
  padding: 40px 36px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: popIn 0.3s cubic-bezier(.34,1.56,.64,1);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #eee;
  border-top-color: var(--mtn-gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 18px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.modal p {
  font-size: 0.88rem;
  color: var(--text-light);
}

.navbar {
  background: var(--mtn-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  height: 54px;
  position: relative;
  flex-shrink: 0;
}

.nav-left {
  position: absolute;
  left: 20px;
  color: rgba(255,255,255,0.6);
  font-size: 0.84rem;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.nav-left:hover {
  color: #fff;
}

.nav-right {
  position: absolute;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  padding: 4px;
}

.hline {
  width: 20px;
  height: 2px;
  background: rgba(255,255,255,0.6);
  border-radius: 1px;
}

.btn-grad {
  background: var(--grad);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  width: 100%;
  font-family: 'Inter', sans-serif;
  transition: opacity 0.2s;
}

.btn-grad:hover {
  opacity: 0.9;
}

.btn-grad:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-gray {
  background: #e0e0e0;
  color: #666;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  flex: 1;
  font-family: 'Inter', sans-serif;
  transition: background 0.2s;
}

.btn-gray:hover {
  background: #d0d0d0;
}

.field {
  margin-bottom: 18px;
}

.field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-mid);
  margin-bottom: 6px;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--text-dark);
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--mtn-gold);
}

.sel-wrap {
  position: relative;
}

.sel-wrap::after {
  content: '▾';
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  pointer-events: none;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.phone-row {
  display: flex;
}

.ph-pre {
  padding: 11px 12px;
  background: #f5f5f5;
  border: 1.5px solid var(--border);
  border-right: none;
  border-radius: var(--radius-sm) 0 0 var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  display: flex;
  align-items: center;
}

.phone-row input {
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0 !important;
  flex: 1;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 5px;
}

.prog-row {
  display: flex;
  gap: 8px;
  margin: 10px 0 24px;
}

.prog-seg {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
  transition: background 0.3s;
}

.prog-seg.done,
.prog-seg.now {
  background: var(--mtn-gold);
}

.step-btns {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.step-btns .btn-grad {
  flex: 1;
}

.pg-footer {
  margin-top: auto;
  padding: 14px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-light);
  background: #fff;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

#page-landing {
  background: var(--page-bg);
}

.land-nav {
  background: var(--mtn-dark);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 52px;
  flex-shrink: 0;
}

.land-nav .hbg {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.land-nav .hbg span {
  width: 20px;
  height: 2px;
  background: rgba(255,255,255,0.7);
  border-radius: 1px;
  display: block;
}

.land-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.land-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  padding: 36px 32px;
}

.land-card h1 {
  font-size: 1.45rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 6px;
}

.land-tagline {
  text-align: center;
  font-size: 0.84rem;
  color: var(--text-light);
  margin-bottom: 28px;
}

.calc-box {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: var(--radius-sm);
  padding: 20px;
  margin-bottom: 22px;
}

.calc-box h2 {
  font-size: 0.92rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.calc-row2 {
  display: flex;
  justify-content: space-between;
  font-size: 0.81rem;
  color: var(--text-mid);
  margin-bottom: 6px;
}

.calc-row2 .cv {
  color: var(--mtn-gold);
  font-weight: 600;
}

input[type=range] {
  width: 100%;
  -webkit-appearance: none;
  height: 5px;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  margin-bottom: 4px;
  background: linear-gradient(to right, var(--mtn-gold) 0%, var(--mtn-gold) var(--pct,10%), #ddd var(--pct,10%), #ddd 100%);
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--mtn-gold);
  border: 3px solid #fff;
  cursor: pointer;
}

.range-ends {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--text-light);
  margin-bottom: 14px;
}

.monthly-box {
  background: #fff;
  border: 1px solid #eee;
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monthly-box .ml {
  font-size: 0.82rem;
  color: var(--text-light);
}

.monthly-box .ma {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--mtn-gold);
}

.land-footer {
  background: var(--mtn-dark);
  padding: 14px;
  text-align: center;
  font-size: 0.77rem;
  color: rgba(255,255,255,0.45);
  flex-shrink: 0;
}

.step-center {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 28px 16px;
}

.step-card {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 32px 28px;
}

.step-card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4px;
}

.step-sub {
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-light);
  margin-bottom: 4px;
}

.sum-box {
  border: 1px solid #e0e0e0;
  border-left: 4px solid var(--mtn-gold);
  border-radius: var(--radius-sm);
  padding: 16px 14px;
  margin: 16px 0;
  background: #fafffe;
}

.sum-box h3 {
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.sum-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  padding: 7px 0;
  border-bottom: 1px solid #f0f0f0;
}

.sum-row:last-child {
  border-bottom: none;
}

.sum-row .sk {
  color: var(--text-light);
}

.sum-row .sv {
  font-weight: 500;
}

#page-processing {
  background: linear-gradient(160deg, var(--mtn-dark), var(--mtn-light));
  align-items: center;
  justify-content: center;
}

.proc-wrap {
  text-align: center;
  padding: 40px 24px;
  max-width: 420px;
}

.proc-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 24px;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.3); }
  50% { box-shadow: 0 0 0 16px rgba(255,215,0,0); }
}

.proc-wrap h2 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.proc-wrap p {
  color: rgba(255,255,255,0.75);
  font-size: 0.88rem;
  line-height: 1.7;
  margin-bottom: 24px;
}

#page-login {
  background: #fff;
}

.login-hdr {
  background: var(--mtn-dark);
  padding: 32px 20px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.login-body-wrap {
  flex: 1;
  background: #fff;
  padding: 32px 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-body-wrap h2 {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 24px;
}

.login-inner {
  width: 100%;
  max-width: 380px;
}

.lg-phone-row {
  display: flex;
  margin-bottom: 24px;
}

.lg-ph-pre {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 11px 12px;
  background: #fafafa;
  border: 1.5px solid var(--border);
  border-right: none;
  border-radius: var(--radius-sm) 0 0 var(--radius-sm);
  font-size: 0.84rem;
  color: #555;
  font-weight: 500;
}

.lg-phone-row input {
  flex: 1;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-left: none;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  outline: none;
  background: #fff;
}

.lg-phone-row input:focus {
  border-color: var(--mtn-gold);
}

.pin-label {
  font-size: 0.82rem;
  color: var(--text-light);
  text-align: center;
  margin-bottom: 12px;
}

.pin-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 12px;
  align-items: center;
}

.pin-box {
  width: 52px;
  height: 52px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--mtn-dark);
  outline: none;
}

.pin-box:focus {
  border-color: var(--mtn-gold);
}

.pin-eye,
.pin-delete {
  cursor: pointer;
  color: var(--text-light);
  font-size: 1rem;
  background: none;
  border: none;
  margin-left: 6px;
}

.pin-delete:hover {
  color: var(--mtn-gold);
}

.btn-login {
  width: 100%;
  max-width: 380px;
  padding: 13px;
  background: #e8e8e8;
  color: #aaa;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}

.btn-login.rdy {
  background: var(--grad);
  color: #fff;
}

.lg-curve {
  margin-top: 32px;
  background: #fff;
  overflow: hidden;
  flex-shrink: 0;
}

.lg-curve::before {
  content: '';
  display: block;
  background: var(--mtn-dark);
  height: 55px;
  clip-path: ellipse(60% 100% at 50% 100%);
  margin-bottom: -4px;
}

.lg-foot {
  background: var(--mtn-dark);
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.lg-version {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
}

.lg-terms {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.45);
}

#page-sms-paste {
  background: #fff;
}

.sms-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.sms-topbar .bk {
  font-size: 1.1rem;
  color: #333;
  cursor: pointer;
  background: none;
  border: none;
}

.sms-body-wrap {
  flex: 1;
  padding: 32px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.sms-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: var(--radius);
  padding: 32px 28px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}

.sms-card h2 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--mtn-dark);
}

.sms-hint {
  font-size: 0.83rem;
  color: var(--text-light);
  margin-bottom: 22px;
}

.sms-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--text-dark);
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
  min-height: 120px;
  resize: vertical;
}

.sms-textarea:focus {
  border-color: var(--mtn-gold);
}

.sms-code-hint {
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 8px;
  font-style: italic;
}

.btn-sms {
  width: 100%;
  padding: 13px;
  background: #e8e8e8;
  color: #aaa;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
  margin-top: 16px;
}

.btn-sms.rdy {
  background: var(--grad);
  color: #fff;
}

.sms-curve {
  background: #fff;
  overflow: hidden;
  flex-shrink: 0;
}

.sms-curve::before {
  content: '';
  display: block;
  background: var(--mtn-dark);
  height: 50px;
  clip-path: ellipse(60% 100% at 50% 100%);
  margin-bottom: -4px;
}

.sms-foot {
  background: var(--mtn-dark);
  padding: 14px;
  text-align: center;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.45);
}

#page-otp {
  background: #fff;
}

.otp-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.otp-topbar .bk {
  font-size: 1.1rem;
  color: #333;
  cursor: pointer;
  background: none;
  border: none;
}

.otp-body-wrap {
  flex: 1;
  padding: 32px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.otp-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: var(--radius);
  padding: 32px 28px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
}

.otp-card h2 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--mtn-dark);
}

.otp-hint {
  font-size: 0.83rem;
  color: var(--text-light);
  margin-bottom: 5px;
}

.otp-section {
  margin-bottom: 24px;
}

.otp-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--mtn-dark);
  margin-bottom: 12px;
}

.otp-inputs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  width: 100%;
}

.otp-box {
  flex: 1;
  min-width: 0;
  width: 0;
  height: 52px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--mtn-dark);
  outline: none;
  transition: border-color 0.2s;
}

.otp-box:focus {
  border-color: var(--mtn-gold);
}

.otp-box::-webkit-outer-spin-button,
.otp-box::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.otp-box[type=number] {
  -moz-appearance: textfield;
}

.otp-delete {
  cursor: pointer;
  color: var(--text-light);
  font-size: 1rem;
  background: none;
  border: none;
  margin-left: 6px;
  padding: 0;
  transition: color 0.2s;
}

.otp-delete:hover {
  color: var(--mtn-gold);
}

.btn-otp {
  width: 100%;
  padding: 13px;
  background: #e8e8e8;
  color: #aaa;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s;
}

.btn-otp.rdy {
  background: var(--grad);
  color: #fff;
}

.otp-curve {
  background: #fff;
  overflow: hidden;
  flex-shrink: 0;
}

.otp-curve::before {
  content: '';
  display: block;
  background: var(--mtn-dark);
  height: 50px;
  clip-path: ellipse(60% 100% at 50% 100%);
  margin-bottom: -4px;
}

.otp-foot {
  background: var(--mtn-dark);
  padding: 14px;
  text-align: center;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.45);
}

#page-approval {
  background: linear-gradient(135deg, var(--mtn-dark), var(--mtn-light));
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.appr-wrap {
  width: 100%;
  max-width: 520px;
}

.appr-top {
  background: #fff;
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 28px 24px 0;
  text-align: center;
}

.check-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mtn-gold), var(--mtn-light));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-size: 1.3rem;
  color: #fff;
}

.appr-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.appr-sub {
  font-size: 0.82rem;
  color: var(--text-light);
  margin-bottom: 18px;
}

.appr-banner {
  background: var(--grad);
  padding: 16px;
  margin: 0 -24px;
  text-align: center;
}

.appr-banner .abl {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.8);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.appr-banner .aba {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.comp-box {
  background: #FFFBEA;
  border: 1px solid #F5C842;
  padding: 14px 16px;
}

.comp-box .ch {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #a07000;
  margin-bottom: 6px;
}

.comp-box p {
  font-size: 0.78rem;
  color: #7a5500;
  line-height: 1.6;
}

.ld-card {
  background: #fff;
  padding: 20px 24px;
}

.ld-htitle {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-mid);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ld-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.ld-row:last-child {
  border-bottom: none;
}

.ld-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.ic-g {
  background: linear-gradient(135deg, #2ECC71, #27AE60);
  color: #fff;
}

.ic-b {
  background: linear-gradient(135deg, #3498DB, #2980B9);
  color: #fff;
}

.ic-p {
  background: linear-gradient(135deg, #9B59B6, #8E44AD);
  color: #fff;
}

.ld-lbl {
  font-size: 0.72rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ld-val {
  font-size: 0.9rem;
  font-weight: 600;
}

.nxt-steps {
  background: #fff;
  padding: 14px 24px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border-top: 1px solid #f0f0f0;
}

.nxt-steps p {
  font-size: 0.79rem;
  color: var(--text-light);
  line-height: 1.5;
}

.rth-wrap {
  background: #fff;
  border-radius: 0 0 var(--radius) var(--radius);
  padding: 14px 24px 24px;
}

.rth-btn {
  width: 100%;
  padding: 13px;
  background: var(--grad);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.msg-box {
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  font-size: 0.84rem;
  margin-bottom: 16px;
  display: none;
  align-items: center;
  gap: 10px;
}

.msg-box.show {
  display: flex;
}

.msg-box.error {
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  color: #991b1b;
}

.msg-box.success {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  color: #166534;
}

.msg-icon {
  font-weight: 700;
}

.loading {
  display: none;
}

.loading.show {
  display: block;
}

.wait-msg {
  text-align: center;
  color: var(--text-light);
  font-size: 0.88rem;
}

.admin-error-modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 10000;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.admin-error-modal.show {
  display: flex;
}

.admin-error-content {
  background: #fff;
  border-radius: var(--radius);
  padding: 36px 32px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.admin-error-content h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #d91e1e;
  margin-bottom: 12px;
}

.admin-error-content p {
  font-size: 0.9rem;
  color: var(--text-mid);
  line-height: 1.6;
  margin-bottom: 24px;
}

.admin-error-code {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 20px;
  border: 1px solid #ddd;
}

.admin-error-btn {
  padding: 12px 24px;
  background: var(--grad);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

@media (max-width: 600px) {
  .field-row {
    grid-template-columns: 1fr;
  }
  .pin-box {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }
  .land-card,
  .step-card {
    padding: 24px 18px;
  }
  .sms-timer-wrap {
    flex-wrap: wrap;
    justify-content: center;
    text-align: center;
  }
}
