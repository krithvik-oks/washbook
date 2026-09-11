import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "Refusing to run demo seed data against a production database (NODE_ENV=production). " +
        "Use `npm run db:create-admin` to create a real platform admin instead."
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-wash" },
    update: {},
    create: {
      slug: "demo-wash",
      name: "Demo Car Wash",
      phone: "555-0100",
      address: "123 Main St",
      capacity: 2,
      subscriptionStatus: "TRIALING",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      users: {
        create: {
          email: "owner@demo-wash.test",
          passwordHash,
          name: "Demo Owner",
          role: "BUSINESS_OWNER",
        },
      },
      services: {
        create: [
          { name: "Basic Wash", durationMinutes: 20, price: 15 },
          { name: "Deluxe Wash & Wax", durationMinutes: 45, price: 35 },
        ],
      },
      availabilityRules: {
        create: [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
          dayOfWeek,
          openTime: "08:00",
          closeTime: "18:00",
        })),
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@washbook.test" },
    update: {},
    create: {
      email: "admin@washbook.test",
      passwordHash,
      name: "Platform Admin",
      role: "PLATFORM_ADMIN",
    },
  });

  console.log(`Seeded tenant "${tenant.name}" at /${tenant.slug}`);
  console.log("Business login: owner@demo-wash.test / password123");
  console.log("Admin login: admin@washbook.test / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
