const API_BASE = "http://localhost:8080/api";

const API_ORIGIN = API_BASE.replace(
  /\/api\/?$/,
  ""
);

export function resolveMediaUrl(
  url?: string | null
): string {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  return `${API_ORIGIN}${
    url.startsWith("/") ? url : `/${url}`
  }`;
}