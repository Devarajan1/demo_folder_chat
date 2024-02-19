import { cookies } from "next/headers";
import { buildUrl } from "./utilsSS";
import { AuthType } from "./constants";

export const getAuthTypeMetadataSS = async () => {
  const res = await fetch(buildUrl("/auth/type"));
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  const authType = data.auth_type;

  // for SAML / OIDC, we auto-redirect the user to the IdP when the user visits
  // Folderchat in an un-authenticated state
  if (authType === "oidc" || authType === "saml") {
    return {
      authType,
      autoRedirect: true,
      requiresVerification: data.requires_verification,
    };
  }
  return {
    authType,
    autoRedirect: false,
    requiresVerification: data.requires_verification,
  };
};

export const getAuthDisabledSS = async () => {
  return (await getAuthTypeMetadataSS()).authType === "disabled";
};

const geOIDCAuthUrlSS = async () => {
  const res = await fetch(buildUrl("/auth/oidc/authorize"));
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  return data.authorization_url;
};

const getGoogleOAuthUrlSS = async () => {
  const res = await fetch(buildUrl("/auth/oauth/authorize"));
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  return data.authorization_url;
};

const getSAMLAuthUrlSS = async () => {
  const res = await fetch(buildUrl("/auth/saml/authorize"));
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  return data.authorization_url;
};

export const getAuthUrlSS = async (authType) => {
  // Returns the auth url for the given auth type
  switch (authType) {
    case "disabled":
      return "";
    case "basic":
      return "";
    case "google_oauth":
      return await getGoogleOAuthUrlSS();
    case "saml":
      return await getSAMLAuthUrlSS();
    case "oidc":
      return await geOIDCAuthUrlSS();
  }
};

const logoutStandardSS = async (headers) => {
  return await fetch(buildUrl("/auth/logout"), {
    method: "POST",
    headers: headers,
  });
};

const logoutSAMLSS = async (headers) => {
  return await fetch(buildUrl("/auth/saml/logout"), {
    method: "POST",
    headers: headers,
  });
};

export const logoutSS = async (
  authType,
  headers
) => {
  switch (authType) {
    case "disabled":
      return null;
    case "saml":
      return await logoutSAMLSS(headers);
    default:
      return await logoutStandardSS(headers);
  }
};

export const getCurrentUserSS = async () => {
  try {
    const response = await fetch(buildUrl("/manage/me"), {
      credentials: "include",
      next: { revalidate: 0 },
      headers: {
        cookie: cookies()
          .getAll()
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join("; "),
      },
    });
    if (!response.ok) {
      return null;
    }
    const user = await response.json();
    return user;
  } catch (e) {
    console.log(`Error fetching user: ${e}`);
    return null;
  }
};

export const processCookies = (cookies) => {
  return cookies
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
};
