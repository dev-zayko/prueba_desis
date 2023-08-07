<?php
function connect() {
    $host = 'localhost'; // Normalmente es 'localhost' si estás en el mismo servidor que MySQL
    $dbname = 'prueba_desis';
    $username = 'root';
    $password = '';

    try {
        $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        // Establecer el modo de errores de PDO a excepciones
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        echo "Error de conexión: " . $e->getMessage();
    }
}
?>
