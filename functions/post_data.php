<?php
include '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST)) {
        $request = $_POST;
        check_duplicate($request);
    }
}


function check_duplicate($request)
{
    if (isset($request['rut'])) {
        $conn = connect();
        $rut = $request['rut'];

        $stmt = $conn->prepare('SELECT COUNT(*) as count FROM vote 
                                INNER JOIN user ON vote.user_id = user.id 
                                WHERE user.rut = :rut');
        $stmt->bindParam(':rut', $rut);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        $exists = $result['count'] > 0;

        if ($exists) {
            echo json_encode(array('status' => 'exists'));
            //echo json_encode(array('exists' => true));
        } else {

            perfom_insert($request);
            echo json_encode(array('status' => 'success'));
        }
    } else {
        echo json_encode(array('error' => 'ERROR'));
    }
}

function insert_user($data)
{
    $conn = connect();
    $stmt = $conn->prepare('INSERT INTO user (alias, fullname, rut) VALUES (:alias, :fullname, :rut)');
    $stmt->bindParam(':alias', $data['alias']);
    $stmt->bindParam(':fullname', $data['fullname']);
    $stmt->bindParam(':rut', $data['rut']);

    $stmt->execute();

    // Obtenemos el ultimo id creado
    $lastInsertedId = $conn->lastInsertId();

    return $lastInsertedId;
}

function perfom_insert($data)
{
    $userInsertedId = insert_user($data);

    $checkWeb = isset($data['checkWeb']) ? 1 : 0;
    $checkSocial = isset($data['checkSocial']) ? 1 : 0;
    $checkFriend = isset($data['checkFriend']) ? 1 : 0;
    $checkTv = isset($data['checkTv']) ? 1 : 0;
    $commune_id = $data['communes'];

    $conn = connect();
    $stmt = $conn->prepare('INSERT INTO vote (user_id, candidate_id, web, social, friend, tv, commune_id) VALUES (:user_id, :candidate_id, :web, :social, :friend, :tv, :commune_id)');
    $stmt->bindParam(':user_id', $userInsertedId);
    $stmt->bindParam(':candidate_id', $data['candidates']);
    $stmt->bindParam(':web', $checkWeb);
    $stmt->bindParam(':social', $checkSocial);
    $stmt->bindParam(':friend', $checkFriend);
    $stmt->bindParam(':tv', $checkTv);
    $stmt->bindParam(':commune_id', $commune_id);

    $stmt->execute();
}
