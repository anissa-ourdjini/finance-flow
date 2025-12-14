<?php
/**
 * Endpoint de test simple
 * http://localhost:8000/test.php
 */

echo json_encode([
    'status' => 'OK',
    'message' => 'API FinanceFlow est en ligne',
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
