import { randomUUID } from 'node:crypto';

import { sql } from 'drizzle-orm';
import {
  boolean,
  char,
  datetime,
  index,
  int,
  json,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

export const surveys = mysqlTable(
  'surveys',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    equipmentNumber: varchar('equipment_number', { length: 191 }).notNull(),
    equipmentType: varchar('equipment_type', { length: 100 }).notNull(),
    client: varchar('client', { length: 191 }).notNull(),
    remarks: text('remarks'),
    sealManlid: varchar('seal_manlid', { length: 191 }),
    sealAirlineTop: varchar('seal_airline_top', { length: 191 }),
    sealBottomOutlet: varchar('seal_bottom_outlet', { length: 191 }),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    rawPayload: json('raw_payload').$type<Record<string, unknown>>(),
  },
  (table) => [
    index('idx_surveys_equipment_number').on(table.equipmentNumber),
    index('idx_surveys_created_at').on(table.createdAt),
  ],
);

export const surveyAnswers = mysqlTable(
  'survey_answers',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    surveyId: char('survey_id', { length: 36 })
      .notNull()
      .references(() => surveys.id, { onDelete: 'cascade' }),
    section: varchar('section', { length: 32 }).notNull(),
    questionId: varchar('question_id', { length: 64 }).notNull(),
    answer: boolean('answer'),
    typesSpecifications: text('types_specifications'),
  },
  (table) => [
    uniqueIndex('uq_survey_answers').on(
      table.surveyId,
      table.section,
      table.questionId,
    ),
  ],
);

export const surveyMedia = mysqlTable(
  'survey_media',
  {
    id: char('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    surveyId: char('survey_id', { length: 36 })
      .notNull()
      .references(() => surveys.id, { onDelete: 'cascade' }),
    kind: varchar('kind', { length: 16 }).notNull(),
    side: varchar('side', { length: 16 }),
    position: varchar('position', { length: 16 }),
    filename: varchar('filename', { length: 255 }).notNull(),
    storedPath: varchar('stored_path', { length: 512 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }),
    sizeBytes: int('size_bytes'),
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (table) => [index('idx_survey_media_survey').on(table.surveyId)],
);
