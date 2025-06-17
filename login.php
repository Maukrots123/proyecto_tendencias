<?php
session_start();
include("db.php");

$username = $_POST['username'];
$password = $_POST['password'];

// Consulta SQL para validar usuario
$sql = "SELECT * FROM usuario WHERE nombre = ? AND contraseña = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $username, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Guardar datos de sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['nombre'];
    $_SESSION['rol'] = $user['rol'];

    // Redirigir al index o dashboard
    header("Location: index.php");
    exit;
} else {
    echo "<script>alert('Usuario o contraseña incorrectos'); window.location.href='index.html#login';</script>";
}
?>
