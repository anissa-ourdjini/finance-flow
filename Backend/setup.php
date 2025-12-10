<?php
/**
 * Setup script for FinanceFlow
 * Run this once to initialize the database
 */

// Set working directory
chdir(__DIR__);

echo "=== FinanceFlow Database Setup ===\n\n";

// Include backend config
require_once __DIR__ . '/Backend/config.php';

try {
    echo "1. Connecting to MySQL...\n";
    $pdo = ff_get_pdo();
    echo "   ✓ Connection successful\n\n";
    
    echo "2. Reading db.sql...\n";
    $sqlFile = __DIR__ . '/db.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("db.sql not found at: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    echo "   ✓ File read (" . strlen($sql) . " bytes)\n\n";
    
    echo "3. Executing SQL statements...\n";
    
    // Remove comments
    $lines = explode("\n", $sql);
    $clean = [];
    foreach ($lines as $line) {
        $trim = trim($line);
        if ($trim === '' || strpos($trim, '--') === 0) continue;
        $clean[] = $line;
    }
    $sql = implode("\n", $clean);
    
    // Split and execute
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    $count = 0;
    $errors = [];
    
    foreach ($statements as $stmt) {
        if ($stmt === '') continue;
        try {
            $pdo->exec($stmt);
            $count++;
            echo "   ✓ Statement $count executed\n";
        } catch (PDOException $e) {
            $errors[] = $e->getMessage();
            echo "   ✗ Error in statement " . ($count + 1) . ": " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n4. Summary:\n";
    echo "   - Total statements executed: $count\n";
    if (!empty($errors)) {
        echo "   - Errors: " . count($errors) . "\n";
        foreach ($errors as $err) {
            echo "     • $err\n";
        }
    }
    
    echo "\n✅ Database setup completed!\n";
    echo "   You can now use the application.\n";
    
} catch (Exception $e) {
    echo "\n❌ Setup failed:\n";
    echo "   " . $e->getMessage() . "\n";
    exit(1);
}
?>
