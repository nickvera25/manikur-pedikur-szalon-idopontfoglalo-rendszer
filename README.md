# Nails by Vera - Manikűr és Pedikűr Szalon Időpontfoglaló Rendszer

Full-stack webes időpontfoglaló és szalonadminisztrációs alkalmazás modern technológiákra építve (Node.js, Express, React, Prisma ORM, MySQL).

---

## 1. Rendszerkövetelmények és Előfeltételek

A rendszer futtatásához az alábbi szoftverek szükségesek:
* Node.js (v18 vagy újabb ajánlott) és npm csomagkezelő
* XAMPP (vagy egyéb MySQL adatbázis-kiszolgáló)
* Egy modern webböngésző (Google Chrome, Mozilla Firefox, Microsoft Edge)
* Tetszőleges kódszerkesztő (pl. Visual Studio Code)

---

## 2. Telepítés és Beállítás Lépésről Lépésre

### 2.1. Adatbázis előkészítése
1. Indítsa el a XAMPP Control Panel alkalmazást.
2. Indítsa el az Apache és a MySQL modulokat a „Start” gombokkal.
3. Nyissa meg a böngészőben a phpMyAdmin felületét: http://localhost/phpmyadmin
4. Hozzon létre egy új adatbázist a következő néven: `manikur_pedikur_szalon` (ajánlott illesztés: utf8mb4_hungarian_ci vagy utf8mb4_general_ci).

### 2.2. Függőségek telepítése
A projekt két részből (backend szerver és React frontend kliens) áll. Nyisson egy terminált a projekt gyökérmappájában, és futtassa a parancsokat:

```bash
# 1. Backend függőségek telepítése (gyökérkönyvtárban)
npm install

# 2. Frontend függőségek telepítése
cd frontend
npm install
cd ..
```

### 2.3. Környezeti változók (.env) beállítása
A projekt gyökérmappájában hozzon létre egy `.env` nevű fájlt, és másolja bele az alábbi sorokat:

```env
PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/manikur_pedikur_szalon"
JWT_SECRET="szalon_nagyon_biztonsagos_titkos_kulcs_2026"

# E-mail értesítésekhez (Nodemailer tesztadatok)
SMTP_USER="teszt@pelda.hu"
SMTP_PASS="titkosjelszo"
```

*(Megjegyzés: Ha a helyi MySQL adatbázis root felhasználója jelszóval védett, a `DATABASE_URL`-ben a `root:` után adja meg a jelszót!)*

### 2.4. Adatbázis táblák létrehozása
A táblák és a kapcsolatok automatikus felépítéséhez futtassa a Prisma szinkronizálást a gyökérkönyvtárban:

```bash
npx prisma db push
```

### 2.5. Kezdő adatok feltöltése (seed.js)
Az induláshoz szükséges alapvető szerepkörök (Admin, Alkalmazott, Vendég), foglalási státuszok, kategóriák, szolgáltatások, valamint a teszt szakember fiók létrehozásához a gyökérmappában (vagy a backend mappában) található `seed.js` fájl szolgál.

