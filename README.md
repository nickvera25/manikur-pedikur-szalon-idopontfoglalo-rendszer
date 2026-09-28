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

# Backend függőségek telepítése (gyökérkönyvtárban)
npm install

# Frontend függőségek telepítése
cd frontend
npm install
cd ..

### 2.3. Környezeti változók (.env) beállítása
A projekt gyökérmappájában hozzon létre egy `.env` nevű fájlt, és másolja bele a következő sorokat:

PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/manikur_pedikur_szalon"
JWT_SECRET="szalon_nagyon_biztonsagos_titkos_kulcs_2026"

# E-mail értesítésekhez (Nodemailer tesztadatok)
SMTP_USER="teszt@pelda.hu"
SMTP_PASS="titkosjelszo"

(Megjegyzés: Ha a helyi MySQL adatbázis jelszóval védett, a DATABASE_URL-ben a root: után adja meg a jelszót!)

### 2.4. Adatbázis táblák létrehozása
A táblák és kapcsolatok automatikus felépítéséhez futtassa a Prisma szinkronizálást a gyökérkönyvtárban:

npx prisma db push

### 2.5. Kezdő adatok feltöltése (Seedelés)
Az induláshoz szükséges alapvető szerepkörök (Admin, Alkalmazott, Vendég), foglalási státuszok, kategóriák, szolgáltatások, valamint a teszt szakember fiók létrehozásához futtassa az adatbázis-feltöltő scriptet:

node seed.js

(Amennyiben a script a backend almappában található: node backend/seed.js)

A sikeres lefutást a terminálban a következő üzenet jelzi:
Adatbázis sikeresen feltöltve tesztadatokkal!

---

## 3. Az Alkalmazás Indítása és Futtatása

A teljes rendszer használatához mind a háttérkiszolgálót, mind a felhasználói felületet el kell indítani:

### 1. Lépés: Backend szerver indítása
Nyisson egy terminált a projekt gyökérmappájában:

node server.js

A backend kiszolgáló és az API a http://localhost:3000 címen lesz elérhető.

### 2. Lépés: Frontend kliens indítása
Nyisson egy másik terminálablakot, lépjen be a frontend mappába, majd indítsa el a React alkalmazást:

cd frontend
npm start

A felhasználói felület automatikusan megnyílik az alapértelmezett böngészőben.

---

## 4. Teszt Felhasználói Fiókok

A bírálat és a funkcionalitások kipróbálásának megkönnyítéséhez az alábbi tesztfiókok használhatók:

* Alkalmazott (Szakember):
  - E-mail cím: vera@szalon.hu
  - Jelszó: jelszo123
  - Funkciók: Saját naptár (napi, heti, havi nézet), munkaidő és munkarend beállítása, szabadságok rögzítése, referenciafotó feltöltése a galériába.

* Vendég (Ügyfél):
  - Szabadon regisztrálható a bejelentkező felületen található „Regisztrálj itt!” hivatkozásra kattintva tetszőleges adatokkal (időpontfoglalás, várólista, saját és korábbi foglalások megtekintése/lemondása).

* Adminisztrátor:
  - Közvetlenül az adatbázisban felvitt fiók.
  - Funkciók: Teljes körű jogosultság: összesített szalon naptár, szakemberek és szolgáltatások kezelése, kategóriák karbantartása, forgalmi statisztikák.

---

## 5. Főbb Rendszerfunkciók

* Szerepkör-alapú jogosultságkezelés: Három különálló szint (Vendég, Alkalmazott, Adminisztrátor) elkülönített felületekkel és menürendszerrel.
* Állapotmentes hitelesítés: Biztonságos belépés JSON Web Token (JWT) és bcrypt jelszótitkosítás segítségével.
* Ütközésmentes időpontfoglalás: Dinamikus szabad idősáv kalkuláció a dolgozó heti munkarendje, szabadságai és a kezelések időtartama alapján.
* Várólista modul: Betelt napok esetén a vendégek feliratkozhatnak az adott idősávra, és lemondáskor a rendszer értesítést küld a megüresedett helyről.
* Automatikus háttérfolyamatok: Időzített feladatok (node-cron) a 24 órával korábbi emlékeztetők kiküldésére Nodemailer segítségével.