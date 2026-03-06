<?php
// api/test.php - Simple test
header("Content-Type: application/json");
echo json_encode(["status" => "ok", "message" => "API working"]);
?>