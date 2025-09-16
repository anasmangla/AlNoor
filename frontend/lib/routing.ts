export function getBasePath(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_PATH || "").trim();
  if (!raw) {
    return "";
  }
  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const normalized = withLeadingSlash.replace(/\/+$/, "");
  return normalized === "/" ? "" : normalized;
}

export function toAppPath(path: string): string {
  const base = getBasePath();
  if (!path) {
    return base ? `${base}/` : "/";
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const match = path.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] ?? "";
  const suffix = match?.[2] ?? "";
  const normalizedPath =
    pathname && pathname !== "/"
      ? pathname.startsWith("/")
        ? pathname
        : `/${pathname}`
      : "/";
  if (!base) {
    return `${normalizedPath}${suffix}`;
  }
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  if (
    normalizedPath === trimmedBase ||
    normalizedPath.startsWith(`${trimmedBase}/`)
  ) {
    return `${normalizedPath}${suffix}`;
  }
  const finalPath =
    normalizedPath === "/"
      ? `${trimmedBase}/`
      : `${trimmedBase}${normalizedPath}`;
  return `${finalPath}${suffix}`;
}
