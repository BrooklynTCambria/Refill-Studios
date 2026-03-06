<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'refill_studios';
    private $username = 'root'; // Change this to your MySQL username
    private $password = 'root'; // Change this to your MySQL password
    private $conn;

    public function getConnection() {
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->conn;
        } catch(PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            return null;
        }
    }
}
?>