// src/pages/CookiePolicy.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  return (
    <div className="container mt-4 mt-md-5 mb-5 d-flex justify-content-center px-2 px-sm-3">
      
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm animate-fade-up" style={{ maxWidth: '1000px' }}>
        
        {/* Fejléc */}
        <div className="text-center mb-4">
          <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)', letterSpacing: '0.5px' }}>
            COOKIE (SÜTI) TÁJÉKOZTATÓ
          </h1>
          <p className="lead m-0 fw-semibold text-salon">
            Nails by Vera – Átlátható és biztonságos adatkezelés
          </p>
        </div>

        <hr className="salon-divider my-4" style={{ opacity: 0.2 }} />

        {/* Hatály */}
        <div className="card-white p-4 mb-4 shadow-sm card-hover-effect">
          <h3 className="fw-bold fs-5 mb-3 text-salon">1. A tájékoztató hatálya</h3>
          <p className="m-0" style={{ lineHeight: '1.7' }}>
            Jelen tájékoztató a <strong>Nick Veronika e.v.</strong> (székhely: 9026 Győr, Egyetem tér 1., nyilvántartási szám: 54981234, adószám: 68912345-1-28, a továbbiakban: <em>Üzemeltető</em>) által üzemeltetett <strong>Nails by Vera</strong> online időpontfoglaló weboldalra és annak kliensoldali adatkezelésére vonatkozik.
          </p>
        </div>

        {/* Mik azok a sütik? */}
        <div className="card-white p-4 mb-4 shadow-sm card-hover-effect">
          <h3 className="fw-bold fs-5 mb-3 text-salon">2. Mik azok a sütik és a helyi tárolók (Local Storage)?</h3>
          <p className="mb-2" style={{ lineHeight: '1.7' }}>
            Amikor meglátogatja weboldalunkat, a böngészője kisméretű adatfájlokat helyez el az eszközén. Weboldalunkon <strong>kizárólag az oldal működéséhez feltétlenül szükséges és munkamenet-támogató</strong> adatokat alkalmazunk.
          </p>
          <p className="m-0" style={{ lineHeight: '1.7' }}>
            Weboldalunk <strong>nem alkalmaz statisztikai, hirdetési vagy marketing célú nyomkövető sütiket</strong> Így a felhasználók böngészési szokásait nem rögzítjük, és harmadik félnek nem továbbítunk profilalkotásra alkalmas információkat.
          </p>
        </div>

        {/*A tárolt adatok típusai és célja */}
        <div className="card-white p-4 mb-4 shadow-sm card-hover-effect">
          <h3 className="fw-bold fs-5 mb-3 text-salon">3. Az alkalmazott adatok típusai és célja</h3>
          
          <h6 className="fw-bold text-salon mt-3">A) Munkamenet-azonosító (JWT Token)</h6>
          <p className="small mb-3" style={{ lineHeight: '1.6' }}>
            A bejelentkezett felhasználók azonosítására és a jogosultságok ellenőrzésére szolgál. Nélküle a felhasználó minden oldalváltáskor kijelentkezne, és nem tudna online időpontot foglalni, módosítani vagy megtekinteni a naptárat.
          </p>

          <h6 className="fw-bold text-salon">B) Használatot támogató kényelmi beállítások</h6>
          <p className="small m-0" style={{ lineHeight: '1.6' }}>
            Ezek a beállítások rögzítik például azt a tényt, hogy a látogató a tájékoztató sávban elfogadta a funkcionális tárolást, így a következő látogatás vagy aloldal megnyitásakor a sáv már nem jelenik meg feleslegesen.
          </p>
        </div>

        {/*Biztonság */}
        <div className="card-white p-4 mb-4 shadow-sm card-hover-effect">
          <h3 className="fw-bold fs-5 mb-3 text-salon">4. Biztonság</h3>
          <p className="m-0" style={{ lineHeight: '1.7' }}>
            Az Üzemeltető a böngésző tárolójában semmilyen körülmények között <strong>nem tárol jelszavakat nyílt szöveges formában</strong>. A bejelentkezési munkamenet egy kriptográfiailag aláírt, titkosított tokennel történik, amelyet a kiszolgáló biztonsági rétege minden kérésnél külön hitelesít.
          </p>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="btn btn-dark px-5 py-3 fs-5 shadow-sm">
            VISSZA A KEZDŐLAPRA
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CookiePolicy;