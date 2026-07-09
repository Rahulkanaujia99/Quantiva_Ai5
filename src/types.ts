
export interface FinancialData {
  revenue: string;
  ebitda: string;
  pat: string;
}

export interface StrategicPoint {
  title: string;
  value?: string;
  details: string;
  impact?: string;
}

export interface FinancialDrivers {
  revenue: string;
  ebitda: string;
  pat: string;
}

export interface QuarterEntry {
  quarter: string;
  revenue: number;
  ebitda: number;
  pat: number;
}

export interface ExtractedData {
  headline: string;
  summary: string;
  financials: FinancialData;
  financialDrivers: FinancialDrivers;
  chartData: QuarterEntry[];
  investments_capex: StrategicPoint[];
  partnerships_jvs: StrategicPoint[];
  mna_expansions: StrategicPoint[];
  strategic_dev: StrategicPoint[];
  future_plans: StrategicPoint[];
}

export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

export enum Category {
  INVESTMENTS = 'investments',
  PARTNERSHIPS = 'partnerships',
  M_A = 'm_a',
  STRATEGY = 'strategy',
  FUTURE = 'future'
}

export interface QRAvailabilityStatus {
  status: 'Available' | 'Not Available' | 'Coming Soon' | 'Error';
  expectedDate?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  summary: string;
}

export interface QRCompanyStatus {
  companyName: string;
  quarter: string;
  status: 'Available' | 'Not Available' | 'Downloaded' | 'Error';
  publishedDate: string;
  source: string;
  downloadUrl?: string;
  bseLink?: string;
  remarks: string;
  category: 'Oil & Gas' | 'Power' | 'Other';
}
