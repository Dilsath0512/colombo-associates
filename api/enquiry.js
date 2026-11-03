const https = require('https');
const fs = require('fs');
const path = require('path');

const APPROVED_PRACTICE_CATEGORIES = [
  'Corporate & Commercial Law',
  'Dispute Resolution & Arbitration',
  'Banking, Finance & Capital Markets',
  'Foreign Direct Investment (FDI) & BOI',
  'Intellectual Property & Technology',
  'Real Estate, Property & Construction',
  'Admiralty & Maritime Law',
  'Labour, Employment & Immigration',
  'Tax Law & Wealth Advisory',
  'Energy, Environment & ESG'
];

function sanitizeString(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sendResendEmail({ to, replyTo, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[EMAIL NOTICE] No RESEND_API_KEY set. Simulated send to ${to}`);
    return Promise.resolve({ simulated: true });
  }

  const fromEmail = process.env.FROM_EMAIL || 'Colombo Associates <intake@colomboassociates.com>';

  const payload = {
    from: fromEmail,
    to: Array.isArray(to) ? to : [to],
    subject: subject,
    html: html,
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(text ? { text: text } : {})
  };

  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`[RESEND SUCCESS] Sent to ${to} | ID: ${parsed.id}`);
            resolve({ success: true, data: parsed });
          } else {
            console.error(`[RESEND ERROR ${res.statusCode}]:`, parsed);
            resolve({ success: false, error: parsed });
          }
        } catch (e) {
          resolve({ success: false, raw: body });
        }
      });
    });

    req.on('error', err => {
      console.error('[RESEND NETWORK ERROR]:', err.message);
      resolve({ success: false, error: err.message });
    });

    req.write(data);
    req.end();
  });
}

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }));
  }

  // Parse body (Vercel provides req.body if already parsed, or stream if raw)
  let data = req.body;
  if (!data || typeof data === 'string') {
    try {
      if (typeof data === 'string' && data.trim()) {
        data = JSON.parse(data);
      } else {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const rawBody = Buffer.concat(buffers).toString();
        data = JSON.parse(rawBody);
      }
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload.' }));
    }
  }

  // 1. Anti-spam honeypot
  if (data._security_honeypot && data._security_honeypot.trim() !== '') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Spam detected.' }));
  }

  // 2. Validate mandatory fields
  const rawName = (data.name || '').trim();
  const rawEmail = (data.email || '').trim().toLowerCase();
  const rawPhone = (data.phone || '').trim();
  const rawCountry = (data.country || '').trim();
  const rawService = (data.service || '').trim();
  const rawDesc = (data.description || '').trim();
  const rawConsent = Boolean(data.consent);

  if (!rawName || rawName.length < 2) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Full Name is required (minimum 2 characters).' }));
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!rawEmail || !emailPattern.test(rawEmail)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'A valid business email address is required.' }));
  }

  if (!rawPhone || rawPhone.length < 7) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'A valid contact telephone / WhatsApp number is required.' }));
  }

  if (!rawCountry || rawCountry.length < 2) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Country of residence / location is required.' }));
  }

  const matchingCategory = APPROVED_PRACTICE_CATEGORIES.find(
    c => c.toLowerCase() === rawService.toLowerCase() ||
         c.toLowerCase().includes(rawService.toLowerCase()) ||
         rawService.toLowerCase().includes(c.toLowerCase())
  );
  if (!matchingCategory && !rawService) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Please select a valid Service Area.' }));
  }
  const serviceArea = matchingCategory || rawService;

  if (!rawDesc || rawDesc.length < 10) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Please provide a brief description of the matter (minimum 10 characters).' }));
  }

  if (!rawConsent) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Consent to data processing is required.' }));
  }

  // 3. Generate unique Enquiry Reference ID
  const enqId = `CA-ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // 4. Dispatch Email Notification to Firm Intake Email
  const targetFirmEmail = process.env.FIRM_INTAKE_EMAIL || 'contact@colomboassociates.com';
  const submissionDateFormatted = new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Colombo',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) + ' (Sri Lanka Time)';

  const intakeEmailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Matter Enquiry — ${enqId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1727; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <div style="background-color: #0b1727; padding: 30px 12px;">
    <!-- Main Card Container -->
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 1px solid #1e293b;">
      
      <!-- Top Gold Trim Line -->
      <tr>
        <td style="height: 4px; background: #c5a059; font-size: 0; line-height: 0;">&nbsp;</td>
      </tr>

      <!-- Brand Header with Official Logo -->
      <tr>
        <td style="background-color: #07162c; padding: 28px 24px 24px; text-align: center;">
          <img src="https://raw.githubusercontent.com/Dilsath0512/colombo-associates/main/assets/icons/logo-white.png" alt="Colombo Associates" style="height: 38px; width: auto; max-width: 240px; display: block; margin: 0 auto; border: 0;" />
        </td>
      </tr>

      <!-- Subheader Reference Strip -->
      <tr>
        <td style="background-color: #0d2242; padding: 12px 24px; border-bottom: 1px solid #e2e8f0;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-size: 13px; color: #cbd5e1;">
                Ref: <strong style="font-family: monospace; font-size: 14px; color: #38bdf8;">${enqId}</strong>
              </td>
              <td style="text-align: right; font-size: 12px; color: #94a3b8;">
                ${submissionDateFormatted}
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Content Area -->
      <tr>
        <td style="padding: 26px 24px;">

          <!-- Client Details Table -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 20px; background: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; width: 35%; color: #64748b; font-size: 13px; font-weight: 500;">Client Name:</td>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 700;">${rawName}</td>
            </tr>
            ${data.organisation ? `
            <tr>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Organisation:</td>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 13.5px; font-weight: 600;">${sanitizeString(data.organisation)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Business Email:</td>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600;">
                <a href="mailto:${rawEmail}" style="color: #0284c7; text-decoration: none;">${rawEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Phone / WhatsApp:</td>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600;">
                <a href="tel:${rawPhone}" style="color: #0f172a; text-decoration: none;">${rawPhone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Country / Location:</td>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-size: 13.5px; font-weight: 600;">${rawCountry}</td>
            </tr>
            <tr>
              <td style="padding: 11px 16px; color: #64748b; font-size: 13px; font-weight: 500;">Practice Area:</td>
              <td style="padding: 11px 16px;">
                <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12.5px;">
                  ${serviceArea}
                </span>
              </td>
            </tr>
          </table>

          <!-- Matter Description Box -->
          <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
            Matter Description:
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #c5a059; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap; font-family: inherit;">${rawDesc}</p>
          </div>

          <!-- Quick Reply Button -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 6px 0;">
                <a href="mailto:${rawEmail}?subject=Re:%20Colombo%20Associates%20Enquiry%20${enqId}" style="background-color: #07162c; color: #ffffff; padding: 12px 30px; font-size: 13.5px; font-weight: 700; text-decoration: none; border-radius: 6px; border: 1px solid #c5a059; display: inline-block;">
                  &larr; Reply to ${rawName}
                </a>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- Simple Clean Footer -->
      <tr>
        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
          <div style="font-size: 12px; color: #64748b; font-weight: 600;">Colombo Associates &bull; Colombo, Sri Lanka</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
            <a href="https://colomboassociates.com" style="color: #c5a059; text-decoration: none;">colomboassociates.com</a>
          </div>
        </td>
      </tr>

    </table>
  </div>
</body>
</html>
  `;

  // Dispatch email
  await sendResendEmail({
    to: targetFirmEmail,
    replyTo: rawEmail,
    subject: `Client Enquiry: ${rawName} — ${serviceArea} [${enqId}]`,
    html: intakeEmailHtml
  });

  // Return success response
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({
    success: true,
    enquiryReferenceId: enqId,
    message: 'Thank you for contacting Colombo Associates. Your enquiry has been received successfully and forwarded to our intake team for preliminary review.',
    status: 'Pending Conflict Review',
    timestamp: new Date().toISOString()
  }));
};
