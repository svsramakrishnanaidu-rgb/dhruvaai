import { z } from "zod";

const AgmarknetRecordSchema = z.object({
  state: z.string(),
  district: z.string(),
  market: z.string(),
  commodity: z.string(),
  variety: z.string(),
  grade: z.string(),
  arrival_date: z.string(),
  min_price: z.number().default(0),
  max_price: z.number().default(0),
  modal_price: z.number().default(0),
  source: z.string().default("data.gov.in / Agmarknet"),
});

export const AgmarknetResponseSchema = z.object({
  ok: z.boolean(),
  updated: z.string(),
  source: z.string(),
  total: z.number(),
  records: z.array(AgmarknetRecordSchema),
  error: z.string().optional(),
});
