const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. ÖSSZES SZOLGÁLTATÁS LEKÉRÉSE
router.get('/services', async (req, res) => {
    try {
        const services = await prisma.szolgaltatasok.findMany({
            orderBy: { szolgaltatas_neve: 'asc' } // <--- EZ VOLT A HIBA, JAVÍTVA!
        });
        res.json({ success: true, data: services });
    } catch (error) {
        console.error("Hiba a szolgáltatások lekérésekor:", error);
        res.status(500).json({ success: false, message: "Szerverhiba történt." });
    }
});

// 1.5 KATEGÓRIÁK LEKÉRÉSE
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma.kategoriak.findMany();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error("Hiba a kategóriák lekérésekor:", error); // <-- Látni fogjuk a terminálban
        res.status(500).json({ success: false, message: "Nem sikerült betölteni a kategóriákat." });
    }
});

// 1.6 ÚJ KATEGÓRIA LÉTREHOZÁSA
router.post('/categories', async (req, res) => {
    const { nev } = req.body;
    if (!nev) return res.status(400).json({ success: false, message: "Kategória neve kötelező!" });

    try {
        const newCat = await prisma.kategoriak.create({ 
            data: { kategoria_neve: nev } 
        });
        res.json({ success: true, data: newCat });
    } catch (error) {
        console.error("Hiba kategória mentésekor (részletes):", error); // <-- Itt kiírja a hibát
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. ÚJ SZOLGÁLTATÁS HOZZÁADÁSA
router.post('/services', async (req, res) => {
    const { nev, ar, idotartam, kategoria_id, leiras } = req.body;
    if (!nev || !ar || !idotartam) return res.status(400).json({ success: false, message: "Név, ár és időtartam kötelező!" });

    try {
        const newService = await prisma.szolgaltatasok.create({
            data: {
                szolgaltatas_neve: nev,
                ar: parseInt(ar),
                idotartam_perc: parseInt(idotartam),
                leiras: leiras || "",
                kategoria_id: kategoria_id ? parseInt(kategoria_id) : 1 
            }
        });
        res.json({ success: true, message: "Szolgáltatás sikeresen hozzáadva!", data: newService });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hiba történt a mentés során." });
    }
});

// 3. SZOLGÁLTATÁS MÓDOSÍTÁSA (PUT)
router.put('/services/:id', async (req, res) => {
    const { id } = req.params;
    const { nev, ar, idotartam, kategoria_id, leiras } = req.body;

    try {
        const updatedService = await prisma.szolgaltatasok.update({
            where: { szolgaltatas_id: parseInt(id) },
            data: {
                szolgaltatas_neve: nev,
                ar: parseInt(ar),
                idotartam_perc: parseInt(idotartam),
                leiras: leiras || "",
                kategoria_id: kategoria_id ? parseInt(kategoria_id) : undefined 
            }
        });
        res.json({ success: true, message: "Szolgáltatás módosítva!", data: updatedService });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hiba a módosítás során." });
    }
});

// 4. SZOLGÁLTATÁS TÖRLÉSE
// 4. SZOLGÁLTATÁS TÖRLÉSE (Védett logika)
router.delete('/services/:id', async (req, res) => {
    const { id } = req.params;
    const serviceId = parseInt(id);

    try {
        // 1. Ellenőrizzük, van-e rá már foglalás
        const bookingCount = await prisma.foglalasok.count({
            where: { szolgaltatas_id: serviceId }
        });

        if (bookingCount > 0) {
            return res.status(400).json({
                success: false,
                message: `A szolgáltatás nem törölhető, mert még ${bookingCount} db foglalás kapcsolódik hozzá!`
            });
        }

        // 2. Eltávolítjuk a kapcsolótáblákból (dolgozók hozzárendelései, várólista)
        await prisma.alkalmazott_szolgaltatasok.deleteMany({
            where: { szolgaltatas_id: serviceId }
        });

        await prisma.varolista.deleteMany({
            where: { szolgaltatas_id: serviceId }
        });

        // 3. Töröljük magát a szolgáltatást
        await prisma.szolgaltatasok.delete({
            where: { szolgaltatas_id: serviceId }
        });

        res.json({ success: true, message: "Szolgáltatás sikeresen törölve!" });
    } catch (error) {
        console.error("Hiba a szolgáltatás törlésekor:", error); // Most már kiírja a terminálba, ha bármi gond van
        res.status(500).json({ success: false, message: "Hiba történt a törlés során az adatbázisban." });
    }
});

// 1.7 KATEGÓRIA TÖRLÉSE (Csak ha üres)
router.delete('/categories/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const kategoriaId = parseInt(id);

        // Megszámoljuk, hány szolgáltatás tartozik ehhez a kategóriához
        const serviceCount = await prisma.szolgaltatasok.count({
            where: { kategoria_id: kategoriaId }
        });

        // Ha nem üres, tiltjuk a törlést
        if (serviceCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `A kategória nem törölhető, mert még ${serviceCount} darab szolgáltatás tartozik hozzá!` 
            });
        }

        // Ha üres, törölhetjük
        await prisma.kategoriak.delete({
            where: { kategoria_id: kategoriaId }
        });

        res.json({ success: true, message: "Kategória sikeresen törölve!" });
    } catch (error) {
        console.error("Hiba kategória törlésekor:", error);
        res.status(500).json({ success: false, message: "Hiba történt a törlés során." });
    }
});

module.exports = router;