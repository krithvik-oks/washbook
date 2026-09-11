import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function dateAt(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

interface DemoBooking {
  serviceIndex: number;
  daysFromNow: number;
  hour: number;
  minute?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
}

interface DemoTenant {
  slug: string;
  name: string;
  phone: string;
  address: string;
  capacity: number;
  ownerEmail: string;
  ownerName: string;
  services: { name: string; durationMinutes: number; price: number }[];
  hours: { days: number[]; openTime: string; closeTime: string };
  bookings: DemoBooking[];
}

const DEMO_TENANTS: DemoTenant[] = [
  {
    slug: "sparkle-auto-spa",
    name: "Sparkle Auto Spa",
    phone: "(555) 201-4488",
    address: "48 Harbor Blvd, Riverside",
    capacity: 3,
    ownerEmail: "owner@sparkle-auto-spa.demo",
    ownerName: "Maria Chen",
    services: [
      { name: "Express Wash", durationMinutes: 15, price: 12 },
      { name: "Full Service Wash", durationMinutes: 30, price: 25 },
      { name: "Premium Detail", durationMinutes: 90, price: 75 },
      { name: "Ceramic Coating", durationMinutes: 120, price: 150 },
    ],
    hours: { days: [1, 2, 3, 4, 5, 6], openTime: "08:00", closeTime: "19:00" },
    bookings: [
      { serviceIndex: 0, daysFromNow: -4, hour: 9, customerName: "Jenna Park", customerPhone: "555-310-2211", status: "COMPLETED" },
      { serviceIndex: 1, daysFromNow: -3, hour: 11, customerName: "Marcus Webb", customerPhone: "555-310-4402", status: "COMPLETED" },
      { serviceIndex: 2, daysFromNow: -2, hour: 14, customerName: "Priya Nair", customerPhone: "555-310-7719", status: "NO_SHOW" },
      { serviceIndex: 1, daysFromNow: -1, hour: 10, customerName: "Tom Ricci", customerPhone: "555-310-9038", status: "COMPLETED" },
      { serviceIndex: 0, daysFromNow: 0, hour: 16, customerName: "Alicia Grant", customerPhone: "555-310-1187", status: "CONFIRMED" },
      { serviceIndex: 3, daysFromNow: 1, hour: 9, customerName: "David Kim", customerPhone: "555-310-5560", customerEmail: "david.kim@example.com", status: "CONFIRMED" },
      { serviceIndex: 1, daysFromNow: 1, hour: 13, customerName: "Sofia Reyes", customerPhone: "555-310-3324", status: "CONFIRMED" },
      { serviceIndex: 2, daysFromNow: 2, hour: 15, customerName: "Nate Okafor", customerPhone: "555-310-8871", status: "CONFIRMED" },
      { serviceIndex: 0, daysFromNow: 3, hour: 10, customerName: "Ella Brandt", customerPhone: "555-310-6602", status: "CANCELLED" },
      { serviceIndex: 1, daysFromNow: 4, hour: 12, customerName: "Ryan Coleman", customerPhone: "555-310-0093", status: "CONFIRMED" },
    ],
  },
  {
    slug: "quickwash-express",
    name: "QuickWash Express",
    phone: "(555) 640-2255",
    address: "1290 Route 9, Millbrook",
    capacity: 4,
    ownerEmail: "owner@quickwash-express.demo",
    ownerName: "Deshawn Miller",
    services: [
      { name: "Basic Wash", durationMinutes: 10, price: 8 },
      { name: "Wash & Vacuum", durationMinutes: 20, price: 15 },
      { name: "Deluxe Wash", durationMinutes: 25, price: 22 },
    ],
    hours: { days: [0, 1, 2, 3, 4, 5, 6], openTime: "07:00", closeTime: "20:00" },
    bookings: [
      { serviceIndex: 0, daysFromNow: -3, hour: 8, customerName: "Grace Liu", customerPhone: "555-640-1120", status: "COMPLETED" },
      { serviceIndex: 1, daysFromNow: -2, hour: 9, customerName: "Owen Blake", customerPhone: "555-640-3391", status: "COMPLETED" },
      { serviceIndex: 2, daysFromNow: -1, hour: 17, customerName: "Hannah Ford", customerPhone: "555-640-5528", status: "COMPLETED" },
      { serviceIndex: 0, daysFromNow: 0, hour: 8, customerName: "Ben Tucker", customerPhone: "555-640-7743", status: "CONFIRMED" },
      { serviceIndex: 1, daysFromNow: 0, hour: 18, customerName: "Ivy Chambers", customerPhone: "555-640-2260", status: "CONFIRMED" },
      { serviceIndex: 2, daysFromNow: 1, hour: 11, customerName: "Sam Ortega", customerPhone: "555-640-9915", status: "CONFIRMED" },
      { serviceIndex: 0, daysFromNow: 2, hour: 7, customerName: "Leah Novak", customerPhone: "555-640-0087", status: "CONFIRMED" },
      { serviceIndex: 1, daysFromNow: 2, hour: 19, customerName: "Carlos Mendez", customerPhone: "555-640-4456", status: "CANCELLED" },
    ],
  },
  {
    slug: "downtown-car-care",
    name: "Downtown Car Care",
    phone: "(555) 882-3300",
    address: "77 Kessler St, Downtown",
    capacity: 2,
    ownerEmail: "owner@downtown-car-care.demo",
    ownerName: "Angela Ruiz",
    services: [
      { name: "Hand Wash", durationMinutes: 20, price: 18 },
      { name: "Wash & Wax", durationMinutes: 40, price: 35 },
      { name: "Interior Deep Clean", durationMinutes: 60, price: 50 },
      { name: "Full Detail Package", durationMinutes: 150, price: 120 },
    ],
    hours: { days: [1, 2, 3, 4, 5], openTime: "09:00", closeTime: "17:00" },
    bookings: [
      { serviceIndex: 1, daysFromNow: -5, hour: 10, customerName: "Wesley Park", customerPhone: "555-882-1102", status: "COMPLETED" },
      { serviceIndex: 3, daysFromNow: -2, hour: 9, customerName: "Nora Fitzgerald", customerPhone: "555-882-3348", status: "COMPLETED" },
      { serviceIndex: 0, daysFromNow: -1, hour: 13, customerName: "Ahmed Siddiqui", customerPhone: "555-882-6690", status: "COMPLETED" },
      { serviceIndex: 2, daysFromNow: 1, hour: 11, customerName: "Kayla Simmons", customerPhone: "555-882-7723", status: "CONFIRMED" },
      { serviceIndex: 1, daysFromNow: 2, hour: 14, customerName: "Victor Hale", customerPhone: "555-882-0091", status: "CONFIRMED" },
      { serviceIndex: 0, daysFromNow: 3, hour: 9, customerName: "Rosa Delgado", customerPhone: "555-882-4415", status: "CONFIRMED" },
    ],
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "Refusing to run demo seed data against a production database (NODE_ENV=production). " +
        "Use `npm run db:create-admin` to create a real platform admin instead."
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  for (const demo of DEMO_TENANTS) {
    await prisma.tenant.deleteMany({ where: { slug: demo.slug } });

    const tenant = await prisma.tenant.create({
      data: {
        slug: demo.slug,
        name: demo.name,
        phone: demo.phone,
        address: demo.address,
        capacity: demo.capacity,
        subscriptionStatus: "ACTIVE",
        users: {
          create: {
            email: demo.ownerEmail,
            passwordHash,
            name: demo.ownerName,
            role: "BUSINESS_OWNER",
          },
        },
        services: {
          create: demo.services,
        },
        availabilityRules: {
          create: demo.hours.days.map((dayOfWeek) => ({
            dayOfWeek,
            openTime: demo.hours.openTime,
            closeTime: demo.hours.closeTime,
          })),
        },
      },
      include: { services: true },
    });

    for (const b of demo.bookings) {
      const service = tenant.services[b.serviceIndex];
      const startTime = dateAt(b.daysFromNow, b.hour, b.minute);
      const endTime = addMinutes(startTime, service.durationMinutes);

      await prisma.booking.create({
        data: {
          tenantId: tenant.id,
          serviceId: service.id,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          customerEmail: b.customerEmail,
          startTime,
          endTime,
          status: b.status,
        },
      });
    }

    console.log(`Seeded "${tenant.name}" at /${tenant.slug} (${demo.bookings.length} bookings)`);
  }

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

  console.log("\nDemo logins (all use password: password123):");
  for (const demo of DEMO_TENANTS) {
    console.log(`  Business owner - ${demo.name}: ${demo.ownerEmail}`);
  }
  console.log("  Platform admin: admin@washbook.test");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
