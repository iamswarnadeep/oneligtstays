// Brand assets and helpers
export const LOGO_URL = "/brandLogo.png";

// Currency helper — Indian Rupees
export const inr = (n) => {
  if (n == null || isNaN(n)) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

export const inrDec = (n) => {
  if (n == null || isNaN(n)) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const SUPPORT_EMAIL = "booking@onelightstays.com";
export const SUPPORT_PHONE = "+917303436699";
export const SUPPORT_PHONE_DISPLAY = "+91-73034-36699";

export const SUPPORT_EMAIL_2 = "onelightstays@gmail.com";
export const SUPPORT_PHONE_2 = "+918800288699";
export const SUPPORT_PHONE_DISPLAY_2 = "+91-88002-88699";
