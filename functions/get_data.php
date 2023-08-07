<?php
include '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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

function getData($table)
{
    $conn = connect();
    $stmt = $conn->query('SELECT * FROM ' . $table);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($data);
}
