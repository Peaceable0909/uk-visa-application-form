export const FORM_SECTIONS = [
  'Personal Information',
  'Spouse/Partner Details',
  'Parent Details',
  'Dependent(s) Details',
  'Additional Family Details',
  'Travel History', 
  'Personal Statement',
  'Declaration',
  'Other Details to Know'
];

export const DOCUMENT_REQUIREMENTS = {
  'Account Statement': {
    purpose: 'Proof of sufficient funds',
    requirements: [
      'Issued by a recognized, regulated bank.',
      'Must show at least 28 consecutive days of funds.',
      'Funds must meet or exceed the UKVI requirement:',
      'Tuition fees (minus deposits already paid)',
      'Living costs: £1,334/month (London) or £1,023/month (outside London) — both for up to 9 months.',
      'Statement must be issued within 31 days before your visa application date.',
      'Should be signed, stamped, and on official letterhead.',
      'Electronic statements must be certified by the bank.'
    ]
  },
  'International Passport Data Page': {
    purpose: 'Identification and travel record',
    requirements: [
      'Clear coloured scan of the passport data page (no shadows or cuts).',
      'Must show: Full name, Date of birth, Passport number, Issuing authority, Expiry date.',
      'Passport must be valid for at least 6 months beyond intended travel.',
      'Include visa pages from previous travels if available.',
      '⚠️ Important: The passport number must exactly match the number used on your CAS, TB Test Certificate, and other visa documents.'
    ]
  },
  'TB Test Certificate': {
    purpose: 'Medical clearance',
    requirements: [
      'Must be issued by a UKVI-approved clinic (e.g., IOM).',
      'Include: Full name, Date of birth, Passport number, Test date and expiry date.',
      'Certificate is valid for 6 months.',
      'Must be signed and stamped by the clinic.',
      'Ensure passport number matches your current passport and CAS.'
    ]
  },
  'Academic Documents (BSc Certificate, WAEC, and Transcript)': {
    purpose: 'Proof of qualification for your course',
    requirements: [
      'Include all qualifications listed on your CAS.',
      'Each document must be: Coloured, clear, and complete; Stamped or certified where necessary.',
      'BSc Certificate: Must match the qualification on your CAS.',
      'WAEC: Original or online verified version (with validation printout).',
      'Transcript: Must be official, stamped, and issued by your university.'
    ]
  },
  'Employment evidence as written on the additional information': {
    purpose: 'Proof of professional or work experience',
    requirements: [
      'Can include: Employment or reference letters, Payslips, Promotion or appointment letters.',
      'Must be on official letterhead, signed, and dated.',
      'Should clearly state: Position held, Employment period, Job duties, Employer contact details.'
    ]
  },
  'CAS': {
    purpose: 'Core student visa requirement',
    requirements: [
      'Issued electronically by your university.',
      'Must contain: CAS number, Institution name and sponsor license, Course title, level, and duration, Tuition fees and amount paid, Documents used to assess your admission.',
      'The personal details (especially passport number) must match your passport and other documents.'
    ]
  },
  'Passport Photo': {
    purpose: 'Identification photo',
    requirements: [
      'Must meet UK visa photo standards:',
      'Size: 45mm x 35mm',
      'Background: plain light grey or cream',
      'Taken within the last 6 months',
      'Must be clear, high-resolution, and unfiltered.',
      'File should be under 5MB, JPEG or PNG format.'
    ]
  },
  'Evidence used to obtain CAS': {
    purpose: 'Verification of your academic background or eligibility',
    requirements: [
      'Usually includes: Certificates, Transcripts, IELTS or English test result, Reference letters, Personal statement.',
      'Must be the same documents listed in the CAS under "Evidence considered."',
      'Must be certified if not original.'
    ]
  },
  'Birth Certificates': {
    purpose: 'Proof of family relationships and parental consent (For applicants with children)',
    requirements: [
      'Must show child\'s full name, date of birth, and both parents\' names.',
      'Must be official, government-issued, and translated into English (if applicable).'
    ]
  },
  'Marriage Certificate': {
    purpose: 'Proof of family relationships and parental consent (For applicants with children)',
    requirements: [
      'Valid proof of spousal relationship.',
      'Must be government-issued, official, and translated if not in English.',
      'Names must match both passports.'
    ]
  },
  'Family Photos': {
    purpose: 'Proof of family relationships and parental consent (For applicants with children)',
    requirements: [
      'Optional, but useful to show genuine relationship.',
      'Include clear, recent photos with spouse or children in various settings.'
    ]
  },
  'Parental Consent / Authorization Letter (for children)': {
    purpose: 'Proof of family relationships and parental consent (For applicants with children)',
    requirements: [
      'Required if child(ren) are travelling with one parent or alone.',
      'Must include: Both parents\' full names and signatures, Consent statement allowing the child to study or reside in the UK, Passport numbers of both parents, Contact details.',
      'Should be notarized or certified if possible.',
      'Must align with the child\'s birth certificate details.'
    ]
  }
};