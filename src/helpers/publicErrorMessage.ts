// What an API route sends back when something throws. Messages we throw on
// purpose ("That product is out of stock") are meant for the page and pass
// through; database (Prisma) errors are long, technical and describe our
// internals, so they're logged on the server and replaced with a plain
// sentence.
export const GENERIC_ERROR = "Something went wrong. Please try again in a moment.";

function isInternalError(err: any) {
  const name = String(err?.name || "");
  const message = String(err?.message || "");
  return (
    name.startsWith("PrismaClient") ||
    /^P\d{4}$/.test(String(err?.code || "")) ||
    /prisma\.\w+\.\w+\(\)|Invalid `prisma|Unknown argument|Argument `\w+`/.test(message)
  );
}

export default function publicErrorMessage(err: any, fallback = "Sorry an error occured") {
  if (isInternalError(err)) {
    console.error(err);
    return GENERIC_ERROR;
  }
  // A failed zod parse: show the first problem, not the whole issue list.
  if (err?.name === "ZodError" && err.issues?.length) {
    return err.issues[0].message;
  }
  return err?.message || fallback;
}
