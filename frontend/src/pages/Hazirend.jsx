// src/pages/Hazirend.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Hazirend = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const bookingLink = isLoggedIn ? '/foglalas' : '/login';

  return (
    <div className="container mt-5 mb-5 d-flex justify-content-center">
      
      {/* FŐ BEFOGLALÓ KÁRTYA */}
      <div className="card-pink p-4 p-md-5 w-100 shadow-sm" style={{ maxWidth: '1000px' }}>
        
        <div className="text-center mb-5">
          <h1 className="fw-bold mb-2" style={{ letterSpacing: '1px' }}>
            HÁZIREND
          </h1>
          <p className="lead m-0 fw-semibold">
            Nails by Vera – Kölcsönös tisztelet és minőség
          </p>
        </div>

        {/* 1. BLOKK: FIZETÉS */}
        <div className="card-white p-4 mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-3 mb-3">
            <i className="fa-solid fa-handshake-simple fa-2x"></i>
            <h3 className="fw-bold m-0 fs-5">
              Fizetés & Miért nem kérünk előleget?
            </h3>
          </div>
          <p className="m-0" style={{ lineHeight: '1.7' }}>
            Szalonunkban a foglalás <strong>előlegmentes</strong>, mert hiszünk a vendégeinkkel kialakított kölcsönös bizalomban és szeretnénk a foglalást a lehető leggyorsabbá tenni. 
            A szolgáltatás díja a helyszínen, a kezelés elkészülte után fizetendő készpénzben vagy azonnali banki átutalással. Cserébe kérjük, hogy a lefoglalt időpontokat és az alábbi szabályzatot te is vedd komolyan.
          </p>
        </div>

        {/* 2. BLOKK: LEMONDÁSI SZABÁLYZAT */}
        <div className="card-white p-4 mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-3 mb-3">
            <i className="fa-regular fa-clock fa-2x"></i>
            <h3 className="fw-bold m-0 fs-5">
              Lemondási feltételek & 24 órás szabályzat
            </h3>
          </div>
          <ul className="m-0 ps-3 d-flex flex-column gap-2" style={{ lineHeight: '1.6' }}>
            <li>
              <strong>Díjmentes lemondás:</strong> Időpontodat a kezdés előtt legkésőbb <strong>24 órával</strong> tudod díjmentesen lemondani vagy módosítani a weboldalon a saját profilodban.
            </li>
            <li>
              <strong>24 órán belüli lemondás:</strong> A rendszer a kezdést megelőző 24 órában biztonsági okokból már nem engedélyezi az online lemondást. Amennyiben az időpontot ezen a sávon belül mondod le, a szolgáltatás díjának <strong>50%-a</strong> felszámolásra kerül a következő alkalommal.
            </li>
            <li>
              <strong>Meg nem jelenés (No-show):</strong> Ha előzetes jelzés nélkül nem jelensz meg a lefoglalt időpontodon, újabb időpontot kizárólag az elmaradt kezelés <strong>100%-os</strong> megtérítését követően áll módunkban biztosítani.
            </li>
          </ul>
        </div>

        {/* 3. BLOKK: ÉRKEZÉS, KÉSÉS */}
        <div className="card-white p-4 mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-3 mb-3">
            <i className="fa-solid fa-person-walking-arrow-right fa-2x"></i>
            <h3 className="fw-bold m-0 fs-5">
              Érkezés, késés és kísérők
            </h3>
          </div>
          <ul className="m-0 ps-3 d-flex flex-column gap-2" style={{ lineHeight: '1.6' }}>
            <li>
              <strong>Kérlek, egyedül érkezz:</strong> Szalonunk a nyugodt relaxáció szigete, emellett a férőhelyeink száma is korlátozott. Kérünk, hogy kísérő (barátnő, párod, gyermek, kisállat) nélkül érkezz a kezelésre.
            </li>
            <li>
              <strong>Pontosság & Késés:</strong> Kérjük, pontosan érkezz! <strong>10–15 perc késés</strong> esetén már csak egyszerűbb, egyszínű szett készítésére van lehetőség, hogy a következő vendég kezdését ne csúsztassuk el.
            </li>
            <li>
              <strong>15 perc feletti késés:</strong> Sajnos a szolgáltatást már nem tudjuk elvégezni, és az időpont elveszettnek minősül.
            </li>
          </ul>
        </div>

        {/* 4. BLOKK: ETIKETT ÉS GARANCIA */}
        <div className="card-white p-4 mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-3 mb-3">
            <i className="fa-solid fa-shield-heart fa-2x"></i>
            <h3 className="fw-bold m-0 fs-5">
              Kezelés alatti etikett, egészség és garancia
            </h3>
          </div>
          <ul className="m-0 ps-3 d-flex flex-column gap-2" style={{ lineHeight: '1.6' }}>
            <li>
              <strong>Telefonhasználat:</strong> A fertőtlenített és előkészített körmök tartóssága érdekében kérjük, a kezelés közben mellőzd a telefonnyomkodást és az arc-/hajsimogatást, elkerülve a körömlemez zsírosodását.
            </li>
            <li>
              <strong>Egészség és betegség:</strong> Ha beteg vagy (láz, nátha, köhögés), kérünk, haladéktalanul jelezd felénk, és egyeztetünk új időpontot! Betegen kérlek ne látogasd a szalont a többi vendég és kollégáink egészségének védelmében.
            </li>
            <li>
              <strong>Garancia:</strong> Az elkészült géllakkra és műkörömre <strong>5 napos garanciát</strong> vállalunk rendeltetésszerű használat mellett (törés, felválás javítása díjmentes).
            </li>
          </ul>
        </div>

        {/* AUTOMATIKUS ELFOGADÁS DOBOZ */}
        <div className="card-powder p-3 rounded text-center mb-4" style={{ borderStyle: 'dashed' }}>
          <p className="m-0 fw-bold small">
            📌 Az online időpontfoglalás elküldésével a szalon Házirendje automatikusan elfogadottnak minősül.
          </p>
        </div>

        {/* GOMB A FOGLALÁSHOZ */}
        <div className="text-center pt-2">
          <Link to={bookingLink} className="btn btn-dark px-5 py-3 fs-5 shadow-sm">
            MEGÉRTETTEM, IDŐPONTOT FOGLALOK
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Hazirend;