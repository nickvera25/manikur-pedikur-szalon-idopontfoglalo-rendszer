// bejelentkezési logika
const loginForm = document.querySelector('#loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.querySelector('#email').value;
        const jelszo = document.querySelector('#jelszo').value;

        if (email === "" || jelszo === "") {
            alert("Kérlek, töltsd ki az e-mailt és a jelszót is!");
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, jelszo: jelszo })
            });

            const data = await response.json();
            console.log("A szerver válasza:", data);

            if (data.success) {
                const teljesNev = data.user.vezeteknev + " " + data.user.keresztnev;

                localStorage.setItem('felhasznaloNev', teljesNev);
                localStorage.setItem('token', data.token);
                localStorage.setItem('szerep', data.user.szerep);

                alert("Sikeres bejelentkezés!");
                window.location.href = 'kezdoldal.html';
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Hálózati hiba történt:", error);
            alert("Hiba a szerverrel való kapcsolat során.");
        }
    });
}
// regisztrációs logika
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const vezeteknev = document.getElementById('regVezeteknev').value;
        const keresztnev = document.getElementById('regKeresztnev').value;
        const telefon = document.getElementById('regTelefon').value;
        const email = document.getElementById('regEmail').value;
        const jelszo = document.getElementById('regJelszo').value;
        const jelszoUjra = document.getElementById('regJelszoUjra').value;

        if (jelszo !== jelszoUjra) {
            alert("A két jelszó nem egyezik!");
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vezeteknev, keresztnev, telefon, email, jelszo })
            });

            const data = await response.json();

            if (data.success) {
                alert("Sikeres regisztráció! Most már bejelentkezhetsz.");
                window.location.href = 'index.html';
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error("Hiba történt a regisztráció során:", error);
        }
    });
}