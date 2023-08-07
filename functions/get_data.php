<?php
/**
 * Incluye el archivo de configuración de la base de datos.
 */
include '../config/database.php';

/**
 * Función para obtener datos de la base de datos según la tabla especificada.
 * @param string $table - El nombre de la tabla desde donde se obtendrán los datos.
 */
function getData($table)
{
    // Conectarse a la base de datos
    $conn = connect();

    // Preparar y ejecutar la consulta para obtener todos los datos de la tabla
    $stmt = $conn->query('SELECT * FROM ' . $table);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolver los datos en formato JSON
    echo json_encode($data);
}

// Verificar si la solicitud es de tipo GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Verificar si se proporcionó el parámetro 'action' en la solicitud GET
    if (isset($_GET['action'])) {
        $action = $_GET['action'];
        switch ($action) {
            case 'candidates':
                getData('candidate');
                break;
            case 'regions':
                getData('region');
                break;
            case 'communes':
                getData('commune');
                break;
        }
    }
}
