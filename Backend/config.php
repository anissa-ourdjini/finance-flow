<?php
// Backend configuration for MySQL (WAMP)
// Edit these values to match your local MySQL setup (phpMyAdmin / WAMP)

// Example:
// $DB_HOST = '127.0.0.1';
// $DB_PORT = 3306;
// $DB_NAME = 'financeflow';
// $DB_USER = 'root';
// $DB_PASS = '';

$DB_HOST = '127.0.0.1';
$DB_PORT = 3306;
$DB_NAME = 'finance_flow';
$DB_USER = 'root';
$DB_PASS = '';

function ff_get_pdo(){
    global $DB_HOST, $DB_PORT, $DB_NAME, $DB_USER, $DB_PASS;
    $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    return $pdo;
}

// Simple file logger to help debugging on local WAMP
function ff_log($msg){
    $logDir = __DIR__ . '/logs';
    if(!is_dir($logDir)) @mkdir($logDir, 0777, true);
    $f = $logDir . '/backend.log';
    $time = date('Y-m-d H:i:s');
    $line = "[{$time}] " . (is_string($msg) ? $msg : json_encode($msg, JSON_UNESCAPED_UNICODE)) . "\n";
    @file_put_contents($f, $line, FILE_APPEND | LOCK_EX);
}
