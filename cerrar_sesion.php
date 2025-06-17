<?php
// --- INICIO Bloque de Depuración ---
error_reporting(E_ALL); // Reporta todos los errores
ini_set('display_errors', 1); // Muestra los errores en el navegador
ini_set('display_startup_errors', 1); // Muestra errores de inicio
// --- FIN Bloque de Depuración ---
session_start(); // Inicia la sesión para poder acceder y manipularla

// Destruye todas las variables de sesión del array $_SESSION.
// Esto es a menudo más explícito que session_unset()
$_SESSION = array(); 

// Si se desea destruir la sesión completamente, también se debe borrar la cookie de sesión.
// Nota: ¡Esto destruirá la sesión, y no solo los datos de la sesión!
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Finalmente, destruye la sesión del servidor
session_destroy();

// Redirige al usuario a la página principal (index.php)
// ¡Es crucial que NO HAYA NADA (espacios, HTML, etc.) antes de esta línea!
header("Location:index.php");
exit(); // Es FUNDAMENTAL usar exit() para asegurar que el script se detenga aquí.
?>