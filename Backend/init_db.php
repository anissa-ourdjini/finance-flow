<?php
// init_db.php
// Import the SQL schema in `db.sql` into a MySQL database using settings in config.php

header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

try {
    $pdo = ff_get_pdo();
    $sqlFile = __DIR__ . '/../db.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("db.sql not found at $sqlFile");
    }

    $sql = file_get_contents($sqlFile);
    // Remove lines that are SQL comments starting with --
    $lines = explode("\n", $sql);
    $clean = array();
    foreach ($lines as $line) {
        $trim = trim($line);
        if ($trim === '' || strpos($trim, '--') === 0) continue;
        $clean[] = $line;
    }
    $sql = implode("\n", $clean);

    // Split on semicolon to execute statements one by one
    $stmts = array_filter(array_map('trim', explode(';', $sql)));

    // Execute statements one by one without wrapping in a single transaction
    foreach ($stmts as $stmt) {
        if ($stmt === '') continue;
        $pdo->exec($stmt);
    }

    echo json_encode(['ok' => true, 'message' => 'Imported db.sql into MySQL database']);
} catch (Exception $e) {
    // don't attempt rollback here — execute statements individually above
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}

