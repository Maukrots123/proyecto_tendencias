// Obtener el modal
var loginModal = document.getElementById("loginModal");

// Obtener el botón que abre el modal (el enlace "Accesar" en el menú)
// Asegúrate de que este selector apunte correctamente a tu enlace "Accesar"
// Si tu HTML cambia el href o el texto, ajusta este selector.
var openLoginBtn = document.querySelector('a[href="#que-es-servicio"]'); 

// Obtener el elemento <span> que cierra el modal (la "x")
var closeButton = document.getElementsByClassName("close-button")[0];

// Cuando el usuario haga clic en el enlace "Accesar", abre el modal
if (openLoginBtn) { // Asegura que el botón exista antes de añadir el event listener
    openLoginBtn.addEventListener('click', function(event) {
        event.preventDefault(); // Evita que la página salte al ancla #que-es-servicio
        loginModal.style.display = "block"; // Muestra el modal
    });
}

// Cuando el usuario haga clic en la "x" (close-button), cierra el modal
if (closeButton) {
    closeButton.addEventListener('click', function() {
        loginModal.style.display = "none"; // Oculta el modal
    });
}

// Cuando el usuario haga clic en cualquier lugar fuera del modal, ciérralo
window.addEventListener('click', function(event) {
    if (event.target == loginModal) { // Si el clic fue en el fondo oscuro del modal
        loginModal.style.display = "none"; // Oculta el modal
    }
});

// Opcional: Manejo del mensaje de login después de una redirección PHP
// Si login.php redirige con ?status=error, podemos mostrar el mensaje en el modal
window.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const message = urlParams.get('message');
    const loginMessageElement = document.getElementById('loginMessage');

    if (status === 'error' && loginMessageElement) {
        loginMessageElement.textContent = decodeURIComponent(message);
        loginModal.style.display = "block"; // Vuelve a mostrar el modal con el error
    }
});