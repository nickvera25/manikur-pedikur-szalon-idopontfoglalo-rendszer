## 1. Szükségletek

* Node.js
* NPM
* XAMPP (MySQL)
* Visual Studio Code

## 2. Telepítés és Futtatás

### 2.1. Adatbázis előkészítése
1. Nyissa meg a XAMPP vezérlőpultját.
2. Indítsa el a MySQL modult.
3. A phpMyAdmin felületén hozzon létre egy új adatbázist `manikur_pedikur_szalon` néven.

### 2.2. Alkalmazás telepítése
Töltse le a projektet, nyissa meg Visual Studio Code-ban, majd a terminálban futtassa:

npm install

### 2.3. Környezeti változók (.env)
A projekt gyökérmappájában hozzon létre egy fájlt `.env` néven, és másolja bele az alábbi három sort pontosan így, külön sorokba:

PORT=3000
DATABASE_URL="mysql://root:@localhost:3306/manikur_pedikur_szalon"
JWT_SECRET="valami_nagyon_hosszu_es_veletlenszeru_szoveg_12345"

### 2.4. Adatbázis sémák betöltése
A terminálban futtassa az alábbi parancsot a táblák létrehozásához:

npx prisma db push

## 3. Elérés és Használat

A szerver indítása a terminálban:

node server.js

A weboldal a böngészőben a következő címen érhető el:
http://localhost:3000