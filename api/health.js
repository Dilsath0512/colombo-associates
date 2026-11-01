module.exports = (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ONLINE',
    service: 'Colombo Associates Law Firm API',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString()
  }));
};
