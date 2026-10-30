// Runs `create` with a fresh random code, retrying if the unique index
// rejects it (Prisma P2002) — see helpers/codes.ts.
export default async function withUniqueCode<T>(
  makeCode: () => string,
  create: (code: string) => Promise<T>,
  attempts = 3,
): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await create(makeCode());
    } catch (err: any) {
      if (err?.code !== "P2002" || i >= attempts - 1) throw err;
    }
  }
}
