import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: 'mock-payment-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

declare module 'express-session' {
  interface SessionData {
    couponApplied: boolean;
    discountedTotal: string;
    originalTotal: string;
    paymentMethod: string;
    selectedBank: string;
    vpa: string;
    forceFail: boolean;
    forceTimeout: boolean;
  }
}

const STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f0f2f5;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.10);
    padding: 36px 40px;
    width: 100%;
    max-width: 480px;
  }
  h1 { font-size: 1.5rem; color: #1a1a2e; margin-bottom: 8px; }
  h2 { font-size: 1.2rem; color: #333; margin-bottom: 20px; }
  .subtitle { color: #666; font-size: 0.9rem; margin-bottom: 28px; }
  .product-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
    font-size: 0.95rem;
    color: #333;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0 0;
    font-weight: 700;
    font-size: 1.05rem;
    color: #1a1a2e;
  }
  .original-price { text-decoration: line-through; color: #999; }
  .discounted-price { color: #16a34a; font-weight: 700; }
  .coupon-row {
    display: flex;
    gap: 10px;
    margin: 20px 0;
  }
  input[type="text"], input[type="tel"], select {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #1a1a2e;
    outline: none;
    transition: border-color 0.2s;
  }
  input[type="text"]:focus, input[type="tel"]:focus, select:focus {
    border-color: #3b82f6;
  }
  .btn {
    display: inline-block;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    text-align: center;
  }
  .btn:active { transform: scale(0.98); }
  .btn-primary {
    background: #3b82f6;
    color: #fff;
    width: 100%;
    margin-top: 20px;
  }
  .btn-primary:hover { background: #2563eb; }
  .btn-secondary {
    background: #e5e7eb;
    color: #374151;
  }
  .btn-secondary:hover { background: #d1d5db; }
  .btn-danger {
    background: #ef4444;
    color: #fff;
    width: 100%;
    margin-top: 10px;
  }
  .btn-danger:hover { background: #dc2626; }
  .btn-outline {
    background: transparent;
    color: #3b82f6;
    border: 1.5px solid #3b82f6;
    padding: 11px 24px;
  }
  .btn-outline:hover { background: #eff6ff; }
  .tabs {
    display: flex;
    border-bottom: 2px solid #e5e7eb;
    margin-bottom: 24px;
  }
  .tab {
    padding: 10px 20px;
    cursor: pointer;
    color: #6b7280;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    text-decoration: none;
    display: inline-block;
  }
  .tab.active, .tab:hover { color: #3b82f6; border-bottom-color: #3b82f6; }
  .form-group { margin-bottom: 18px; }
  .form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }
  .alert {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    margin-bottom: 16px;
  }
  .alert-error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  .alert-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  .alert-info { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
  .icon-circle {
    width: 72px; height: 72px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem;
    margin: 0 auto 20px;
  }
  .icon-success { background: #dcfce7; }
  .icon-failure { background: #fee2e2; }
  .txn-detail {
    background: #f9fafb;
    border-radius: 8px;
    padding: 16px;
    margin: 20px 0;
  }
  .txn-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 0.9rem;
    color: #374151;
  }
  .txn-row .label { color: #6b7280; }
  .txn-row .value { font-weight: 600; }
  .otp-input {
    letter-spacing: 8px;
    font-size: 1.4rem;
    font-weight: 700;
    text-align: center;
  }
  .countdown { color: #6b7280; font-size: 0.85rem; text-align: center; margin-top: 12px; }
  .resend-link { color: #3b82f6; cursor: pointer; text-decoration: underline; font-size: 0.85rem; display: none; }
  .plan-card {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    border-radius: 12px;
    padding: 24px;
    color: #fff;
    margin-bottom: 24px;
  }
  .plan-name { font-size: 1.3rem; font-weight: 700; }
  .plan-price { font-size: 2rem; font-weight: 800; margin: 8px 0; }
  .plan-cycle { font-size: 0.85rem; opacity: 0.85; }
  .plan-status {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    margin-top: 10px;
  }
  .status-active { background: rgba(255,255,255,0.25); color: #fff; }
  .status-cancelled { background: #fee2e2; color: #b91c1c; }
  .modal-overlay {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 100;
    align-items: center;
    justify-content: center;
  }
  .modal-overlay.show { display: flex; }
  .modal {
    background: #fff;
    border-radius: 12px;
    padding: 32px;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  }
  .modal h3 { font-size: 1.15rem; margin-bottom: 10px; color: #1a1a2e; }
  .modal p { color: #6b7280; font-size: 0.9rem; margin-bottom: 24px; }
  .modal-actions { display: flex; gap: 12px; }
  .modal-actions .btn { flex: 1; margin-top: 0; }
  .coupon-btn {
    padding: 11px 18px;
    white-space: nowrap;
    border-radius: 8px;
    background: #3b82f6;
    color: #fff;
    border: none;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .coupon-btn:hover { background: #2563eb; }
  .secure-badge {
    display: flex; align-items: center; gap: 6px;
    color: #6b7280; font-size: 0.8rem; margin-top: 20px;
    justify-content: center;
  }
`;

function page(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} — MockPay</title>
  <style>${STYLES}</style>
</head>
<body>${body}</body>
</html>`;
}

// ── GET / → redirect to /checkout ────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/checkout');
});

// ── GET /checkout ────────────────────────────────────────────────────────────
app.get('/checkout', (req: Request, res: Response) => {
  const session = req.session;
  const isDiscounted = session.couponApplied === true;
  const errorMsg = req.query.error === 'invalid_coupon'
    ? `<div class="alert alert-error" data-testid="coupon-error">Invalid coupon code. Please try again.</div>`
    : '';
  const successMsg = isDiscounted
    ? `<div class="alert alert-success" data-testid="coupon-success">Coupon applied! You save ₹99.</div>`
    : '';

  res.send(page('Checkout', `
    <div class="card">
      <h1>Order Summary</h1>
      <p class="subtitle">Review your order before proceeding</p>
      ${errorMsg}
      ${successMsg}
      <div class="product-row">
        <span>Premium Plan (1 month)</span>
        ${isDiscounted
          ? `<span><span class="original-price">₹999</span> <span class="discounted-price">₹900</span></span>`
          : `<span>₹999</span>`}
      </div>
      <div class="product-row">
        <span>GST (18%)</span>
        <span>${isDiscounted ? '₹162' : '₹179.82'}</span>
      </div>
      <div class="total-row">
        <span>Total</span>
        <span data-testid="total-amount">${isDiscounted ? '₹1,062' : '₹1,178.82'}</span>
      </div>
      <form class="coupon-row" action="/checkout/coupon" method="POST">
        <input type="text" name="coupon" id="coupon" placeholder="Enter coupon code" data-testid="coupon-input" value="${isDiscounted ? 'SAVE10' : ''}"/>
        <button type="submit" class="coupon-btn" data-testid="apply-coupon-btn">Apply</button>
      </form>
      <form action="/checkout/proceed" method="POST">
        <button type="submit" class="btn btn-primary" data-testid="proceed-to-pay-btn">Proceed to Pay</button>
      </form>
      <div class="secure-badge">🔒 Secured by MockPay</div>
    </div>
  `));
});

// ── POST /checkout/coupon ────────────────────────────────────────────────────
app.post('/checkout/coupon', (req: Request, res: Response) => {
  const coupon = (req.body.coupon as string)?.trim().toUpperCase();
  if (coupon === 'SAVE10') {
    req.session.couponApplied = true;
    req.session.discountedTotal = '₹900';
    req.session.originalTotal = '₹999';
    res.redirect('/checkout');
  } else {
    req.session.couponApplied = false;
    res.redirect('/checkout?error=invalid_coupon');
  }
});

// ── POST /checkout/proceed ───────────────────────────────────────────────────
app.post('/checkout/proceed', (_req: Request, res: Response) => {
  res.redirect('/payment-options');
});

// ── GET /payment-options ─────────────────────────────────────────────────────
app.get('/payment-options', (_req: Request, res: Response) => {
  res.send(page('Payment Options', `
    <div class="card">
      <h1>Choose Payment Method</h1>
      <p class="subtitle">Select how you'd like to pay</p>
      <div class="tabs">
        <a href="/upi" class="tab" data-testid="upi-tab">UPI</a>
        <a href="#" class="tab" data-testid="card-tab">Card</a>
        <a href="/netbanking" class="tab" data-testid="netbanking-tab">Net Banking</a>
      </div>
      <p style="color:#6b7280; font-size:0.9rem;">Select a payment method above to continue.</p>
      <div class="secure-badge">🔒 256-bit SSL encrypted</div>
    </div>
  `));
});

// ── GET /upi ─────────────────────────────────────────────────────────────────
app.get('/upi', (_req: Request, res: Response) => {
  res.send(page('UPI Payment', `
    <div class="card">
      <h1>Pay via UPI</h1>
      <p class="subtitle">Enter your UPI ID to complete the payment</p>
      <form action="/payment/upi" method="POST">
        <div class="form-group">
          <label for="vpa">UPI ID (VPA)</label>
          <input type="text" id="vpa" name="vpa" placeholder="yourname@upi" data-testid="vpa-input" autocomplete="off" required/>
        </div>
        <div id="vpa-error" class="alert alert-error" style="display:none;" data-testid="vpa-error">Please enter a valid UPI ID (e.g. name@upi)</div>
        <button type="submit" class="btn btn-primary" data-testid="upi-pay-btn">Pay Now</button>
      </form>
      <div class="secure-badge">🔒 Secured by MockPay</div>
      <script>
        document.querySelector('form').addEventListener('submit', function(e) {
          const vpa = document.getElementById('vpa').value.trim();
          const errEl = document.getElementById('vpa-error');
          if (!vpa.includes('@')) {
            e.preventDefault();
            errEl.style.display = 'block';
          } else {
            errEl.style.display = 'none';
          }
        });
      </script>
    </div>
  `));
});

// ── POST /payment/upi ────────────────────────────────────────────────────────
app.post('/payment/upi', (req: Request, res: Response) => {
  const vpa = (req.body.vpa as string)?.trim();
  req.session.vpa = vpa;
  req.session.paymentMethod = 'UPI';
  if (req.query.fail === 'true') req.session.forceFail = true;
  if (req.query.timeout === 'true') req.session.forceTimeout = true;
  res.redirect('/otp');
});

// ── GET /netbanking ──────────────────────────────────────────────────────────
app.get('/netbanking', (_req: Request, res: Response) => {
  res.send(page('Net Banking', `
    <div class="card">
      <h1>Net Banking</h1>
      <p class="subtitle">Select your bank to continue</p>
      <form action="/payment/netbanking" method="POST">
        <div class="form-group">
          <label for="bank">Select Bank</label>
          <select id="bank" name="bank" data-testid="bank-select" required>
            <option value="" disabled selected>-- Select your bank --</option>
            <option value="HDFC">HDFC Bank</option>
            <option value="SBI">State Bank of India (SBI)</option>
            <option value="ICICI">ICICI Bank</option>
            <option value="AXIS">Axis Bank</option>
            <option value="KOTAK">Kotak Mahindra Bank</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" data-testid="continue-to-bank-btn">Continue to Bank</button>
      </form>
      <div class="secure-badge">🔒 Secured by MockPay</div>
    </div>
  `));
});

// ── POST /payment/netbanking ─────────────────────────────────────────────────
app.post('/payment/netbanking', (req: Request, res: Response) => {
  const bank = (req.body.bank as string)?.trim();
  req.session.selectedBank = bank;
  req.session.paymentMethod = 'NETBANKING';
  if (req.query.fail === 'true') req.session.forceFail = true;
  if (req.query.timeout === 'true') req.session.forceTimeout = true;
  res.redirect('/otp');
});

// ── GET /otp ─────────────────────────────────────────────────────────────────
app.get('/otp', (_req: Request, res: Response) => {
  res.send(page('Enter OTP', `
    <div class="card">
      <h1>Verify with OTP</h1>
      <p class="subtitle">Enter the 6-digit OTP sent to your registered mobile number</p>
      <div class="alert alert-info">OTP sent to +91 ●●●●●● 4321</div>
      <form action="/payment/otp" method="POST">
        <div class="form-group">
          <label for="otp">Enter OTP</label>
          <input type="tel" id="otp" name="otp" maxlength="6" class="otp-input" data-testid="otp-input" placeholder="• • • • • •" autocomplete="one-time-code" required/>
        </div>
        <button type="submit" class="btn btn-primary" data-testid="otp-submit-btn">Verify & Pay</button>
      </form>
      <div class="countdown" data-testid="otp-countdown">
        Resend OTP in <span id="timer">30</span>s
        <br/>
        <a class="resend-link" id="resend-link" data-testid="resend-link" href="/otp">Resend OTP</a>
      </div>
      <script>
        let seconds = 30;
        const timerEl = document.getElementById('timer');
        const resendLink = document.getElementById('resend-link');
        const interval = setInterval(() => {
          seconds--;
          timerEl.textContent = seconds;
          if (seconds <= 0) {
            clearInterval(interval);
            timerEl.parentElement.style.display = 'none';
            resendLink.style.display = 'inline';
          }
        }, 1000);
      </script>
    </div>
  `));
});

// ── POST /payment/otp ────────────────────────────────────────────────────────
app.post('/payment/otp', async (req: Request, res: Response) => {
  const otp = (req.body.otp as string)?.trim();
  const forceFail = req.session.forceFail;
  const forceTimeout = req.session.forceTimeout;

  if (forceTimeout) {
    await new Promise<void>((resolve) => setTimeout(resolve, 5000));
  }

  req.session.forceFail = false;
  req.session.forceTimeout = false;

  if (forceFail || otp !== '123456') {
    const reason = otp !== '123456' && !forceFail ? 'Invalid OTP entered' : 'Payment declined by bank';
    res.redirect(`/failure?reason=${encodeURIComponent(reason)}`);
  } else {
    const txnId = 'TXN' + Date.now().toString(36).toUpperCase();
    const method = req.session.paymentMethod ?? 'UPI';
    const amount = req.session.couponApplied ? '₹1,062' : '₹1,178.82';
    res.redirect(`/success?txn=${txnId}&method=${encodeURIComponent(method)}&amount=${encodeURIComponent(amount)}`);
  }
});

// ── GET /success ─────────────────────────────────────────────────────────────
app.get('/success', (req: Request, res: Response) => {
  const txn = (req.query.txn as string) ?? 'TXN000000';
  const method = (req.query.method as string) ?? 'UPI';
  const amount = (req.query.amount as string) ?? '₹1,178.82';

  res.send(page('Payment Successful', `
    <div class="card" style="text-align:center;">
      <div class="icon-circle icon-success">✓</div>
      <h1 style="color:#16a34a;">Payment Successful!</h1>
      <p class="subtitle">Your payment has been processed successfully.</p>
      <div class="txn-detail">
        <div class="txn-row">
          <span class="label">Transaction ID</span>
          <span class="value" data-testid="transaction-id">${txn}</span>
        </div>
        <div class="txn-row">
          <span class="label">Amount Paid</span>
          <span class="value" data-testid="amount-paid">${decodeURIComponent(amount)}</span>
        </div>
        <div class="txn-row">
          <span class="label">Payment Method</span>
          <span class="value" data-testid="payment-method">${decodeURIComponent(method)}</span>
        </div>
        <div class="txn-row">
          <span class="label">Date & Time</span>
          <span class="value">${new Date().toLocaleString('en-IN')}</span>
        </div>
      </div>
      <a href="/checkout" class="btn btn-primary" style="display:block; text-decoration:none; margin-top:8px;" data-testid="back-to-home-btn">Back to Home</a>
    </div>
  `));
});

// ── GET /failure ─────────────────────────────────────────────────────────────
app.get('/failure', (req: Request, res: Response) => {
  const reason = (req.query.reason as string) ?? 'Payment could not be processed';

  res.send(page('Payment Failed', `
    <div class="card" style="text-align:center;">
      <div class="icon-circle icon-failure">✕</div>
      <h1 style="color:#dc2626;">Payment Failed</h1>
      <p class="subtitle">We were unable to process your payment.</p>
      <div class="txn-detail">
        <div class="txn-row">
          <span class="label">Reason</span>
          <span class="value" data-testid="failure-reason">${decodeURIComponent(reason)}</span>
        </div>
      </div>
      <form action="/payment-options" method="GET">
        <button type="submit" class="btn btn-primary" data-testid="retry-btn">Retry Payment</button>
      </form>
      <form action="/checkout" method="GET" style="margin-top:10px;">
        <button type="submit" class="btn btn-secondary" style="width:100%;" data-testid="cancel-btn">Cancel</button>
      </form>
    </div>
  `));
});

// ── GET /subscription ─────────────────────────────────────────────────────────
app.get('/subscription', (req: Request, res: Response) => {
  const cancelled = req.query.cancelled === 'true';
  const statusClass = cancelled ? 'status-cancelled' : 'status-active';
  const statusLabel = cancelled ? 'Cancelled' : 'Active';

  res.send(page('Subscription', `
    <div class="card">
      <h1>My Subscription</h1>
      <p class="subtitle">Manage your active plan</p>
      <div class="plan-card">
        <div class="plan-name">Premium Plan</div>
        <div class="plan-price">₹999<span style="font-size:1rem;font-weight:400;">/mo</span></div>
        <div class="plan-cycle">Renews on July 23, 2026</div>
        <div>
          <span class="plan-status ${statusClass}" data-testid="plan-status">${statusLabel}</span>
        </div>
      </div>
      <ul style="color:#374151; font-size:0.9rem; padding-left:20px; margin-bottom:24px; line-height:2;">
        <li>Unlimited API calls</li>
        <li>Priority support</li>
        <li>Advanced analytics</li>
        <li>Custom integrations</li>
      </ul>
      ${!cancelled ? `
        <button class="btn btn-danger" data-testid="cancel-subscription-btn" onclick="document.getElementById('cancel-modal').classList.add('show')">
          Cancel Subscription
        </button>
      ` : `
        <div class="alert alert-error" data-testid="cancellation-notice">
          Your subscription has been cancelled. Access ends on July 23, 2026.
        </div>
        <a href="/checkout" class="btn btn-primary" style="display:block;text-decoration:none;text-align:center;" data-testid="resubscribe-btn">Resubscribe</a>
      `}
    </div>

    <div class="modal-overlay" id="cancel-modal" data-testid="cancel-modal">
      <div class="modal">
        <h3>Cancel Subscription?</h3>
        <p>Are you sure you want to cancel? You'll lose access to Premium features at the end of your billing cycle.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" data-testid="keep-plan-btn" onclick="document.getElementById('cancel-modal').classList.remove('show')">Keep Plan</button>
          <form action="/subscription/cancel" method="POST" style="flex:1;">
            <button type="submit" class="btn btn-danger" style="width:100%;margin-top:0;" data-testid="confirm-cancel-btn">Yes, Cancel</button>
          </form>
        </div>
      </div>
    </div>
  `));
});

// ── POST /subscription/cancel ─────────────────────────────────────────────────
app.post('/subscription/cancel', (_req: Request, res: Response) => {
  res.redirect('/subscription?cancelled=true');
});

// ── Delay middleware for timeout simulation ───────────────────────────────────
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next();
});

app.listen(PORT, () => {
  console.log(`MockPay server running at http://localhost:${PORT}`);
});

export default app;
