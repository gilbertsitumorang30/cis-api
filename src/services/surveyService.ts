import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { db } from '../db/client';
import { surveyAnswers, surveyMedia, surveys } from '../db/schema';
import { env } from '../lib/env';

export interface UploadedMedia {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface SurveyPhotoInput {
  side: 'outside' | 'inside';
  position: string;
  file: UploadedMedia;
}

export interface SurveyAnswerInput {
  section: string;
  questionId: string;
  answer: boolean | null;
  typesSpecifications: string;
}

export interface SurveyInput {
  equipmentNumber: string;
  equipmentType: string;
  client: string;
  remarks: string;
  seals: {
    manlid: string;
    airlineTop: string;
    bottomOutlet: string;
  };
  answers: SurveyAnswerInput[];
  photos: SurveyPhotoInput[];
  videos: UploadedMedia[];
  rawPayload: Record<string, unknown>;
}

/**
 * Menyimpan satu survei: file media ke disk (`UPLOAD_DIR/surveys/<id>/`) dan
 * metadata ke MySQL dalam satu transaksi.
 */
export async function createSurvey(input: SurveyInput): Promise<string> {
  const surveyId = randomUUID();
  const surveyDir = path.join(env.UPLOAD_DIR, 'surveys', surveyId);

  const mediaRows: (typeof surveyMedia.$inferInsert)[] = [];

  if (input.photos.length > 0 || input.videos.length > 0) {
    await mkdir(surveyDir, { recursive: true });
  }

  for (const photo of input.photos) {
    const storedName = `photo_${photo.side}_${photo.position}.jpg`;
    await writeFile(path.join(surveyDir, storedName), photo.file.buffer);

    mediaRows.push({
      id: randomUUID(),
      surveyId,
      kind: 'photo',
      side: photo.side,
      position: photo.position,
      filename: photo.file.originalname,
      storedPath: path.posix.join('surveys', surveyId, storedName),
      mimeType: photo.file.mimetype,
      sizeBytes: photo.file.size,
    });
  }

  for (let index = 0; index < input.videos.length; index += 1) {
    const video = input.videos[index];
    const storedName = `video_${index}.mp4`;
    await writeFile(path.join(surveyDir, storedName), video.buffer);

    mediaRows.push({
      id: randomUUID(),
      surveyId,
      kind: 'video',
      side: null,
      position: null,
      filename: video.originalname,
      storedPath: path.posix.join('surveys', surveyId, storedName),
      mimeType: video.mimetype,
      sizeBytes: video.size,
    });
  }

  await db.transaction(async (tx) => {
    await tx.insert(surveys).values({
      id: surveyId,
      equipmentNumber: input.equipmentNumber,
      equipmentType: input.equipmentType,
      client: input.client,
      remarks: input.remarks,
      sealManlid: input.seals.manlid,
      sealAirlineTop: input.seals.airlineTop,
      sealBottomOutlet: input.seals.bottomOutlet,
      rawPayload: input.rawPayload,
    });

    if (input.answers.length > 0) {
      await tx.insert(surveyAnswers).values(
        input.answers.map((answer) => ({
          id: randomUUID(),
          surveyId,
          section: answer.section,
          questionId: answer.questionId,
          answer: answer.answer,
          typesSpecifications: answer.typesSpecifications,
        })),
      );
    }

    if (mediaRows.length > 0) {
      await tx.insert(surveyMedia).values(mediaRows);
    }
  });

  return surveyId;
}
