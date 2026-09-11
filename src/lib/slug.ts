import { prisma } from "@/lib/prisma";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "wash";
  let candidate = root;
  let i = 1;
  while (await prisma.tenant.findUnique({ where: { slug: candidate } })) {
    i += 1;
    candidate = `${root}-${i}`;
  }
  return candidate;
}
