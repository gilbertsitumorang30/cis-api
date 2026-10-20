/**
 * Normalisasi nilai `answer` dari multipart.
 *
 * Dart mengirim `bool?` lewat `toString()`, sehingga pertanyaan yang belum dijawab
 * bisa datang sebagai string literal `"null"`. Nilai seperti itu harus dianggap
 * "belum dijawab" (NULL), bukan error.
 */
export function normalizeAnswer(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }

  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;

  return null;
}
