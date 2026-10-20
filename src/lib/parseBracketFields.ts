import qs from 'qs';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Memastikan field multipart ber-tanda-kurung menjadi objek nested.
 *
 * Tergantung versi parser, hasilnya bisa berbeda:
 * - Multer 2.x sudah mem-parse `exterior[frame][answer]` menjadi objek nested sendiri.
 * - Parser lain menaruh key mentah `"exterior[frame][answer]"` sebagai string.
 *
 * Fungsi ini menangani keduanya: objek yang sudah nested dipakai apa adanya, sedangkan
 * key string datar di-parsing dengan `qs`.
 *
 * (`express.urlencoded({ extended: true })` tidak berlaku untuk multipart.)
 */
export function parseBracketFields(
  body: Record<string, unknown>,
): Record<string, any> {
  const nested: Record<string, any> = {};
  const flatParts: string[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (isPlainObject(value)) {
      nested[key] = value;
      continue;
    }

    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (isPlainObject(item)) {
        continue;
      }
      const encodedValue = encodeURIComponent(
        item === null || item === undefined ? '' : String(item),
      );
      flatParts.push(`${encodeURIComponent(key)}=${encodedValue}`);
    }
  }

  if (flatParts.length > 0) {
    const parsed = qs.parse(flatParts.join('&'), { depth: 5 }) as Record<
      string,
      any
    >;

    for (const [key, value] of Object.entries(parsed)) {
      if (isPlainObject(nested[key]) && isPlainObject(value)) {
        nested[key] = { ...nested[key], ...value };
      } else {
        nested[key] = value;
      }
    }
  }

  return nested;
}
