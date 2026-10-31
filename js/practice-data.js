/**
 * Colombo Associates - Practice Areas Single Source of Truth
 * Exactly 15 approved Lawzana categories with official "Covers" scope from Section 5C of the Strategy Brief.
 */

const PRACTICE_AREAS = [
  {
    id: 'corporate-commercial',
    title: 'Corporate & Commercial',
    filterGroup: 'corporate-commercial',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`,
    shortDesc: 'Entity incorporation, corporate governance, cross-border M&A, private equity, commercial contracts, due diligence, and international trade law.',
    covers: 'Administrative; Admiralty & Maritime; Antitrust; Business Registration; Contract; Corporate Governance; Due Diligence; Franchising; Government Contract; Government Relations & Lobbying; International Trade Law; Licensing; Merger & Acquisition; Nonprofit & Charitable Organizations; Private Equity; Venture Capital.',
    details: 'Comprehensive legal and statutory corporate support for domestic enterprises, foreign investors, and multinational corporations under the Companies Act No. 07 of 2007 and cross-border commercial frameworks.',
    matters: [
      'Business Registration, Company Incorporation & Corporate Governance',
      'Merger & Acquisition (M&A), Private Equity & Venture Capital',
      'Commercial Contracts, Franchising & Licensing Agreements',
      'Due Diligence, Antitrust & International Trade Law',
      'Government Contracts, Regulatory Relations & Administrative Law',
      'Admiralty & Maritime Law & Cross-Border Logistics'
    ]
  },
  {
    id: 'criminal-defense',
    title: 'Criminal Defense',
    filterGroup: 'disputes-litigation',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    shortDesc: 'White-collar defense, statutory investigations, cybercrime proceedings, international criminal law, and court representation.',
    covers: 'Criminal Litigation; Cybercrime; International Criminal Law; Juvenile Law; Probation Violation; Sex Crime; Speeding & Traffic Ticket; Theft, Robbery & Burglary; Weapons & Firearms Charges; Arrests & Searches.',
    details: 'Defense advocacy and legal counsel for directors, professionals, and corporate entities undergoing statutory inquiries, financial investigations, and criminal court proceedings.',
    matters: [
      'Criminal Litigation, Bail Applications & Trial Advocacy',
      'Cybercrime, Digital Evidence & Computer Crimes Act Inquiries',
      'Arrests, Searches, Seizures & Due Process Protection',
      'Theft, Robbery, Burglary & Property Crime Defense',
      'International Criminal Law, Mutual Legal Assistance & Extradition',
      'White-Collar Financial Offenses & Corporate Defense'
    ]
  },
  {
    id: 'civil-human-rights',
    title: 'Civil & Human Rights',
    filterGroup: 'disputes-litigation',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    shortDesc: 'Supreme Court fundamental rights petitions, constitutional writ challenges, non-discrimination advocacy, and public interest matters.',
    covers: 'Animal Law; Civil Rights; Constitutional Law; Disability Rights; Discrimination; Education Law; Military Law; Police Misconduct; State, Local, and Municipal Law; Wrongful Conviction.',
    details: 'Representing clients in constitutional and public law disputes, challenging arbitrary state actions via certiorari, mandamus, and prohibition writs, and upholding protected rights.',
    matters: [
      'Constitutional Law & Fundamental Rights Petitions (Supreme Court)',
      'Civil Rights, Non-Discrimination & Disability Rights',
      'Police Misconduct, Wrongful Conviction & Detention Redress',
      'State, Local, and Municipal Law Challenges & Inquiries',
      'Education Law, Institutional Compliance & Animal Law'
    ]
  },
  {
    id: 'employment-labor',
    title: 'Employment & Labor',
    filterGroup: 'advisory-governance',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    shortDesc: 'Employment agreements, workplace policies, TEWA retrenchment, disciplinary inquiries, Labour Tribunal defense, and executive benefits.',
    covers: 'Employment Benefits & Executive Compensation; Employment Rights; Hiring & Firing; Independent Contractor & Misclassification; Job Discrimination; Labor Law; Non-Compete & NDA Agreements; Pension; Retirement; Sexual Harassment; Wage & Hour; Wrongful Termination.',
    details: 'Advising employers and executive personnel on Sri Lanka\'s employment statutes, TEWA redundancy procedures, domestic inquiries, restrictive covenants, and workplace governance.',
    matters: [
      'Employment Contracts, Non-Compete & NDA Agreements',
      'Hiring & Firing, Wrongful Termination & TEWA Retrenchment',
      'Labour Tribunal Defense & Workplace Dispute Resolution',
      'Employment Benefits, Executive Compensation, Pensions & Retirement',
      'Independent Contractor Agreements & Worker Misclassification',
      'Workplace Discrimination, Sexual Harassment & Wage/Hour Compliance'
    ]
  },
  {
    id: 'immigration',
    title: 'Immigration',
    filterGroup: 'advisory-governance',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    shortDesc: 'Business visas, work permits, investor residence, citizenship by investment, dual citizenship, and immigration appeals.',
    covers: 'Asylum; Business Visa; Citizenship; Citizenship by Investment; Dependent Visa; Deportation & Removal Defense; Family Visa & Reunification; Naturalization; Permanent Residency; Residence by Investment; Student Visa; Visa Refusals & Appeals; Work Permit.',
    details: 'Coordinating immigration documentation, investor residence visas, and BOI clearances for foreign investors, technical directors, and expatriate executives operating in Sri Lanka.',
    matters: [
      'Business Visas, Expatriate Work Permits & BOI Visa Coordination',
      'Residence by Investment, Golden Visa & Investor Categories',
      'Citizenship, Dual Citizenship Applications & Naturalization',
      'Permanent Residency, Dependent Visas & Family Reunification',
      'Visa Refusals, Immigration Appeals & Deportation Defense',
      'Student Visas & Special Category Entry Clearances'
    ]
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    filterGroup: 'advisory-governance',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`,
    shortDesc: 'Trademarks, patents, industrial designs, copyright, trade secrets, IP licensing, and NIPO portfolio management.',
    covers: 'Art & Cultural Property Law; Copyright; Domain Disputes (UDRP); IP Licensing & Transactions; IP Litigation & Enforcement; Patent; Trade Secrets.',
    details: 'Safeguarding proprietary trademarks, creative works, and commercial innovations under the Intellectual Property Act No. 36 of 2003 through the National Intellectual Property Office and court enforcement.',
    matters: [
      'Trademark Registration, Portfolio Management & Opposition at NIPO',
      'Patent Drafting, Prior Art Search & Industrial Designs Protection',
      'Copyright, Creative Works & Art and Cultural Property Law',
      'Trade Secrets Protection, Confidentiality & Non-Disclosure Agreements',
      'IP Licensing, Commercialization & Technology Transfer Agreements',
      'IP Litigation, Infringement Enforcement & Domain Name Disputes (UDRP)'
    ]
  },
  {
    id: 'consumer-rights',
    title: 'Consumer Rights',
    filterGroup: 'disputes-litigation',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>`,
    shortDesc: 'Consumer Affairs Authority Act compliance, commercial warranty disputes, product liability, fair trading standards, and consumer litigation.',
    covers: 'Civil Litigation; Consumer Protection; Identity Theft; Professional Malpractice.',
    details: 'Guiding commercial enterprises and consumers through the regulatory provisions of the Consumer Affairs Authority Act No. 09 of 2003, labeling compliance, and dispute resolution.',
    matters: [
      'Consumer Protection & Consumer Affairs Authority (CAA) Proceedings',
      'Civil Litigation for Consumer Contracts & Commercial Breaches',
      'Professional Malpractice Claims & Accountability Proceedings',
      'Identity Theft, Data Privacy & Fraud Recovery'
    ]
  },
  {
    id: 'private-client',
    title: 'Private Client',
    filterGroup: 'notary-private',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    shortDesc: 'Last wills, estate planning, probate administration, family wealth trusts, powers of attorney, and inheritance law.',
    covers: 'Asset Protection; Estate Planning; Guardianship; Inheritance Law; Power of Attorney; Probate; Trusts; Will & Testament.',
    details: 'Discrete advisory for individuals and families regarding succession, private family trusts, testamentary dispositions, probate administration, and wealth preservation in Sri Lanka.',
    matters: [
      'Estate Planning, Last Wills & Testamentary Dispositions',
      'Probate Proceedings & Letters of Administration before District Courts',
      'Family Trusts, Private Wealth Structuring & Asset Protection',
      'Inheritance Law, Intestate Succession & Partition Actions',
      'Powers of Attorney (General, Special & International) & Legal Guardianship'
    ]
  },
  {
    id: 'notary-services',
    title: 'Notary Services',
    filterGroup: 'notary-private',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
    shortDesc: 'Statutory declarations, apostille and embassy legalization, certified true copies, minor travel consent, and corporate document authentication.',
    covers: 'Affidavits & Statutory Declarations; Apostille & Embassy Legalization; Certified True Copies; Consent to Travel (Minors); Corporate Document Authentication.',
    details: 'Notarial attestations and statutory declarations conducted by licensed Notaries Public, ensuring full legal validity, consular legalization, and Land Registry compliance.',
    matters: [
      'Affidavits, Affirmations & Formal Statutory Declarations',
      'Apostille, Ministry of Foreign Affairs & Consular Embassy Legalization',
      'Certified True Copies of Official, Academic & Corporate Records',
      'Corporate Document Authentication, Power of Attorney & Board Resolutions',
      'Minor Child Consent to Travel Documentation & Emigration Formalities',
      'Deeds of Transfer, Commercial Leases & Real Estate Mortgages'
    ]
  },
  {
    id: 'energy-environment-esg',
    title: 'Energy, Environment & ESG',
    filterGroup: 'corporate-commercial',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
    shortDesc: 'Climate change law, energy regulatory law, CEA environmental compliance, renewable energy PPAs, mining law, and ESG advisory.',
    covers: 'Climate Change Law; Energy Regulatory Law; Environmental Law & Compliance; ESG Advisory & Compliance; Mining Law; Natural Resources; Oil, Gas & Energy.',
    details: 'Assisting energy developers, industrial operators, and commercial facilities with CEA environmental clearances, power purchase agreements (PPAs), and sustainable ESG compliance.',
    matters: [
      'Energy Regulatory Law, Power Purchase Agreements (PPAs) & Tariffs',
      'Environmental Law, Impact Assessments & CEA Approvals',
      'ESG Advisory, Corporate Sustainability Compliance & Audits',
      'Renewable Energy (Solar, Wind, Hydro) & Power Infrastructure',
      'Natural Resources, Mining Law & Energy Exploration Licensing',
      'Climate Change Law, Carbon Standards & Environmental Liabilities'
    ]
  },
  {
    id: 'insurance',
    title: 'Insurance',
    filterGroup: 'advisory-governance',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    shortDesc: 'Marine insurance, commercial property insurance, life insurance disputes, and insurance fraud defense under IRCSL regulations.',
    covers: 'Insurance Fraud; Life Insurance; Marine Insurance; Property Insurance.',
    details: 'Advising corporate policyholders and insurers on complex claim settlements, indemnity parameters, regulatory compliance with the IRCSL, and marine risk allocation.',
    matters: [
      'Marine Insurance, Admiralty Risks & Cargo Damage Claims',
      'Property Insurance, Commercial Asset Coverage & Fire Claims',
      'Life Insurance, Policy Benefit Disputes & Beneficiary Claims',
      'Insurance Fraud Investigation Defense & IRCSL Regulatory Compliance'
    ]
  },
  {
    id: 'lawsuits-disputes',
    title: 'Lawsuits & Disputes',
    filterGroup: 'disputes-litigation',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    shortDesc: 'Commercial High Court litigation, debt recovery, international arbitration, construction disputes, interim injunctions, and appellate advocacy.',
    covers: 'International Arbitration; Restructuring & Insolvency; General Litigation; ADR Mediation & Arbitration; Antitrust Litigation; Appeal; Class Action; Commercial Litigation; Construction Disputes; Dispute Prevention & Pre-Litigation; Ethics and Professional Responsibility.',
    details: 'Litigation and courtroom advocacy before the Commercial High Court, District Courts, Court of Appeal, Supreme Court of Sri Lanka, and domestic or international arbitration tribunals.',
    matters: [
      'Commercial Litigation, High Court Actions & Contractual Breaches',
      'International Commercial Arbitration & Institutional ADR (ICLP, SIAC, ICC)',
      'Restructuring, Corporate Insolvency & Winding-Up Petitions',
      'Appellate Advocacy before the Court of Appeal & Supreme Court',
      'Construction Disputes, FIDIC Contracts & Project Arbitrations',
      'Interim Injunctions, Enjoining Orders & Dispute Prevention Strategies'
    ]
  },
  {
    id: 'tax',
    title: 'Tax',
    filterGroup: 'corporate-commercial',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    shortDesc: 'Corporate tax compliance, expatriate and international tax, DTAA treaty relief, VAT/SSCL indirect tax, and tax dispute litigation.',
    covers: 'Corporate Tax; Expatriate & International Tax; Personal & Income Tax; Tax Disputes & Litigation; VAT, GST & Indirect Tax.',
    details: 'Strategic advisory on corporate income tax, Inland Revenue Act compliance, cross-border withholding tax, Double Tax Avoidance Agreements (DTAA), and tax litigation.',
    matters: [
      'Corporate Income Tax Advisory & Inland Revenue Compliance',
      'Expatriate & International Tax, DTAA Double Tax Avoidance Treaty Relief',
      'VAT, Social Security Contribution Levy (SSCL) & Indirect Taxes',
      'Tax Dispute Resolution, Objections & Tax Appeals Commission (TAC) Representation',
      'Personal Income Tax & High Net Worth Individual Structuring'
    ]
  },
  {
    id: 'banking-finance',
    title: 'Banking & Finance',
    filterGroup: 'corporate-commercial',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
    shortDesc: 'Acquisition finance, AML compliance, debt & equity capital markets, project finance, PPP structuring, securities, and Central Bank FX regulation.',
    covers: 'Acquisition / Leveraged Finance; Anti-Money Laundering (AML) & Compliance; Cryptocurrency & Digital Assets; Debt Capital Markets; Equity Capital Markets; Financial Services Regulation; Funds & Asset Management; Investment; Investment & Business Structuring; Project Finance; Public-Private Partnerships (PPP); Securities; Structured Finance; Sustainable Finance.',
    details: 'Advising corporate borrowers, domestic financial institutions, and foreign investors on banking facilities, security perfection, debentures, Central Bank inward remittance channels, and regulatory compliance.',
    matters: [
      'Project Finance, Leveraged Lending & Syndicated Credit Facilities',
      'Anti-Money Laundering (AML/CFT) & Financial Intelligence Unit (FIU) Compliance',
      'Central Bank Foreign Exchange Act & Inward Investment Accounts (IIA)',
      'Debt & Equity Capital Markets, Securities Perfection & Debentures',
      'Public-Private Partnerships (PPP), Structured & Sustainable Finance',
      'Funds & Asset Management, Investment & Business Structuring'
    ]
  },
  {
    id: 'media-tech-telecoms',
    title: 'Media, Technology and Telecoms',
    filterGroup: 'corporate-commercial',
    iconSvg: `<svg style="width:24px;height:24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    shortDesc: 'Personal Data Protection Act (PDPA), cyber law, cloud infrastructure, AI regulation, fintech, telecommunications licensing, and media transactions.',
    covers: 'Advertising and Marketing; AI Law & Regulation; Biotechnology; Cyber Law, Data Privacy and Data Protection; Data Center & Digital Infrastructure; E-commerce & Internet Law; Fintech; Information Technology; Media and Entertainment; Outsourcing; Sports Law; Technology Transactions; Telecommunications and Broadcast.',
    details: 'Guiding technology startups, digital platforms, and multinational providers through data privacy obligations, digital licensing, and technology contracts in Sri Lanka.',
    matters: [
      'Personal Data Protection Act (PDPA) Compliance & Data Privacy Audits',
      'Cyber Law, E-commerce, Internet Platforms & Digital Commerce Terms',
      'Fintech, Digital Payments & Central Bank Regulatory Sandboxes',
      'AI Law, Algorithm Regulation & Emerging Tech Transactions',
      'Telecommunications Regulation (TRCSL) & Broadcast Licensing',
      'Data Center Infrastructure, Cloud Agreements & IT Outsourcing',
      'Media, Entertainment, Advertising & Sports Law Contracts'
    ]
  }
];

