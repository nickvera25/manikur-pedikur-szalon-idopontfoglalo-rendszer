// backend/services/emailService.js
const nodemailer = require('nodemailer');
const dayjs = require('dayjs');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Közös HTML sablonkeret
const wrapEmail = (title, content) => `
    <div style="background-color: #FEF9F9; font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #4F4646;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #FFFFFF; border: 1.5px solid #4F4646; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background-color: #F0B4B4; padding: 25px; text-align: center; border-bottom: 1.5px solid #4F4646;">
                <h1 style="margin: 0; color: #4F4646; font-size: 24px; font-weight: bold; letter-spacing: 1px;">NAILS BY VERA</h1>
                <p style="margin: 5px 0 0 0; color: #4F4646; font-size: 13px;">Professzionális Körömápolás & Manikűr</p>
            </div>
            <div style="padding: 30px; font-size: 15px; line-height: 1.6;">
                <h2 style="color: #4F4646; font-size: 18px; margin-top: 0; border-bottom: 1px dashed #EBDCDC; padding-bottom: 10px;">${title}</h2>
                ${content}
            </div>
            <div style="background-color: #EBDCDC; padding: 15px; text-align: center; font-size: 12px; color: #4F4646; border-top: 1px solid #4F4646;">
                <p style="margin: 0;">Nails by Vera Szalon • 9022 Győr, Fő tér 1.</p>
                <p style="margin: 4px 0 0 0;">Kérdés esetén válaszolj erre az e-mailre!</p>
            </div>
        </div>
    </div>
`;

