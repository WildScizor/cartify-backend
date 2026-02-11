export function translateProductTitle({
  originalTitle,
  lang,
  translationsDoc,
}) {
  if (!translationsDoc) return originalTitle;

  const entry = translationsDoc[originalTitle];
  if (!entry) return originalTitle;

  return entry[lang] || entry.en || originalTitle;
}
