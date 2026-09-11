import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slug";
import { isValidTimeZone } from "@/lib/timezone";

const signupSchema = z.object({
  businessName: z.string().min(2),
  ownerName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  timezone: z.string().refine(isValidTimeZone, "Invalid timezone"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { businessName, ownerName, email, password, timezone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const slug = await uniqueSlug(businessName);
  const passwordHash = await bcrypt.hash(password, 10);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const tenant = await prisma.tenant.create({
    data: {
      slug,
      name: businessName,
      timezone,
      subscriptionStatus: "TRIALING",
      trialEndsAt,
      users: {
        create: {
          email,
          passwordHash,
          name: ownerName,
          role: "BUSINESS_OWNER",
        },
      },
      availabilityRules: {
        create: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
          dayOfWeek,
          openTime: "09:00",
          closeTime: "17:00",
        })),
      },
    },
  });

  return NextResponse.json({ slug: tenant.slug });
}
