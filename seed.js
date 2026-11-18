//seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Feltöltés megkezdése...');

  //Szerepkörök létrehozása
  const role1 = await prisma.szerepkorok.create({ data: { szerepkor_nev: 'Admin' } });
  const role2 = await prisma.szerepkorok.create({ data: { szerepkor_nev: 'Alkalmazott' } });
  const role3 = await prisma.szerepkorok.create({ data: { szerepkor_nev: 'Vendég' } });

  //Foglalás státuszok
  await prisma.foglalas_statuszok.createMany({
    data: [
      { statusz_neve: 'Jóváhagyva' },
      { statusz_neve: 'Teljesítve' },
      { statusz_neve: 'Lemondva' },
      { statusz_neve: 'Nem jelent meg' }
    ]
  });

  //Kategóriák
  const kat1 = await prisma.kategoriak.create({ data: { kategoria_neve: 'Manikűr' } });
  const kat2 = await prisma.kategoriak.create({ data: { kategoria_neve: 'Pedikűr' } });

  //Szolgáltatások
  const szolg1 = await prisma.szolgaltatasok.create({
    data: { kategoria_id: kat1.kategoria_id, szolgaltatas_neve: 'Gél lakk', leiras: 'Tartós gél lakk', ar: 6000, idotartam_perc: 60 }
  });
  const szolg2 = await prisma.szolgaltatasok.create({
    data: { kategoria_id: kat1.kategoria_id, szolgaltatas_neve: 'Műköröm építés', leiras: 'Zselés építés', ar: 9000, idotartam_perc: 120 }
  });

  //Alkalmazott létrehozása
  const hashedJelszo = await bcrypt.hash('jelszo123', 10);
  const vera = await prisma.felhasznalok.create({
    data: {
      vezeteknev: 'Kovács',
      keresztnev: 'Vera',
      email: 'vera@szalon.hu',
      jelszo: hashedJelszo,
      telefon: '+36301234567'
    }
  });

  // Jogosultságának beállítása
  await prisma.felhasznalo_szerepkor.create({
    data: { felhasznalo_id: vera.felhasznalo_id, szerepkor_id: role2.szerepkor_id }
  });

  //Alkalmazott összekötése a szolgáltatásokkal
  await prisma.alkalmazott_szolgaltatasok.create({
    data: { alkalmazott_id: vera.felhasznalo_id, szolgaltatas_id: szolg1.szolgaltatas_id }
  });
  await prisma.alkalmazott_szolgaltatasok.create({
    data: { alkalmazott_id: vera.felhasznalo_id, szolgaltatas_id: szolg2.szolgaltatas_id }
  });

  console.log('Adatbázis sikeresen feltöltve tesztadatokkal!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });