
export interface CompanyInfo {
  name: string;
  website: string;
  bseLink: string;
}

export const OIL_GAS_COMPANIES: CompanyInfo[] = [
  { name: "ONGC", website: "", bseLink: "https://www.bseindia.com/stock-share-price/oil-and-natural-gas-corporation-ltd/ongc/500312/corp-announcements/" },
  { name: "Oil India", website: "https://www.oil-india.com/financial-results/34", bseLink: "https://www.bseindia.com/stock-share-price/oil-india-ltd/oil/533106/corp-announcements/" },
  { name: "IOCL", website: "http://iocl.com/pages/FinancialResults", bseLink: "https://www.bseindia.com/stock-share-price/indian-oil-corporation-ltd/ioc/530965/corp-announcements/" },
  { name: "BPCL", website: "https://www.bharatpetroleum.in/bharat-petroleum-for/investors/disclosure-under-regulation-46-and-62-of-sebi-lodr-regulations/financial-performance", bseLink: "https://www.bseindia.com/stock-share-price/bharat-petroleum-corporation-ltd/bpcl/500547/corp-announcements/" },
  { name: "HPCL", website: "http://hindustanpetroleum.com/financial", bseLink: "https://www.bseindia.com/stock-share-price/hindustan-petroleum-corporation-ltd/hindpetro/500104/corp-announcements/" },
  { name: "GAIL", website: "https://www.gailonline.com/IZFinancialResult.html", bseLink: "https://www.bseindia.com/stock-share-price/gail-(india)-ltd/gail/532155/corp-announcements/" },
  { name: "IGL", website: "https://www.iglonline.net/financial", bseLink: "https://www.bseindia.com/stock-share-price/indraprastha-gas-ltd/igl/532514/corp-announcements/" },
  { name: "RIL", website: "https://www.ril.com/investors/financial-reporting", bseLink: "https://www.bseindia.com/stock-share-price/reliance-industries-ltd/reliance/500325/corp-announcements/" },
  { name: "MGL", website: "", bseLink: "https://www.bseindia.com/stock-share-price/mahanagar-gas-ltd/mgl/539957/corp-announcements/" },
  { name: "Petronet", website: "https://www.petronetlng.in/financial-performance", bseLink: "https://www.bseindia.com/stock-share-price/petronet-lng-ltd/petronet/532522/corp-announcements/" },
  { name: "Gujarat Gas", website: "https://www.gujaratgas.com/investors/investor-presentation/#", bseLink: "https://www.bseindia.com/stock-share-price/gujarat-gas-ltd/gujgasltd/539336/corp-announcements/" },
  { name: "GSPL", website: "https://gspcgroup.com/GSPL/quarterly-results", bseLink: "https://www.bseindia.com/stock-share-price/gujarat-state-petronet-ltd/gspl/532702/" }
];

export const POWER_COMPANIES: CompanyInfo[] = [
  { name: "CESC", website: "https://www.cesc.co.in/quarterlyResults", bseLink: "https://www.bseindia.com/stock-share-price/cesc-ltd/cesc/500084/corp-announcements/" },
  { name: "Tata Power", website: "https://www.tatapower.com/investor-resource-center/quarterly-reports-tab", bseLink: "https://www.bseindia.com/stock-share-price/tata-power-co-ltd/tatapower/500400/corp-announcements/" },
  { name: "Adani Power", website: "https://www.adanipower.com/investors/investor-downloads", bseLink: "https://www.bseindia.com/stock-share-price/adani-power-ltd/adanipower/533096/corp-announcements/" },
  { name: "Reliance Power", website: "https://www.reliancepower.co.in/web/reliance-power/financial-results", bseLink: "https://www.bseindia.com/stock-share-price/reliance-power-ltd/rpower/532939/corp-announcements/" },
  { name: "Torrent Power", website: "https://www.torrentpower.com/index.php/investors/financial?fy=2025-26", bseLink: "https://www.bseindia.com/stock-share-price/torrent-power-ltd/torntpower/532779/corp-announcements/" },
  { name: "NTPC", website: "https://ntpc.co.in/investors/financial-results", bseLink: "https://www.bseindia.com/stock-share-price/ntpc-ltd/ntpc/532555/corp-announcements/" },
  { name: "PGCIL", website: "https://www.powergrid.in/en/annual-quarterly-results", bseLink: "https://www.bseindia.com/stock-share-price/power-grid-corporation-of-india-ltd/powergrid/532898/corp-announcements/" },
  { name: "JSW Energy", website: "https://www.jswenergy.in/investors/energy/jsw-energy-fy-2025-26-financials-results", bseLink: "https://www.bseindia.com/stock-share-price/jsw-energy-ltd/jswenergy/533148/corp-announcements/" }
];
