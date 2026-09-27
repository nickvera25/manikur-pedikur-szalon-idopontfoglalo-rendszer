// backend/make-admin.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@szalon.hu'; // Írd át erre az emailre, amivel az előbb regisztráltál!

  // 1. Megkeressük az imént regisztrált felhasználót
  const user = await prisma.felhasznalok.findUnique({
    where: { email: adminEmail }
  });

  if (!user) {
    return console.log(`Nem találom ezt a felhasználót: ${adminEmail}. Biztos regisztráltál?`);
  }

  // 2. Megkeressük az "Admin" szerepkört
  let adminRole = await prisma.szerepkorok.findFirst({
    where: { szerepkor_nev: 'Admin' }
  });

  // Ha véletlenül még nem létezne az Admin szerepkör, létrehozzuk
  if (!adminRole) {
    adminRole = await prisma.szerepkorok.create({
      data: { szerepkor_nev: 'Admin' }
    });
  }

  // 3. Felülírjuk a jogosultságát a kapcsolótáblában (Vendégről -> Adminra)
  await prisma.felhasznalo_szerepkor.updateMany({
    where: { felhasznalo_id: user.felhasznalo_id },
    data: { szerepkor_id: adminRole.szerepkor_id }
  });

  console.log(`✅ Kész! A ${adminEmail} fiók mostantól ADMIN jogosultsággal rendelkezik.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());