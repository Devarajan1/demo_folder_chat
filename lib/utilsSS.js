import { cookies } from "next/headers";
import { INTERNAL_URL } from "./constants";

export function buildUrl(path) {
  if (path.startsWith("/")) {
    return `${INTERNAL_URL}${path}`;
  }
  return `${INTERNAL_URL}/${path}`;
}

export function fetchSS(url, options) {
  const init = options || {
    credentials: "include",
    cache: "no-store",
    headers: {
      cookie: cookies()
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; "),
    },
  };
  return fetch(buildUrl(url), init);
}
