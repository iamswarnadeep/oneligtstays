// Brand assets and helpers
export const LOGO_URL = "https://customer-assets.emergentagent.com/job_resort-finder-21/artifacts/3vmo8ey0_OneLightStays%20Logo.png";

// Currency helper — Indian Rupees
export const inr = (n) => {
  if (n == null || isNaN(n)) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

export const inrDec = (n) => {
  if (n == null || isNaN(n)) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const SUPPORT_PHONE = "+911800000000";
export const SUPPORT_PHONE_DISPLAY = "+91 1800 000 000";
