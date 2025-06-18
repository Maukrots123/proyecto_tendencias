<?php
// con_chat.php

header('Content-Type: application/json');

// Clave de la API de Gemini (v2 Flash)
$apiKey = "AIzaSyBRQbO78q5CV_KrFTeaYJYPVVkey96YNuY"; // Reemplaza con tu clave real si cambia

// Recibir datos del frontend
$input = json_decode(file_get_contents('php://input'), true);
$userText = $input['message'] ?? '';

if (!$userText) {
    http_response_code(400);
    echo json_encode(['error' => 'Mensaje vacío.']);
    exit;
}

// Contexto fijo para el asistente (Instrucción inicial)
$payload = json_encode([
    "contents" => [
        [
            "parts" => [
                [
                    "text" => "Eres una asistente virtual llamada Rebeca junior del Servicio Comunitario de la UNEG. 
                    Tu única función es ayudar a los estudiantes de la Universidad Nacional Experimental de Guayana con 
                    sus dudas sobre el servicio comunitario, incluyendo requisitos, normativas, proyectos, fechas, asignación 
                    y evaluación. Si el usuario pregunta sobre algo que no esté relacionado con el servicio comunitario de 
                    la UNEG, responde amablemente que solo puedes ayudar con ese tema."
                ],
                [
                    "text" => $userText
                ]
            ]
        ]
    ]
]);

// Llamar a la API de Gemini
$ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Error al comunicarse con la API.']);
    exit;
}

// Procesar respuesta de la IA
$data = json_decode($response, true);
$botReply = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No hubo respuesta.';

echo json_encode(['reply' => $botReply]);
