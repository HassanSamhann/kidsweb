// Strip extra Arabic ligature/annotation characters from ayah text
// These appear in Islamic-Api Hafs JSON data (U+FD00–U+FDCF range)
export function cleanAyahText(text: string): string {
  return text.replace(/[\uFD00-\uFDCF]/g, '').trim();
}

// Strip trailing reference markers like /ذ54 from tafseer text
export function cleanTafseerText(text: string): string {
  return text
    .split(/(?:<br\s*\/?>)/i)
    .map(line => line.replace(/\/[\u0600-\u06FF]+\d+\s*$/, '').trim())
    .filter(Boolean)
    .join('<br />');
}