// Export to window for global reuse across all scripts
if (typeof window !== 'undefined') {
  window.PRACTICE_AREAS = PRACTICE_AREAS;
  window.PRACTICE_AREAS_MAP = {};
  PRACTICE_AREAS.forEach(p => {
    window.PRACTICE_AREAS_MAP[p.id] = p;
  });
}

/**
 * Automatically populate any enquiry/contact service dropdowns
 * with the 15 single-source-of-truth categories.
 */
function populateServiceDropdowns() {
  if (typeof document === 'undefined') return;
  const selects = document.querySelectorAll('#enquiry-service, select[name="service"], .practice-dropdown');
  selects.forEach(select => {
    const existingVal = select.value;
    select.innerHTML = '<option value="" disabled selected>Select Practice Category</option>';
    PRACTICE_AREAS.forEach(pa => {
      const opt = document.createElement('option');
      opt.value = pa.title;
      opt.textContent = pa.title;
      if (existingVal && (existingVal === pa.title || existingVal.toLowerCase() === pa.id.toLowerCase())) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  });
}

if (typeof window !== 'undefined') {
  window.populateServiceDropdowns = populateServiceDropdowns;
}

// Auto-execute if DOM is already loaded or attach listener
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateServiceDropdowns);
  } else {
    populateServiceDropdowns();
  }
}
