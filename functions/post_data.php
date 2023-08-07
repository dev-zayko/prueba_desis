<?php
/**
 * Incluye el archivo de configuración de la base de datos.
 */
include '../config/database.php';

/**
 * Función para manejar la solicitud POST y verificar si el usuario ya ha votado.
 * Si no ha votado, realiza la inserción de los datos del usuario y su voto.
 * @param array $request - Los datos enviados en la solicitud POST.
 */
function check_duplicate($request)
{
    // Verifica si el RUT está presente en los datos de la solicitud POST
    if (isset($request['rut'])) {
        $conn = connect();
        $rut = $request['rut'];

        // Consulta para contar la cantidad de votos asociados a un RUT en la tabla 'vote' vinculada a la tabla 'user'
        $stmt = $conn->prepare('SELECT COUNT(*) as count FROM vote 
                                INNER JOIN user ON vote.user_id = user.id 
                                WHERE user.rut = :rut');
        $stmt->bindParam(':rut', $rut);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verificar si el RUT ya ha votado
        $exists = $result['count'] > 0;

        if ($exists) {
            // Si el RUT ya ha votado, se devuelve una respuesta JSON indicando que ya existe un voto asociado a ese RUT
            echo json_encode(array('status' => 'exists'));
        } else {
            // Si el RUT no ha votado, se procede a realizar la inserción del usuario y su voto
            perfom_insert($request);
            echo json_encode(array('status' => 'success'));
        }
    } else {
        // Si no se proporciona el RUT en la solicitud POST, se devuelve una respuesta JSON de error
        echo json_encode(array('error' => 'ERROR'));
    }
}

/**
 * Función para insertar los datos del usuario en la tabla 'user'.
 * @param array $data - Los datos del usuario a insertar.
 * @return int - El ID del usuario insertado.
 */
function insert_user($data)
{
    $conn = connect();
    $stmt = $conn->prepare('INSERT INTO user (alias, fullname, rut) VALUES (:alias, :fullname, :rut)');
    $stmt->bindParam(':alias', $data['alias']);
    $stmt->bindParam(':fullname', $data['fullname']);
    $stmt->bindParam(':rut', $data['rut']);

    $stmt->execute();

    // Obtenemos el último ID creado (ID del usuario insertado)
    $lastInsertedId = $conn->lastInsertId();

    return $lastInsertedId;
}

/**
 * Función para realizar la inserción del usuario y su voto en la base de datos.
 * @param array $data - Los datos del usuario y su voto a insertar.
 */
function perfom_insert($data)
{
    // Insertamos los datos del usuario en la tabla 'user' y obtenemos el ID del usuario insertado
    $userInsertedId = insert_user($data);

    // Verificamos los checkboxes y convertirmos en 0 o 1 según estén marcados o no
    $checkWeb = isset($data['checkWeb']) ? 1 : 0;
    $checkSocial = isset($data['checkSocial']) ? 1 : 0;
    $checkFriend = isset($data['checkFriend']) ? 1 : 0;
    $checkTv = isset($data['checkTv']) ? 1 : 0;

    // Obtenemos el ID de la comuna seleccionada desde el formulario
    $commune_id = $data['communes'];

    // Realizamos la inserción del voto del usuario en la tabla 'vote'
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
