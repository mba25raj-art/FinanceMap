import complete from './complete-lessons.json';
import guides from '../../content/domain-guides.json';
import study from './domain-study-guides.json';
import { sourceLinks as coreSources } from './lessons.js';
export const lessons = complete;
export const domainGuides = guides;
export const domainStudyGuides = study;
export const sourceLinks = {
  ...coreSources,
  foundations:{label:'CFA Institute · Investment Foundations curriculum',url:'https://www.cfainstitute.org/programs/investment-foundations-certificate'},
  standards:{label:'IFRS Foundation · Accounting Standards Navigator',url:'https://www.ifrs.org/issued-standards/list-of-standards/'},
  tvm:{label:'CFA Institute · Time Value of Money',url:'https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/time-value-money'},
  investing:{label:'CFA Institute · Investment curriculum',url:'https://www.cfainstitute.org/programs/cfa-program/curriculum'},
  bonds:{label:'CFA Institute · Interest Rate Risk and Return',url:'https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/interest-rate-risk-and-return'},
  derivatives:{label:'CFA Institute · Futures and Options',url:'https://www.cfainstitute.org/sites/default/files/-/media/documents/book/rf-publication/2013/rf-v2013-n3-1-pdf.pdf'},
  banking:{label:'BIS · Basel Framework',url:'https://www.bis.org/committees/bcbs/basel-framework'},
  insurance:{label:'IFRS Foundation · IFRS 17 insurance accounting',url:'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-17-insurance-contracts/'},
  personal:{label:'Investor.gov · Introduction to Investing (US investor resource)',url:'https://www.investor.gov/introduction-investing'},
  tax:{label:'IRS · US business-tax reference (jurisdiction example)',url:'https://www.irs.gov/businesses'},
  macro:{label:'IMF · Debt Sustainability',url:'https://www.imf.org/en/publications/fandd/issues/2020/09/what-is-debt-sustainability-basics'},
  ethics:{label:'CFA Institute · Ethics and Professional Conduct',url:'https://www.cfainstitute.org/standards/professionals/code-ethics-standards'},
  behaviour:{label:'Daniel Kahneman · Nobel Lecture',url:'https://www.nobelprize.org/uploads/2018/06/kahnemann-lecture.pdf'},
  digital:{label:'BIS · The next-generation monetary and financial system',url:'https://www.bis.org/publications/aer-2025/next-generation-monetary-financial-system'},
  sustainability:{label:'IFRS Foundation · Sustainability knowledge hub',url:'https://www.ifrs.org/sustainability/knowledge-hub/introduction-to-issb-and-ifrs-sustainability-disclosure-standards/'},
  ai:{label:'NIST · AI Risk Management Framework',url:'https://www.nist.gov/itl/ai-risk-management-framework'},
  upi:{label:'NPCI · UPI overview and FAQs',url:'https://www.npci.org.in/what-we-do/upi/faqs'},
  islamic:{label:'Islamic Financial Services Board · Principles and standards',url:'https://www.ifsb.org/'},
};
