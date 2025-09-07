const nodemailer = require('nodemailer');

// Simple singleton transporter (created on first use)
let transporter = null;
let transporterType = null; // 'env' | 'ethereal'

function enableDebugIfRequested(options) {
  if (process.env.EMAIL_DEBUG === 'true') {
    return { ...options, logger: true, debug: true };
  }
  return options;
}

function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('[EmailService] Missing email environment variables. Will attempt ethereal fallback (dev only).');
    return null; // We'll create ethereal lazily in send function if allowed
  }

  transporterType = 'env';
  transporter = nodemailer.createTransport(enableDebugIfRequested({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465, // true for 465
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    },
    tls: {
      // Allow self-signed certs in dev; remove in production
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  }));

  // Verify asynchronously (don't block startup)
  transporter.verify().then(() => {
    console.log('[EmailService] Transporter verified and ready (env config).');
  }).catch(err => {
    console.error('[EmailService] Transporter verification failed:', err.message);
  });

  return transporter;
}

function buildVerificationEmail(user, token) {
  const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
  const apiBase = process.env.API_BASE_URL || 'http://localhost:3000/api/auth';
  const verifyApiLink = `${apiBase}/verify-email/${token}`; // Direct API GET endpoint
  const verifyFrontendLink = `${frontendBase}/verify-email?token=${token}`; // Frontend page can POST token

  const fromName = process.env.EMAIL_FROM_NAME || 'Tech2Gether';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:24px; background:#f5f5f5;">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2); padding:32px; border-radius:12px; text-align:center; color:#fff;">
        <h1 style="margin:0; font-size:26px;">Welcome to Tech2Gether 👋</h1>
        <p style="margin:12px 0 0; font-size:15px;">Just one more step to activate your account.</p>
      </div>
      <div style="background:#fff; margin-top:20px; padding:32px; border-radius:12px; box-shadow:0 4px 14px rgba(0,0,0,0.08);">
        <p style="font-size:16px; color:#333; margin-top:0;">Hi ${user.getPreferredName() || 'there'},</p>
        <p style="font-size:15px; color:#444; line-height:1.55;">Thanks for creating an account! Please confirm your email address so we know it's really you.</p>
        <div style="text-align:center; margin:28px 0;">
          <a href="${verifyApiLink}" style="background:#667eea; color:#fff; padding:14px 26px; font-size:16px; text-decoration:none; border-radius:8px; display:inline-block; font-weight:600;">Verify Email</a>
        </div>
        <p style="font-size:13px; color:#666; line-height:1.5;">If the button doesn't work, copy & paste this URL into your browser:</p>
        <code style="display:block; word-break:break-all; background:#f0f0f0; padding:12px; border-radius:6px; font-size:12px;">${verifyApiLink}</code>
        <p style="font-size:13px; color:#666; line-height:1.5;">Prefer a frontend experience? Use: <br/><code style="display:block; word-break:break-all; background:#f0f0f0; padding:12px; border-radius:6px; font-size:12px;">${verifyFrontendLink}</code></p>
        <p style="font-size:13px; color:#666;">This link will expire in 24 hours for security reasons.</p>
        <p style="font-size:13px; color:#888; margin-top:32px;">If you didn't create this account, you can safely ignore this email.</p>
      </div>
      <p style="text-align:center; font-size:12px; color:#999; margin-top:24px;">Sent by ${fromName} • ${new Date().getFullYear()}</p>
    </div>
  `;

  const text = `Welcome to Tech2Gether!\n\nVerify your email by visiting this link (valid for 24 hours):\n${verifyApiLink}\n\nAlternate (frontend) link: ${verifyFrontendLink}\n\nIf you didn't create this account, ignore this email.`;

  return { html, text, subject: 'Verify your Tech2Gether email' };
}

async function sendVerificationEmail(user, token) {
  let tx = getTransporter();

  // If transporter missing and in non-production, try ethereal fallback
  if (!tx && process.env.NODE_ENV !== 'production') {
    try {
      console.log('[EmailService] Creating ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      transporterType = 'ethereal';
      transporter = nodemailer.createTransport(enableDebugIfRequested({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      }));
      tx = transporter;
      console.log('[EmailService] Ethereal transporter ready. Messages will not go to real inbox.');
    } catch (err) {
      console.error('[EmailService] Failed to create ethereal account:', err.message);
      return { sent: false, reason: 'missing transporter and ethereal creation failed' };
    }
  }

  if (!tx) {
    console.warn('[EmailService] Transport unavailable. Skipping verification email send.');
    return { sent: false, reason: 'missing transporter' };
  }

  const { html, text, subject } = buildVerificationEmail(user, token);
  const fromName = process.env.EMAIL_FROM_NAME || 'Tech2Gether';

  try {
    const listUnsubUrl = (process.env.FRONTEND_BASE_URL || 'http://localhost:5173') + '/unsubscribe';
    const headers = {
      'X-Entity-Type': 'Transactional',
      'X-Component': 'EmailVerification',
      'List-Unsubscribe': `<${listUnsubUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    };

    const info = await tx.sendMail({
      from: { name: fromName, address: process.env.EMAIL_USER },
      to: user.email,
      subject,
      html,
      text,
      headers,
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER
    });
    console.log(`[EmailService] Verification email sent to ${user.email}. MessageId=${info.messageId}`);
    console.log('[EmailService] Delivery meta:', {
      envelope: info.envelope,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response
    });
    if (transporterType === 'ethereal') {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) {
        console.log(`[EmailService] Ethereal preview URL: ${preview}`);
        return { sent: true, messageId: info.messageId, previewUrl: preview };
      }
    }
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[EmailService] Failed to send verification email:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = {
  sendVerificationEmail,
  getEmailDebugInfo: () => ({
    transporterInitialized: !!transporter,
    transporterType,
    envHostDefined: !!process.env.EMAIL_HOST,
    envPortDefined: !!process.env.EMAIL_PORT,
    envUserDefined: !!process.env.EMAIL_USER,
    debugEnabled: process.env.EMAIL_DEBUG === 'true'
  })
};
