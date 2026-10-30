import { createAuthClient } from "better-auth/react";

// Same origin as the page, so no baseURL is needed.
export const authClient = createAuthClient();
