import { createServerFn } from "@tanstack/react-start";
import {
  agmarknetQuery,
  agmarknetQueryPaged,
  type AgmarknetQuery,
  type AgmarknetResponse,
} from "./agmarknet.server";

export type { AgmarknetRecord, AgmarknetResponse } from "./agmarknet.server";

/** Single-page live mandi price query (Agmarknet / data.gov.in). */
export const fetchAgmarknet = createServerFn({ method: "GET" })
  .validator((input: AgmarknetQuery) => input)
  .handler(async ({ data }): Promise<AgmarknetResponse> => agmarknetQuery(data));

/** Multi-page live mandi price query for nationwide crop coverage. */
export const fetchAgmarknetPaged = createServerFn({ method: "GET" })
  .validator((input: AgmarknetQuery) => input)
  .handler(async ({ data }): Promise<AgmarknetResponse> => agmarknetQueryPaged(data));
