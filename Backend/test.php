<?php
header('Content-Type: application/json');

// Test basique
echo json_encode([
    'ok' => true,
    'php_version' => phpversion(),
    'session_status' => session_status(),
    'test' => 'Backend is working'
]);
