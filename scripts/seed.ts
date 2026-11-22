// npm run seed — creates the first admin (from SEED_ADMIN_* in .env.local) and,
// on an empty database, some starter categories, products and delivery
// options. Safe to re-run: existing records are left alone.
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD || "";
  const name = process.env.SEED_ADMIN_NAME || "Store Admin";

  if (!email || password.length < 8) {
    console.log("Skipping admin: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (8+ characters) in .env.local");
    return;
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    console.log(`Admin ${email} already exists`);
    return;
  }

  // Sign-up is disabled in lib/auth.ts, so the user + credential account
  // are written directly, the same way better-auth stores them.
  const userId = crypto.randomUUID();
  await prisma.user.create({
    data: { id: userId, email, name, emailVerified: true, role: "OWNER" },
  });
  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: await hashPassword(password),
    },
  });
  console.log(`Created admin ${email}`);
}

const CATALOGUE: Record<string, { name: string; price: number; compareAtPrice?: number; stock: number; featured?: boolean; description: string }[]> = {
  Phones: [
    { name: "Fast Charger 25W USB-C", price: 120, stock: 40, featured: true, description: "25W power adapter with USB-C output. Works with most Android phones and iPhone 15 and later." },
    { name: "Braided USB-C to USB-C Cable (2m)", price: 65, compareAtPrice: 85, stock: 80, description: "Tough braided nylon cable, 60W charging and fast data transfer." },
    { name: "10,000mAh Power Bank", price: 250, stock: 25, featured: true, description: "Slim power bank that charges two devices at once. Fits in a pocket." },
  ],
  Audio: [
    { name: "Wireless Earbuds with Charging Case", price: 380, compareAtPrice: 450, stock: 18, featured: true, description: "Bluetooth 5.3 earbuds with up to 24 hours of battery including the case." },
    { name: "Portable Bluetooth Speaker", price: 420, stock: 12, description: "Splash-resistant speaker with 12-hour battery and deep bass." },
  ],
  Computing: [
    { name: "Wireless Mouse", price: 95, stock: 50, description: "Quiet clicks, 18-month battery life, plug-and-play USB receiver." },
    { name: "Laptop Stand (Aluminium)", price: 210, stock: 15, featured: true, description: "Raises your screen to eye level. Folds flat for your bag." },
    { name: "USB-C Hub, 6-in-1", price: 340, stock: 4, description: "HDMI 4K, 3× USB-A, SD card reader and USB-C charging pass-through." },
  ],
  Home: [
    { name: "Electric Kettle 1.7L", price: 280, stock: 20, description: "Stainless steel kettle with auto shut-off and boil-dry protection." },
    { name: "LED Desk Lamp", price: 175, stock: 0, description: "Three colour temperatures and a USB charging port in the base." },
  ],
};

async function seedCatalogue() {
  if ((await prisma.product.count()) > 0) {
    console.log("Products already exist — skipping the starter catalogue");
    return;
  }
  for (const [categoryName, products] of Object.entries(CATALOGUE)) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(categoryName) },
      update: {},
      create: { name: categoryName, slug: slugify(categoryName) },
    });
    for (const p of products) {
      await prisma.product.create({
        data: { ...p, slug: slugify(p.name), images: [], categoryId: category.id },
      });
    }
  }
  console.log("Created starter categories and products (add photos from the admin panel)");
}

async function seedShipping() {
  if ((await prisma.shippingMethod.count()) > 0) return;
  await prisma.shippingMethod.createMany({
    data: [
      { name: "Accra & Tema delivery", description: "Delivered by our rider.", fee: 30, eta: "1–2 days", sortOrder: 1 },
      { name: "Accra same-day", description: "Order before 12pm.", fee: 50, eta: "Today", sortOrder: 2 },
      { name: "Nationwide", description: "Sent by bus parcel service; pick up at your nearest station.", fee: 60, eta: "2–4 days", sortOrder: 3 },
    ],
  });
  console.log("Created delivery options");
}

seedAdmin()
  .then(seedCatalogue)
  .then(seedShipping)
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
