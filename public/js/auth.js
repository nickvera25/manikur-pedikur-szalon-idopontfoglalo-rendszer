// védelem
function checkAuth() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.replace('index.html');
    }
}

window.addEventListener('pageshow', checkAuth);

// üdvözlés
window.addEventListener('DOMContentLoaded', () => {
    const nev = localStorage.getItem('felhasznaloNev');
    const welcomeElem = document.getElementById('welcomeText');
    
    if (nev && welcomeElem) {
        welcomeElem.innerText = `Üdvözöllek, ${nev}!`;
    }
});

// kijelentkezés
window.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('a[href="index.html"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.replace('index.html');
        });
    }
});