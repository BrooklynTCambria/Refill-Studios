<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'refill_studios';
<<<<<<< HEAD
    private $username = 'root'; // Change this to your MySQL username
    private $password = 'root'; // Change this to your MySQL password
=======
    private $username = 'root';
    private $password = 'root';
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
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
<<<<<<< HEAD
            error_log("Database connection error: " . $e->getMessage());
=======
>>>>>>> 037dfa482794a99428b2550e31b9ed595f4493c7
            return null;
        }
    }
}
?>