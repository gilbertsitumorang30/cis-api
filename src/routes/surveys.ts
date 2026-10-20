import { Router, type NextFunction, type Request, type Response } from 'express';

import {
  ALL_QUESTION_IDS,
  MAX_VIDEOS,
  MAX_VIDEO_BYTES,
  SECTION_KEYS,
} from '../constants/questions';
import { normalizeAnswer } from '../lib/normalizeAnswer';
import { parseBracketFields } from '../lib/parseBracketFields';
import { PHOTO_FIELD_RE, VIDEO_FIELD_RE, upload } from '../middleware/upload';
import {
  createSurvey,
  type SurveyAnswerInput,
  type SurveyPhotoInput,
  type UploadedMedia,
} from '../services/surveyService';

export const surveysRouter = Router();

function asString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return String(value[0] ?? '');
  return String(value);
}

function toUploaded(file: Express.Multer.File): UploadedMedia {
  return {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    buffer: file.buffer,
  };
}

surveysRouter.post(
  '/surveys',
  upload.any(),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const nested = parseBracketFields(req.body as Record<string, unknown>);

      const equipmentNumber = asString(req.body?.equipment_number).trim();
      const equipmentType = asString(req.body?.equipment_type).trim();
      const client = asString(req.body?.client).trim();
      const remarks = asString(req.body?.remarks);

      if (!equipmentNumber) {
        res
          .status(400)
          .json({ success: false, message: 'equipment_number wajib diisi' });
        return;
      }
      if (!equipmentType) {
        res
          .status(400)
          .json({ success: false, message: 'equipment_type wajib diisi' });
        return;
      }
      if (!client) {
        res.status(400).json({ success: false, message: 'client wajib diisi' });
        return;
      }

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];

      const photos: SurveyPhotoInput[] = [];
      const videos: UploadedMedia[] = [];

      for (const file of files) {
        const photoMatch = PHOTO_FIELD_RE.exec(file.fieldname);
        if (photoMatch) {
          photos.push({
            side: photoMatch[1] as 'outside' | 'inside',
            position: photoMatch[2],
            file: toUploaded(file),
          });
          continue;
        }

        if (VIDEO_FIELD_RE.test(file.fieldname)) {
          videos.push(toUploaded(file));
        }
      }

      if (videos.length > MAX_VIDEOS) {
        res.status(400).json({
          success: false,
          message: `Maksimal ${MAX_VIDEOS} video untuk satu survei.`,
        });
        return;
      }

      const oversizedVideo = videos.find((video) => video.size > MAX_VIDEO_BYTES);
      if (oversizedVideo) {
        res.status(413).json({
          success: false,
          message: 'Ukuran video melebihi 1.000.000 byte.',
        });
        return;
      }

      const answers: SurveyAnswerInput[] = [];
      for (const section of SECTION_KEYS) {
        const group = nested[section];
        if (!group || typeof group !== 'object') continue;

        const groupEntries = group as Record<string, unknown>;
        for (const questionId of Object.keys(groupEntries)) {
          // question_id asing diabaikan agar app versi baru tetap aman.
          if (!ALL_QUESTION_IDS.has(questionId)) continue;

          const entry = (groupEntries[questionId] ?? {}) as Record<string, unknown>;
          answers.push({
            section,
            questionId,
            answer: normalizeAnswer(entry.answer),
            typesSpecifications: asString(entry.types_specifications),
          });
        }
      }

      const seals = (nested.tcse_seal_number ?? {}) as Record<string, unknown>;

      const id = await createSurvey({
        equipmentNumber,
        equipmentType,
        client,
        remarks,
        seals: {
          manlid: asString(seals.manlid_compartment_tank_seal_number),
          airlineTop: asString(
            seals.airline_top_outlet_compartment_tank_seal_number,
          ),
          bottomOutlet: asString(
            seals.bottom_outlet_compartment_tank_seal_number,
          ),
        },
        answers,
        photos,
        videos,
        rawPayload: nested,
      });

      res.status(201).json({
        success: true,
        data: { id, equipment_number: equipmentNumber },
      });
    } catch (error) {
      next(error);
    }
  },
);