Ha a fájl nem áll rendelkezésre, hozza létre `seed.js` néven az alábbi tartalommal:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Feltöltés megkezdése...');

  // 1. Szerepkörök létrehozása
  const role1 = await prisma.szerepkorok.create({ data: { szerepkor_nev: 'Admin' } });
  const role2 = await prisma.szerepkorok.create({ data: { szerepkor_nev: 'Alkalmazott' } });
  const role3 = await prisma.szerepkorok.create({ data: { szerepkor_nev: 'Vendég' } });

  // 2. Foglalás státuszok
  await prisma.foglalas_statuszok.createMany({
    data: [
      { statusz_neve: 'Jóváhagyva' },
      { statusz_neve: 'Teljesítve' },
      { statusz_neve: 'Lemondva' }
    ]
  });

  // 3. Kategóriák
  const kat1 = await prisma.kategoriak.create({ data: { kategoria_neve: 'Manikűr' } });
  const kat2 = await prisma.kategoriak.create({ data: { kategoria_neve: 'Pedikűr' } });

  // 4. Szolgáltatások
  const szolg1 = await prisma.szolgaltatasok.create({
    data: { kategoria_id: kat1.kategoria_id, szolgaltatas_neve: 'Gél lakk', leiras: 'Tartós gél lakk', ar: 6000, idotartam_perc: 60 }
  });
  const szolg2 = await prisma.szolgaltatasok.create({
    data: { kategoria_id: kat1.kategoria_id, szolgaltatas_neve: 'Műköröm építés', leiras: 'Zselés építés', ar: 9000, idotartam_perc: 120 }
  });

  // 5. Teszt Szakember (Vera) létrehozása
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

  // Vera jogosultságának beállítása (Alkalmazott)
  await prisma.felhasznalo_szerepkor.create({
    data: { felhasznalo_id: vera.felhasznalo_id, szerepkor_id: role2.szerepkor_id }
  });

  // 6. Vera összekötése a szolgáltatásokkal
  await prisma.alkalmazott_szolgaltatasok.create({
    data: { alkalmazott_id: vera.felhasznalo_id, szolgaltatas_id: szolg1.szolgaltatas_id }
  });
  await prisma.alkalmazott_szolgaltatasok.create({
    data: { alkalmazott_id: vera.felhasznalo_id, szolgaltatas_id: szolg2.szolgaltatas_id }
  });

  console.log('✅ Adatbázis sikeresen feltöltve tesztadatokkal!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

A seed script futtatása a terminálban:

```bash
node seed.js
```
*(Ha a script a backend almappában található: `node backend/seed.js`)*

Sikeres futás esetén a terminálban megjelenik:  
`✅ Adatbázis sikeresen feltöltve tesztadatokkal!`

---

## 3. Az Alkalmazás Indítása és Futtatása

A teljes rendszer használatához mind a háttérkiszolgálót, mind a felhasználói felületet el kell indítani:

### 1. Lépés: Backend szerver indítása
Nyisson egy terminált a gyökérkönyvtárban:

```bash
node server.js
```
*A backend kiszolgáló és az API a `http://localhost:3000` címen fog futni.*

### 2. Lépés: Frontend kliens indítása
Nyisson egy **másik** terminálablakot, lépjen a `frontend` mappába, majd indítsa el a React alkalmazást:

```bash
cd frontend
npm start
```
*A felhasználói felület automatikusan megnyílik a böngészőben.*

---

## 4. Teszt Felhasználói Fiókok

A rendszer funkcióinak kipróbálásához az alábbi tesztfiókok használhatók:

* **Alkalmazott (Szakember):**
  - E-mail cím: `vera@szalon.hu`
  - Jelszó: `jelszo123`
  - Funkciók: Saját naptár (napi, heti, havi nézet), munkaidő és állandó munkarend beállítása, szabadságok rögzítése, referenciafotó feltöltése a nyilvános galériába.

* **Vendég (Ügyfél):**
  - Szabadon regisztrálható a bejelentkező felületen a **„Regisztrálj itt!”** gombra kattintva tetszőleges adatokkal (időpontfoglalás, várólista, saját és korábbi foglalások áttekintése és lemondása).

* **Adminisztrátor:**
  - Közvetlenül az adatbázisban felvitt fiók.
  - Funkciók: Teljes felügyelet: a szalon összesített naptára dolgozói szűrővel, alkalmazottak és szolgáltatások kezelése, új kategóriák rögzítése, forgalmi és vendégmegbízhatósági statisztikák megtekintése.

---

## 5. Főbb Rendszerfunkciók

* **Szerepkör-alapú jogosultságkezelés:** Három különálló szint (Vendég, Alkalmazott, Adminisztrátor) egyedi felületekkel és menürendszerrel.
* **Biztonságos hitelesítés:** Állapotmentes JSON Web Token (JWT) munkamenet-kezelés és bcrypt jelszóhashelés.
* **Ütközésmentes időpontfoglalás:** Dinamikus szabad idősáv kalkuláció a dolgozó heti munkarendje, távollétei és a választott szolgáltatás időtartama alapján.
* **Várólista modul:** Betelt napok esetén a vendégek feliratkozhatnak a kívánt idősávra, és lemondás esetén a rendszer automatikus e-mailt küld nekik.
* **Automatikus háttérfolyamatok:** Időzített feladatok (node-cron) a napi 24 órás emlékeztetők kiküldésére Nodemailer segítségével.