// backend/make-admin.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@szalon.hu';

  const user = await prisma.felhasznalok.findUnique({
    where: { email: adminEmail }
  });

  if (!user) {
    return console.log(`Nem találom ezt a felhasználót: ${adminEmail}. Biztos regisztráltál?`);
  }

  let adminRole = await prisma.szerepkorok.findFirst({
    where: { szerepkor_nev: 'Admin' }
  });

  if (!adminRole) {
    adminRole = await prisma.szerepkorok.create({
      data: { szerepkor_nev: 'Admin' }
    });
  }

  await prisma.felhasznalo_szerepkor.updateMany({
    where: { felhasznalo_id: user.felhasznalo_id },
    data: { szerepkor_id: adminRole.szerepkor_id }
  });

  console.log(` Kész! A ${adminEmail} fiók mostantól admin jogosultsággal rendelkezik.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());