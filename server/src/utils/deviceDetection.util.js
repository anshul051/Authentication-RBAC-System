/**
 * Parse user agent string to extract device, browser, and OS information.
 */
export const parseUserAgent = (userAgent) => {
  if (!userAgentString) {
    return {
      device: "Unknown Device",
      browser: "Unknown Browser",
      os: "Unknown OS",
    };
  }

  const ua = userAgentString.toLowerCase();

  //Detect Device type
  let device = "Desktop";
  if (/(tablet|ipad|playbook|silk) | (android(?!.*mobi))/i.test(ua)) {
    device = "Tablet/Mobile";
  } else if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua,
    )
  ) {
    device = "Mobile";
  }

  // Detect browser
  let browser = "Unknown Browser";
  if (ua.includes("edg/")) {
    browser = "Edge";
  } else if (ua.includes("chrome")) {
    browser = "Chrome";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("opera") || ua.includes("opr/")) {
    browser = "Opera";
  } else if (ua.includes("trident") || ua.includes("msie")) {
    browser = "Internet Explorer";
  } else if (ua.includes("postman")) {
    browser = "Postman";
  }

  // Detect OS
  let os = "Unknown OS";
  if (ua.includes("windows nt 10.0")) {
    os = "Windows 10";
  } else if (ua.includes("windows nt 6.3")) {
    os = "Windows 8.1";
  } else if (ua.includes("windows nt 6.2")) {
    os = "Windows 8";
  } else if (ua.includes("windows nt 6.1")) {
    os = "Windows 7";
  } else if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("mac os x")) {
    os = "macOS";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  return { device, browser, os };
};

/**
 * Generate a friendly session name based on device, browser, and OS information.
 */
export const getSessionName = (device, browser, os) => {
    // "Chrome on Windows 10 (Desktop)"
    // "Safari on iOS (Mobile)"
    // "Firefox on ubuntu"
    return `${browser} on ${os}`;
};