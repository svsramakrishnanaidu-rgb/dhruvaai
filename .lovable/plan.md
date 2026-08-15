# Plan: Resolve Agmarknet Server Function 500 Errors

The application is experiencing `500 Internal Server Error` when calling `fetchAgmarknet` and `fetchAgmarknetPaged` via TanStack Start server functions. The dev server logs indicate `Error: Invalid server function ID`, which typically happens when the server function split transform fails or the environment is unstable during a hot reload.

## Proposed Changes

### 1. Refactor Agmarknet Server Functions
Move the actual logic from `src/lib/agmarknet.functions.ts` into `src/lib/agmarknet.server.ts` or similar to ensure a clean boundary and stable ID generation. I will also wrap the handlers in try-catch blocks to prevent 500s from propagating if the upstream API fails.

### 2. Fix Input Validation
The server logs show payloads like `{"state": "Andhra Pradesh", "limit": 1500}`. I will ensure the `validator` in `createServerFn` explicitly parses this using Zod to avoid runtime type mismatches that might lead to internal errors.

### 3. Stabilize Development Environment
The "Invalid server function ID" error is often cleared by a fresh build or dev server restart. I will trigger a dev server restart after the code changes to ensure the Vite transform cache is clean.

## Technical Details

- **Files affected**:
    - `src/lib/agmarknet.functions.ts`: Update to be a thin wrapper.
    - `src/lib/agmarknet.server.ts`: Ensure robust handling of the `DATA_GOV_IN_API_KEY`.
    - `src/lib/agmarknet.schema.ts`: (Verify) Ensure schemas match the actual data.

- **Checklist**:
    - [ ] Move logic to `.server.ts`.
    - [ ] Add Zod validation to `createServerFn`.
    - [ ] Restart dev server.
    - [ ] Verify functionality via preview.
