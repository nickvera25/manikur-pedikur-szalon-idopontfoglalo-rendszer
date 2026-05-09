## 1. Szükségletek

A projekt futtatásához az alábbi környezet és szoftverek telepítése szükséges:
* Node.js (v18 vagy újabb): https://nodejs.org/en
* NPM (Node Package Manager - a Node.js beépített eleme)
* XAMPP (vagy más MySQL adatbázis szerver): https://www.apachefriends.org/hu/index.html
* Visual Studio Code: https://code.visualstudio.com/

## 2. Telepítés és Futtatás

### 2.1. Adatbázis előkészítése
1. Nyissa meg a XAMPP vezérlőpultját rendszergazdaként.
2. Indítsa el a MySQL modult.
3. A phpMyAdmin felületén (vagy parancssorból) hozzon létre egy új, üres adatbázist, például nailsbyvera néven.

### 2.2. Alkalmazás telepítése
Töltse le a projektet a GitHubról, majd nyissa meg a mappát a Visual Studio Code-ban. Nyisson egy terminált, és futtassa az alábbi parancsot a szükséges modulok letöltéséhez:

npm install

### 2.3. Környezeti változók (.env) beállítása
A projekt gyökérmappájában hozzon létre egy fájlt .env néven. Másolja be az alábbi adatokat, és módosítsa az adatbázis nevét, illetve jelszavát a saját helyi (XAMPP) beállításainak megfelelően:

PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/manikur_pedikur_szalon"
JWT_SECRET="valami_nagyon_hosszu_es_veletlenszeru_szoveg_12345"

(Megjegyzés: A XAMPP alapértelmezett MySQL felhasználóneve root, jelszava pedig üres.)

### 2.4. Adatbázis sémák betöltése
Miután a .env fájl be van állítva, futtassa az alábbi parancsot. Ezzel a Prisma automatikusan létrehozza a szükséges táblákat a MySQL adatbázisban:

npx prisma db push

## 3. Elérés és Használat

A telepítés és az adatbázis beállítása után indítsa el a szervert a terminálban:

node server.js

Használat:
1. Nyissa meg a böngészőjét, és lépjen a http://localhost:3000 címre.
2. Első lépésként a Regisztráció oldalon hozzon létre egy új felhasználót (a rendszer automatikusan a vendeg szerepkört rendeli hozzá).
3. A sikeres regisztráció után a főoldalon a Bejelentkezés funkcióval léphet be a rendszerbe.