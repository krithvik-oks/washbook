import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getAppSettings() {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

export async function updateAppName(appName: string) {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { appName },
    create: { id: SETTINGS_ID, appName },
  });
}