const emailService = {
    // 1. FOGLALÁS VISSZAIGAZOLÁSA
    sendBookingConfirmation: async (toEmail, details) => {
        const content = `
            <p>Kedves <strong>${details.vendegNev}</strong>!</p>
            <p>Köszönjük a foglalásodat! Időpontodat sikeresen rögzítettük rendszerünkben.</p>
            
            <div style="background-color: #EBDCDC; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #4F4646;">
                <p style="margin: 4px 0;">💅 <strong>Kezelés:</strong> ${details.szolgaltatasNev}</p>
                <p style="margin: 4px 0;">📅 <strong>Időpont:</strong> ${dayjs(details.idopont).format('YYYY. MMMM D. (dddd) HH:mm')}</p>
                <p style="margin: 4px 0;">👤 <strong>Kezelő szakember:</strong> ${details.alkalmazottNev}</p>
                <p style="margin: 4px 0;">💰 <strong>Várható összeg:</strong> ${Number(details.ar).toLocaleString('hu-HU')} Ft</p>
            </div>

            <p style="font-size: 13px; color: #555;">
                📌 <em>Emlékeztető: Időpontodat a kezelés előtt legkésőbb 24 órával tudod díjmentesen lemondani a weboldalon a saját profilodban.</em>
            </p>
        `;
        return transporter.sendMail({
            from: `"Nails by Vera" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Foglalás visszaigazolása - Nails by Vera',
            html: wrapEmail('Időpontfoglalásod megerősítve', content)
        });
    },

    // 2. ELFELEJTETT JELSZÓ
    sendPasswordReset: async (toEmail, resetToken) => {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        const content = `
            <p>Kedves Vendégünk!</p>
            <p>Kérést kaptunk a fiókod jelszavának visszaállítására. Az alábbi gombra kattintva megadhatsz egy új jelszót:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #4F4646; color: #F0B4B4; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Új jelszó megadása
                </a>
            </div>

            <p style="font-size: 13px; color: #777;">
                Ha nem te kérted a jelszó visszaállítását, kérjük, hagyd figyelmen kívül ezt a levelet! A link 1 órán keresztül érvényes.
            </p>
        `;
        return transporter.sendMail({
            from: `"Nails by Vera" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Jelszó visszaállítása - Nails by Vera',
            html: wrapEmail('Új jelszó kérése', content)
        });
    },

    // 3. IDŐPONT LEMONDÁSA
    sendCancellation: async (toEmail, details) => {
        const content = `
            <p>Kedves <strong>${details.vendegNev}</strong>!</p>
            <p>Tájékoztatunk, hogy a következő időpont törlésre került a naptárunkból:</p>
            
            <div style="background-color: #FEF9F9; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #4F4646;">
                <p style="margin: 4px 0;">💅 <strong>Szolgáltatás:</strong> ${details.szolgaltatasNev}</p>
                <p style="margin: 4px 0;">📅 <strong>Törölt időpont:</strong> ${dayjs(details.idopont).format('YYYY. MMMM D. HH:mm')}</p>
                <p style="margin: 4px 0;"><strong>Indok / Megjegyzés:</strong> ${details.indok || 'Időpont törölve.'}</p>
            </div>

            <p>Bármikor szívesen látunk újra! Új időpontot a weboldalon tudsz foglalni.</p>
        `;
        return transporter.sendMail({
            from: `"Nails by Vera" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Időpont törölve - Nails by Vera',
            html: wrapEmail('Időpont lemondása', content)
        });
    },

    // 4. VÁRÓLISTA ÉRTESÍTŐ
    sendWaitlistNotification: async (toEmail, details) => {
        const bookingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/foglalas`;
        const content = `
            <p>Kedves Vendégünk!</p>
            <p>Jó hírünk van! Egy vendég lemondta az időpontját, így <strong>felszabadult egy hely</strong> arra a napra, amire feliratkoztál a várólistára:</p>
            
            <div style="background-color: #F0B4B4; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #4F4646; font-weight: bold;">
                📅 Felszabadult nap: ${dayjs(details.datum).format('YYYY. MMMM D. (dddd)')}
            </div>

            <p>Mivel a helyek gyorsan betelnek, érdemes minél előbb lecsapnod rá!</p>

            <div style="text-align: center; margin: 25px 0;">
                <a href="${bookingUrl}" style="background-color: #4F4646; color: #F0B4B4; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Időpont lefoglalása most
                </a>
            </div>
        `;
        return transporter.sendMail({
            from: `"Nails by Vera" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Felszabadult időpont! - Nails by Vera Várólista',
            html: wrapEmail('Hely szabadult fel!', content)
        });
    },

    // 5. 24 ÓRÁS AUTOMATIKUS IDŐPONT-EMLÉKEZTETŐ
    sendReminder: async (toEmail, details) => {
        const content = `
            <p>Kedves <strong>${details.vendegNev}</strong>!</p>
            <p>Szeretettel emlékeztetünk, hogy <strong>holnap időpontod van</strong> a Nails by Vera szalonban!</p>
            
            <div style="background-color: #EBDCDC; border-radius: 8px; padding: 15px; margin: 20px 0; border: 1px solid #4F4646;">
                <p style="margin: 4px 0;">💅 <strong>Kezelés:</strong> ${details.szolgaltatasNev}</p>
                <p style="margin: 4px 0;">📅 <strong>Kezdés időpontja:</strong> ${dayjs(details.idopont).format('YYYY. MMMM D. (dddd) HH:mm')}</p>
                <p style="margin: 4px 0;">👤 <strong>Kezelő szakember:</strong> ${details.alkalmazottNev}</p>
                <p style="margin: 4px 0;">📍 <strong>Helyszín:</strong> 9022 Győr, Fő tér 1.</p>
            </div>

            <p style="font-size: 13px; color: #555;">
                📌 <em>Kérjük, érkezz pontosan és kísérő nélkül, hogy a kezelést zavartalanul el tudjuk végezni!</em>
            </p>
        `;
        return transporter.sendMail({
            from: `"Nails by Vera" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: 'Emlékeztető holnapi időpontodról - Nails by Vera',
            html: wrapEmail('Holnapi időpont emlékeztető', content)
        });
    }
};

module.exports = emailService;