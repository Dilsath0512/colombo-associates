const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load .env configuration natively if available
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const idx = line.indexOf('=');
        const k = line.substring(0, idx).trim();
        const v = line.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    });
  }
} catch (e) {
  console.warn('Could not read .env file:', e.message);
}

// Resend Email Dispatcher (Direct API without external packages)
function sendResendEmail({ to, replyTo, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[EMAIL NOTICE] No RESEND_API_KEY set. (Email simulated in console). Target: ${to} | Subject: ${subject}`);
    return Promise.resolve({ simulated: true });
  }

  const fromEmail = process.env.FROM_EMAIL || 'Colombo Associates <onboarding@resend.dev>';

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

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname);

// Database & Vault Storage Directories
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const SECURE_STORE_DIR = path.join(DATA_DIR, 'recruitment');
const SECURE_DOCS_DIR = path.join(SECURE_STORE_DIR, 'documents');
const SECURE_DB_FILE = path.join(SECURE_STORE_DIR, 'applications.json');

const SECURE_ENQUIRIES_DIR = path.join(DATA_DIR, 'enquiries');
const SECURE_ENQUIRIES_FILE = path.join(SECURE_ENQUIRIES_DIR, 'enquiries.json');

// Initialize database folders & JSON store files safely
try {
  if (!fs.existsSync(SECURE_DOCS_DIR)) {
    fs.mkdirSync(SECURE_DOCS_DIR, { recursive: true });
  }
  if (!fs.existsSync(SECURE_DB_FILE)) {
    fs.writeFileSync(SECURE_DB_FILE, JSON.stringify([], null, 2), 'utf8');
  }
  if (!fs.existsSync(SECURE_ENQUIRIES_DIR)) {
    fs.mkdirSync(SECURE_ENQUIRIES_DIR, { recursive: true });
  }
  if (!fs.existsSync(SECURE_ENQUIRIES_FILE)) {
    fs.writeFileSync(SECURE_ENQUIRIES_FILE, JSON.stringify([], null, 2), 'utf8');
  }
} catch (e) {
  console.error('[DATABASE INIT ERROR]:', e);
}

// In-memory rate limiting / duplicate protection (maps: key => timestamp)
const recentSubmissions = new Map();
const recentEnquiries = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const APPROVED_PRACTICE_CATEGORIES = [
  'Banking & Finance',
  'Civil & Human Rights',
  'Consumer Rights',
  'Corporate & Commercial',
  'Criminal Defense',
  'Employment & Labor',
  'Energy, Environment & ESG',
  'Immigration',
  'Insurance',
  'Intellectual Property',
  'Lawsuits & Disputes',
  'Media, Technology and Telecoms',
  'Notary Services',
  'Private Client',
  'Tax'
];

function validateFileSignature(buffer, extension) {
  if (!buffer || buffer.length === 0) return false;
  const ext = extension.toLowerCase();
  
  if (ext === '.pdf') {
    // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46)
    return buffer.length >= 4 &&
           buffer[0] === 0x25 && buffer[1] === 0x50 &&
           buffer[2] === 0x44 && buffer[3] === 0x46;
  }
  
  if (ext === '.doc') {
    // DOC magic bytes: OLE Compound File (0xD0 0xCF 0x11 0xE0)
    return buffer.length >= 8 &&
           buffer[0] === 0xD0 && buffer[1] === 0xCF &&
           buffer[2] === 0x11 && buffer[3] === 0xE0;
  }
  
  if (ext === '.docx') {
    // DOCX magic bytes: ZIP container (PK\x03\x04 or PK\x05\x06)
    return buffer.length >= 4 &&
           buffer[0] === 0x50 && buffer[1] === 0x4B &&
           (buffer[2] === 0x03 || buffer[2] === 0x05) &&
           (buffer[3] === 0x04 || buffer[3] === 0x06);
  }
  
  return false;
}

// Basic HTML sanitization to prevent XSS in stored records
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  // Health check endpoint (for deployment platforms like Render / Railway / Docker)
  if (req.method === 'GET' && (reqPath === '/api/health' || reqPath === '/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'UP',
      firm: 'Colombo Associates',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }));
  }
  
  // API Handler for Client / International Desk Matter Enquiry Form
  if (req.method === 'POST' && (reqPath === '/api/enquiry' || reqPath === '/api/contact/enquiry')) {
    let body = '';
    const maxEnquirySize = 1024 * 1024; // 1MB max
    let bodyTooLarge = false;

    req.on('data', chunk => {
      body += chunk;
      if (body.length > maxEnquirySize) {
        bodyTooLarge = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Enquiry payload exceeds allowable limit.' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (bodyTooLarge) return;

      try {
        const data = JSON.parse(body);

        // 1. Spam protection check (honeypot)
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

        // Validate service area against approved practice categories
        const matchingCategory = APPROVED_PRACTICE_CATEGORIES.find(
          c => c.toLowerCase() === rawService.toLowerCase() ||
               c.toLowerCase().includes(rawService.toLowerCase()) ||
               rawService.toLowerCase().includes(c.toLowerCase())
        );
        if (!matchingCategory && !rawService) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Please select a valid Service Area from our approved practice categories.' }));
        }
        const serviceArea = matchingCategory || rawService;

        if (!rawDesc || rawDesc.length < 10) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Please provide a brief description of the matter (minimum 10 characters).' }));
        }

        if (!rawConsent) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Review and acceptance of the Privacy Notice and non-retainer legal disclaimer is mandatory.' }));
        }

        // 3. Duplicate submission prevention & rate-limiting (5-minute window for same email + service)
        const dupKey = `${rawEmail}::${serviceArea.toLowerCase()}`;
        const now = Date.now();
        if (recentEnquiries.has(dupKey) && (now - recentEnquiries.get(dupKey)) < 300000) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            error: 'A prospective matter enquiry from this email address for this practice area has already been received recently. Please allow our intake team time to review.'
          }));
        }

        // 4. Generate unique Enquiry Reference ID
        const enqId = `CA-ENQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        // 5. Build structured secure record
        const enquiryRecord = {
          enquiryReferenceId: enqId,
          fullName: sanitizeString(rawName),
          organisation: data.organisation ? sanitizeString(data.organisation) : null,
          businessEmail: rawEmail,
          telephone: sanitizeString(rawPhone),
          country: sanitizeString(rawCountry),
          serviceArea: serviceArea,
          matterDescription: sanitizeString(rawDesc),
          preferredContactMethod: sanitizeString(data.preferredMethod || 'Email'),
          preferredTimeWindow: sanitizeString(data.preferredTime || 'Sri Lanka Business Hours (Morning)'),
          privacyConsent: true,
          consentTimestamp: data.consentTimestamp || new Date().toISOString(),
          submissionTimestamp: new Date().toISOString(),
          enquiryStatus: 'Pending Conflict Review',
          assignedIntakeOfficer: 'Conflict Clearance Committee'
        };

        // 6. Persist to database
        let enquiriesList = [];
        try {
          if (fs.existsSync(SECURE_ENQUIRIES_FILE)) {
            enquiriesList = JSON.parse(fs.readFileSync(SECURE_ENQUIRIES_FILE, 'utf8') || '[]');
          }
        } catch (readErr) {
          enquiriesList = [];
        }
        enquiriesList.push(enquiryRecord);
        fs.writeFileSync(SECURE_ENQUIRIES_FILE, JSON.stringify(enquiriesList, null, 2), 'utf8');

        // Update rate limiting map
        recentEnquiries.set(dupKey, now);

        // 7. Internal Log
        console.log(`[ENQUIRY RECEIVED] Ref: ${enqId} | Service: ${serviceArea} | Client: ${rawName} (${rawEmail}) | Status: Pending Conflict Review`);

        // Dispatch Email Notification to Firm Intake Email (enquiries@colomboassociates.lk)
        const targetFirmEmail = process.env.FIRM_INTAKE_EMAIL || 'enquiries@colomboassociates.lk';
        const intakeEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: #07162c; padding: 22px; text-align: center;">
              <h2 style="color: #c5a059; margin: 0; font-size: 20px; letter-spacing: 1.5px; font-family: serif;">COLOMBO ASSOCIATES</h2>
              <p style="color: #e2e8f0; margin: 6px 0 0 0; font-size: 13px;">New Client Matter Enquiry</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <p style="font-size: 14px; color: #334155; margin-top: 0;">A prospective client matter enquiry has been submitted through the firm website:</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 18px 0;">
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 150px;">Enquiry Reference:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #07162c;">${enqId}</td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Client Name:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">${rawName}</td></tr>
                ${data.organisation ? `<tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Organisation:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9;">${sanitizeString(data.organisation)}</td></tr>` : ''}
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Business Email:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${rawEmail}" style="color: #0284c7; font-weight: bold;">${rawEmail}</a></td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Telephone:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9;">${rawPhone}</td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Country:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9;">${rawCountry}</td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Practice Area:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0369a1;">${serviceArea}</td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Preferred Method:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9;">${sanitizeString(data.preferredMethod || 'Email')}</td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Preferred Time:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9;">${sanitizeString(data.preferredTime || 'Morning')}</td></tr>
              </table>
              <div style="background: #f8fafc; border-left: 4px solid #c5a059; padding: 14px; margin-top: 10px; border-radius: 0 4px 4px 0;">
                <strong style="color: #07162c; font-size: 13px;">Matter Description:</strong>
                <p style="margin: 8px 0 0 0; color: #334155; line-height: 1.6; white-space: pre-wrap; font-size: 13.5px;">${rawDesc}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; line-height: 1.5;">
                *Notice: This matter is pending preliminary conflict clearance. You can click <strong>Reply</strong> in your email client to directly email ${rawName} (${rawEmail}).
              </p>
            </div>
          </div>
        `;

        sendResendEmail({
          to: targetFirmEmail,
          replyTo: rawEmail,
          subject: `[New Matter Enquiry] ${enqId} — ${rawName} (${serviceArea})`,
          html: intakeEmailHtml
        }).catch(e => console.error('Enquiry email error:', e));

        // 8. Return verified success response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          enquiryReferenceId: enqId,
          message: 'Thank you for contacting Colombo Associates. Your enquiry has been received successfully and forwarded to our intake team for preliminary review. Our team will contact you after the appropriate initial checks.',
          status: 'Pending Conflict Review',
          timestamp: new Date().toISOString()
        }));

      } catch (err) {
        console.error('Enquiry dispatch error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload or transmission error.' }));
      }
    });
    return;
  }

  // API Handler for Careers / Recruitment Application Submission
  if (req.method === 'POST' && (reqPath === '/api/careers/apply' || reqPath === '/api/recruitment/apply')) {
    let body = '';
    const maxPayloadSize = 16 * 1024 * 1024; // 16MB max
    let bodyTooLarge = false;

    req.on('data', chunk => {
      body += chunk;
      if (body.length > maxPayloadSize) {
        bodyTooLarge = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Application payload exceeds allowable limit.' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (bodyTooLarge) return;

      try {
        const data = JSON.parse(body);

        // 1. Anti-spam honeypot
        if (data._security_honeypot && data._security_honeypot.trim() !== '') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Spam detected.' }));
        }

        // 2. Validate required text fields
        const name = (data.name || '').trim();
        const email = (data.email || '').trim().toLowerCase();
        const phone = (data.phone || '').trim();
        const position = (data.position || '').trim();
        const experience = (data.experience || '').trim();
        const linkedin = (data.linkedin || '').trim();
        const consent = Boolean(data.consent);

        if (!name || name.length < 2) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Full Name is required (minimum 2 characters).' }));
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailPattern.test(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'A valid email address is required.' }));
        }

        if (!phone || phone.length < 7) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'A valid telephone / WhatsApp contact number is required.' }));
        }

        const validPositions = [
          'Senior Corporate Associate',
          'Junior Counsel – Commercial Litigation',
          'Junior Counsel - Commercial Litigation',
          'Assistant Company Secretary',
          'Legal Internship & Pupillage Program',
          'Legal Internship / Pupillage',
          'General Speculative Application'
        ];

        if (!position || !validPositions.includes(position)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Please select a valid position of interest.' }));
        }

        if (!experience || experience.length < 10) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Please provide a summary of your experience and qualifications (minimum 10 characters).' }));
        }

        if (!consent) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Mandatory consent to data processing for recruitment evaluation is required.' }));
        }

        // 3. Duplicate submission prevention (5-minute window for same email + position)
        const dupKey = `${email}::${position}`;
        const now = Date.now();
        if (recentSubmissions.has(dupKey) && (now - recentSubmissions.get(dupKey)) < 300000) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            error: 'An application for this position from this email address has already been received recently. Please allow our recruitment team time to review.'
          }));
        }

        // 4. Validate CV upload (Mandatory, PDF, DOC, DOCX up to 5MB)
        if (!data.cvFile || !data.cvFile.name || !data.cvFile.dataBase64) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Curriculum Vitae (CV) upload is mandatory.' }));
        }

        const cvExt = path.extname(data.cvFile.name).toLowerCase();
        if (!['.pdf', '.doc', '.docx'].includes(cvExt)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'CV document must be in PDF, DOC, or DOCX format.' }));
        }

        const cvBuffer = Buffer.from(data.cvFile.dataBase64, 'base64');
        if (cvBuffer.length === 0 || cvBuffer.length > 5 * 1024 * 1024 || (data.cvFile.size && data.cvFile.size > 5 * 1024 * 1024)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'CV file size must not exceed 5 MB.' }));
        }

        if (!validateFileSignature(cvBuffer, cvExt)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'The uploaded CV does not match valid PDF, DOC, or DOCX document standards.' }));
        }

        // 5. Validate Cover Letter upload (Optional, PDF or DOCX up to 5MB)
        let coverLetterRecord = null;
        if (data.coverLetterFile && data.coverLetterFile.name && data.coverLetterFile.dataBase64) {
          const clExt = path.extname(data.coverLetterFile.name).toLowerCase();
          if (!['.pdf', '.docx'].includes(clExt)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Cover Letter must be in PDF or DOCX format.' }));
          }

          const clBuffer = Buffer.from(data.coverLetterFile.dataBase64, 'base64');
          if (clBuffer.length > 5 * 1024 * 1024 || (data.coverLetterFile.size && data.coverLetterFile.size > 5 * 1024 * 1024)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'Cover Letter file size must not exceed 5 MB.' }));
          }

          if (!validateFileSignature(clBuffer, clExt)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: false, error: 'The uploaded Cover Letter does not match valid PDF or DOCX document standards.' }));
          }

          // Securely store cover letter
          const clFileId = `cl_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${clExt}`;
          fs.writeFileSync(path.join(SECURE_DOCS_DIR, clFileId), clBuffer);
          const clHash = crypto.createHash('sha256').update(clBuffer).digest('hex');

          coverLetterRecord = {
            originalName: path.basename(data.coverLetterFile.name),
            storedFileName: clFileId,
            sizeBytes: clBuffer.length,
            sha256: clHash,
            mimeType: data.coverLetterFile.type || 'application/octet-stream'
          };
        }

        // 6. Securely store CV document
        const cvFileId = `cv_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${cvExt}`;
        fs.writeFileSync(path.join(SECURE_DOCS_DIR, cvFileId), cvBuffer);
        const cvHash = crypto.createHash('sha256').update(cvBuffer).digest('hex');

        // 7. Generate Application Reference & Store Record
        const appId = `CA-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const applicationRecord = {
          applicationId: appId,
          applicantName: name,
          email: email,
          phone: phone,
          position: position,
          experienceSummary: experience,
          linkedinUrl: linkedin || null,
          cvFileReference: {
            originalName: path.basename(data.cvFile.name),
            storedFileName: cvFileId,
            sizeBytes: cvBuffer.length,
            sha256: cvHash,
            mimeType: data.cvFile.type || 'application/octet-stream'
          },
          coverLetterReference: coverLetterRecord,
          consentGiven: true,
          consentTimestamp: data.consentTimestamp || new Date().toISOString(),
          submissionTimestamp: new Date().toISOString(),
          applicationStatus: 'Under Initial Screening',
          assignedCommittee: 'Colombo Associates Recruitment Committee'
        };

        // Persist to database
        let applications = [];
        try {
          if (fs.existsSync(SECURE_DB_FILE)) {
            applications = JSON.parse(fs.readFileSync(SECURE_DB_FILE, 'utf8') || '[]');
          }
        } catch (readErr) {
          applications = [];
        }
        applications.push(applicationRecord);
        fs.writeFileSync(SECURE_DB_FILE, JSON.stringify(applications, null, 2), 'utf8');

        // Update rate-limiting map
        recentSubmissions.set(dupKey, now);

        // 8. Internal Log
        console.log(`[RECRUITMENT SUBMISSION] App Ref: ${appId} | Position: ${position} | Applicant: ${name} (${email})`);

        // Dispatch Email Notification to Firm Careers Email (careers@colomboassociates.lk)
        const targetCareersEmail = process.env.FIRM_CAREERS_EMAIL || 'careers@colomboassociates.lk';
        const careersEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background: #07162c; padding: 22px; text-align: center;">
              <h2 style="color: #c5a059; margin: 0; font-size: 20px; letter-spacing: 1.5px; font-family: serif;">COLOMBO ASSOCIATES</h2>
              <p style="color: #e2e8f0; margin: 6px 0 0 0; font-size: 13px;">Recruitment Portal — Candidate Application</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <p style="font-size: 14px; color: #334155; margin-top: 0;">A new candidate application has been submitted through the careers portal:</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; margin: 18px 0;">
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 150px;">Application ID:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #07162c;">${appId}</td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Target Position:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0369a1;">${position}</td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Candidate Name:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0f172a;">${name}</td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Email Address:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}" style="color: #0284c7; font-weight: bold;">${email}</a></td></tr>
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">Telephone:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9;">${phone}</td></tr>
                ${linkedin ? `<tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">LinkedIn Profile:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9;"><a href="${linkedin}" target="_blank">${linkedin}</a></td></tr>` : ''}
                <tr><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">CV Document:</td><td style="padding: 9px 8px; border-bottom: 1px solid #f1f5f9; font-weight: bold;">${path.basename(data.cvFile.name)} (Stored in Vault)</td></tr>
              </table>
              <div style="background: #f8fafc; border-left: 4px solid #c5a059; padding: 14px; margin-top: 10px; border-radius: 0 4px 4px 0;">
                <strong style="color: #07162c; font-size: 13px;">Experience & Qualifications Summary:</strong>
                <p style="margin: 8px 0 0 0; color: #334155; line-height: 1.6; white-space: pre-wrap; font-size: 13.5px;">${experience}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; line-height: 1.5;">
                *Notice: Candidate CV and Cover Letter are securely archived in the firm's data vault and accessible via the Admin Portal.
              </p>
            </div>
          </div>
        `;

        sendResendEmail({
          to: targetCareersEmail,
          replyTo: email,
          subject: `[Job Application] ${appId} — ${name} (${position})`,
          html: careersEmailHtml
        }).catch(e => console.error('Careers email error:', e));

        // 9. Verified Success Response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: true,
          applicationId: appId,
          message: 'Your application has been submitted successfully. Thank you for your interest in Colombo Associates. Our recruitment team will review your submission.',
          timestamp: new Date().toISOString()
        }));

      } catch (err) {
        console.error('Recruitment submission error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Malformed application payload or parsing error.' }));
      }
    });
    return;
  }

  // Security check: Block direct public GET access to backend database, sensitive code or storage
  if (reqPath.startsWith('/api/careers') ||
      reqPath.startsWith('/api/recruitment') ||
      reqPath.startsWith('/api/applications') ||
      reqPath.startsWith('/api/enquiry') ||
      reqPath.startsWith('/api/enquiries') ||
      reqPath.startsWith('/data') ||
      reqPath.startsWith('/.git') ||
      reqPath.startsWith('/scratch') ||
      reqPath.includes('applications.json') ||
      reqPath.includes('enquiries.json') ||
      reqPath.endsWith('server.js') ||
      reqPath.endsWith('package.json') ||
      reqPath.endsWith('.gitignore') ||
      reqPath.includes('secure_storage')) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Forbidden: Direct access to internal database and system vaults is restricted.' }));
  }

  const filePath = path.resolve(PUBLIC_DIR, '.' + reqPath);
  
  // Prevent directory traversal attacks
  if (!filePath.toLowerCase().startsWith(PUBLIC_DIR.toLowerCase())) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not Found: ' + reqPath);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER ACTIVE] Colombo Associates Law Firm Web & API Server`);
  console.log(`  -> Local:   http://localhost:${PORT}/`);
  console.log(`  -> Network: http://0.0.0.0:${PORT}/`);
  console.log(`  -> Data:    ${DATA_DIR}`);
});
