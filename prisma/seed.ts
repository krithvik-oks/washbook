import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

  console.log(`Seeded tenant "${tenant.name}" at /${tenant.slug}`);
  console.log("Login: owner@demo-wash.test / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
