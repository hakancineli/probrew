import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@probrew.com.tr';
  const password = 'probrew-admin-2026';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.systemAdmin.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      name: 'ProBrew Super Admin',
      email,
      passwordHash: hashedPassword,
    },
  });

  console.log('Super Admin created:', admin.email);
  console.log('Password set to:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
