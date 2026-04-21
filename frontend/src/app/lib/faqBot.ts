export interface FAQEntry {
  keywords: string[];
  answer: string;
}

export const FAQ_ENTRIES: FAQEntry[] = [
  { keywords: ['stamp duty', 'stamp'], answer: 'Stamp duty is a government tax on property transactions, typically 4–7% of the property value. Rates vary by state/country. Female buyers often get a rebate in India.' },
  { keywords: ['registration', 'register'], answer: 'Registration charges are fees paid to legally register the property in your name — usually 0.5–2% of the property value.' },
  { keywords: ['gst', 'goods and services tax'], answer: 'GST of 5% applies to under-construction flats in India (1% for affordable housing). Ready-to-move properties are exempt.' },
  { keywords: ['emi', 'loan', 'mortgage'], answer: 'EMI is your monthly loan repayment. It depends on loan amount, interest rate, and tenure. Use the calculator with "Include Loan" checked to see your EMI.' },
  { keywords: ['pmay', 'pradhan mantri', 'subsidy', 'affordable'], answer: 'PMAY (Pradhan Mantri Awas Yojana) provides interest subsidies for first-time home buyers in India. Savings can be ~₹2.67L for EWS/LIG categories.' },
  { keywords: ['compare', 'scenario', 'versus', 'vs'], answer: 'Use the Compare page to evaluate two property scenarios side-by-side — different cities, property types, or loan options. Click "Compare" in the navigation.' },
  { keywords: ['city', 'cities', 'available', 'supported'], answer: 'We support 35+ cities across India, UAE, and USA. Select your country first, then pick a city from the dropdown.' },
  { keywords: ['house', 'independent', 'villa', 'plot'], answer: 'For independent houses, you need plot area + built-up area. The calculator estimates land cost, construction cost, and all government charges.' },
  { keywords: ['flat', 'apartment', 'condo'], answer: 'For flats, enter built-up area and select quality (basic/standard/luxury). The calculator covers base cost, GST, stamp duty, registration, and optional EMI.' },
  { keywords: ['receipt', 'pdf', 'print', 'save'], answer: 'After running a calculation, click "View Receipt" to get a printable breakdown. You can save it as PDF using your browser\'s print dialog.' },
  { keywords: ['add city', 'contribute', 'new city'], answer: 'Want to add your city? Go to "Add City" in the navigation. Fill the form, generate the JSON rule file, and submit a Pull Request on GitHub.' },
  { keywords: ['currency', 'usd', 'aed', 'inr', 'dollar', 'dirham'], answer: 'Currency is automatically selected based on the country — INR for India, USD for USA, AED for UAE.' },
  { keywords: ['accuracy', 'reliable', 'correct', 'source'], answer: 'Our rules are sourced from official government portals and updated regularly. Each rule file includes a source URL and last-updated date.' },
  { keywords: ['voice', 'speak', 'microphone', 'mic'], answer: 'Click the microphone icon in the chat input to use voice. Speak your question and it will be transcribed automatically. Requires a modern browser.' },
  { keywords: ['help', 'how', 'what', 'guide'], answer: 'I can help with property cost calculations, stamp duty rates, EMI estimates, and city comparisons. Try asking about a specific topic like "stamp duty" or "EMI".' },
];

export function matchFAQ(message: string): string | null {
  const lower = message.toLowerCase();
  for (const entry of FAQ_ENTRIES) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.answer;
    }
  }
  return null;
}
