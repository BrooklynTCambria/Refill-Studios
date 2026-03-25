<?php
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Simple API is working', 'method' => $_SERVER['REQUEST_METHOD']]);
?>