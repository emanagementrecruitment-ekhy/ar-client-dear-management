// Runs on every production start (see package.json "start:railway") —
// upserts a standing demo Client/Channel account, the same idea as AR Corp's
// own DEMO_TERA_CODE (Grace/DEMO-01): a fake email/phone nobody can actually
// receive mail at, but issueClientOtp() always surfaces its OTP on-screen
// (see DEMO_CLIENT_CODE in src/lib/constants.ts), so anyone can log in.
//
// The ledger itself is NOT auto-seeded — the admin enters its data manually
// through the normal admin ledger page, exactly like any real client.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_CLIENT = {
  code: "DEMO-CH01",
  name: "Mami Sarah (Demo)",
  email: "demo.channel@dearmanagement-channel.invalid",
  phone: "080000000002",
};

async function main() {
  const client = await prisma.clientAccount.upsert({
    where: { code: DEMO_CLIENT.code },
    update: { name: DEMO_CLIENT.name, email: DEMO_CLIENT.email, phone: DEMO_CLIENT.phone, status: "AKTIF" },
    create: { ...DEMO_CLIENT, status: "AKTIF" },
  });

  console.log(`[ensure-demo-client] ready: ${client.code}`);
}

main()
  .catch((e) => {
    console.error("[ensure-demo-client] failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
