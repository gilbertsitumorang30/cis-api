import 'dotenv/config';

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value !== undefined && value.length > 0 ? value : undefined;
}

/**
 * Merakit DATABASE_URL untuk Drizzle/mysql2.
 *
 * Prioritas:
 * 1. DATABASE_URL yang ditulis eksplisit (tanpa placeholder `${...}`).
 * 2. Bila DATABASE_URL kosong atau masih berisi placeholder (mis. dikirim mentah
 *    lewat `env_file` docker-compose yang tidak melakukan interpolasi), URL dirakit
 *    dari variabel MYSQL_*.
 */
function resolveDatabaseUrl(): string {
  const raw = optional('DATABASE_URL');

  if (raw && !raw.includes('${')) {
    return raw;
  }

  const host = optional('MYSQL_HOST') ?? '127.0.0.1';
  const port = optional('MYSQL_PORT') ?? '3306';
  const user = optional('MYSQL_USER');
  const password = optional('MYSQL_PASSWORD');
  const database = optional('MYSQL_DATABASE');

  if (!user || !password || !database) {
    throw new Error(
      'Konfigurasi database tidak lengkap: isi DATABASE_URL, atau ' +
        'MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE di .env',
    );
  }

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

export const env = {
  PORT: Number(optional('PORT') ?? 3000),
  UPLOAD_DIR: optional('UPLOAD_DIR') ?? './uploads',
  DATABASE_URL: resolveDatabaseUrl(),
};
