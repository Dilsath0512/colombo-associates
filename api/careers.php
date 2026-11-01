<?php
/**
 * Colombo Associates — Recruitment Application Handler for cPanel (PHP)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Malformed JSON payload.']);
    exit;
}

// Anti-spam honeypot
if (!empty($data['_security_honeypot'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Spam detected.']);
    exit;
}

$name = trim($data['name'] ?? '');
$email = strtolower(trim($data['email'] ?? ''));
$phone = trim($data['phone'] ?? '');
$position = trim($data['position'] ?? '');
$experience = trim($data['experience'] ?? '');
$linkedin = trim($data['linkedin'] ?? '');
$consent = !empty($data['consent']);

if (strlen($name) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Full Name is required (minimum 2 characters).']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A valid email address is required.']);
    exit;
}

if (strlen($phone) < 7) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'A valid contact number is required.']);
    exit;
}

if (empty($position)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Please select a valid position.']);
    exit;
}

if (strlen($experience) < 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Please provide a summary of experience (minimum 10 characters).']);
    exit;
}

if (!$consent) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Consent is required.']);
    exit;
}

$appId = 'CA-APP-2026-' . rand(1000, 9999);
$timestampFormatted = date('d M Y, h:i A') . ' (Sri Lanka Time)';

$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$safePhone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$safePosition = htmlspecialchars($position, ENT_QUOTES, 'UTF-8');
$safeExp = nl2br(htmlspecialchars($experience, ENT_QUOTES, 'UTF-8'));
$safeLinkedin = htmlspecialchars($linkedin, ENT_QUOTES, 'UTF-8');

$linkedinRow = !empty($safeLinkedin) ? "
<tr>
  <td style=\"padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;\">LinkedIn:</td>
  <td style=\"padding: 11px 16px; border-bottom: 1px solid #e2e8f0;\"><a href=\"{$safeLinkedin}\" target=\"_blank\" style=\"color: #0284c7; text-decoration: underline;\">View Profile</a></td>
</tr>" : "";

$cvName = !empty($data['cvFile']['name']) ? htmlspecialchars($data['cvFile']['name'], ENT_QUOTES, 'UTF-8') : '';
$cvRow = !empty($cvName) ? "
<tr>
  <td style=\"padding: 11px 16px; color: #64748b; font-size: 13px; font-weight: 500;\">CV Attachment:</td>
  <td style=\"padding: 11px 16px; color: #0f172a; font-size: 13.5px; font-weight: 700;\">&#128196; {$cvName}</td>
</tr>" : "";

$emailHtml = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Recruitment Application — {$appId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1727; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <div style="background-color: #0b1727; padding: 30px 12px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 1px solid #1e293b;">
      <tr>
        <td style="height: 4px; background: #c5a059; font-size: 0; line-height: 0;">&nbsp;</td>
      </tr>
      <tr>
        <td style="background-color: #07162c; padding: 28px 24px 24px; text-align: center;">
          <img src="https://raw.githubusercontent.com/Dilsath0512/colombo-associates/main/assets/icons/logo-white.png" alt="Colombo Associates" style="height: 38px; width: auto; max-width: 240px; display: block; margin: 0 auto; border: 0;" />
        </td>
      </tr>
      <tr>
        <td style="background-color: #0d2242; padding: 12px 24px; border-bottom: 1px solid #e2e8f0;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-size: 13px; color: #cbd5e1;">
                App ID: <strong style="font-family: monospace; font-size: 14px; color: #38bdf8;">{$appId}</strong>
              </td>
              <td style="text-align: right; font-size: 12px; color: #94a3b8;">
                {$timestampFormatted}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 26px 24px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 20px; background: #f8fafc; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; width: 35%; color: #64748b; font-size: 13px; font-weight: 500;">Target Role:</td>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0;">
                <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 12.5px;">
                  {$safePosition}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Candidate Name:</td>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 700;">{$safeName}</td>
            </tr>
            <tr>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Email Address:</td>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 600;">
                <a href="mailto:{$safeEmail}" style="color: #0284c7; text-decoration: none;">{$safeEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px; font-weight: 500;">Phone / WhatsApp:</td>
              <td style="padding: 11px 16px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600;">
                <a href="tel:{$safePhone}" style="color: #0f172a; text-decoration: none;">{$safePhone}</a>
              </td>
            </tr>
            {$linkedinRow}
            {$cvRow}
          </table>

          <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
            Experience &amp; Qualifications:
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #c5a059; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; font-family: inherit;">{$safeExp}</p>
          </div>

          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" style="padding: 6px 0;">
                <a href="mailto:{$safeEmail}?subject=Re:%20Colombo%20Associates%20Application%20{$appId}" style="background-color: #07162c; color: #ffffff; padding: 12px 30px; font-size: 13.5px; font-weight: 700; text-decoration: none; border-radius: 6px; border: 1px solid #c5a059; display: inline-block;">
                  &larr; Reply to {$safeName}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center;">
          <div style="font-size: 12px; color: #64748b; font-weight: 600;">Colombo Associates &bull; Colombo, Sri Lanka</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
            <a href="https://colomboassociates.com/careers.html" style="color: #c5a059; text-decoration: none;">colomboassociates.com/careers</a>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
HTML;

function getResendApiKey() {
    $envKey = getenv('RESEND_API_KEY');
    if (!empty($envKey)) return $envKey;
    $envFile = __DIR__ . '/../.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($k, $v) = explode('=', $line, 2);
                if (trim($k) === 'RESEND_API_KEY') {
                    return trim($v, " \t\n\r\0\x0B\"'");
                }
            }
        }
    }
    return '';
}

$resendApiKey = getResendApiKey();
$targetRecipient = 'Ajra.a@colomboassociates.com';

$payload = [
    'from' => 'Colombo Associates <intake@colomboassociates.com>',
    'to' => [$targetRecipient],
    'reply_to' => $email,
    'subject' => "Application: {$name} — {$position} [{$appId}]",
    'html' => $emailHtml
];

$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $resendApiKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
curl_close($ch);

http_response_code(200);
echo json_encode([
    'success' => true,
    'applicationReferenceId' => $appId,
    'message' => 'Your application has been received successfully and forwarded to our Recruitment Committee.'
]);
