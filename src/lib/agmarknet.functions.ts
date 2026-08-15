import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  agmarknetQuery,
  agmarknetQueryPaged,
} from "./agmarknet.server";

export type { AgmarknetRecord, AgmarknetResponse } from "./agmarknet.server";

const AgmarknetQuerySchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  market: z.string().optional(),
  commodity: z.string().optional(),
  variety: z.string().optional(),
  grade: z.string().optional(),
  date: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  pages: z.number().optional(),
});

/** Single-page live mandi price query (Agmarknet / data.gov.in). */
export const fetchAgmarknet = createServerFn({ method: "GET" })
  .validator((input: unknown) => AgmarknetQuerySchema.parse(input))
  .handler(async ({ data }) => {
    try {
      return await agmarknetQuery(data);
    } catch (error) {
      console.error("fetchAgmarknet error:", error);
      throw error;
    }
  });

/** Multi-page live mandi price query for nationwide crop coverage. */
export const fetchAgmarknetPaged = createServerFn({ method: "GET" })
  .validator((input: unknown) => AgmarknetQuerySchema.parse(input))
  .handler(async ({ data }) => {
    try {
      return await agmarknetQueryPaged(data);
    } catch (error) {
      console.error("fetchAgmarknetPaged error:", error);
      throw error;
    }
  });
