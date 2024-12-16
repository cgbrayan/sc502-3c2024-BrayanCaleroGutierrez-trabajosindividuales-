<?php

require 'db.php';

function crearTarea($user_id, $title, $description, $due_date)
{
    global $pdo;
    try {
        $sql = "INSERT INTO tasks (user_id, title, description, due_date) values (:user_id, :title, :description, :due_date)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'user_id' => $user_id,
            'title' => $title,
            'description' => $description,
            'due_date' => $due_date
        ]);
        //devuelve el id de la tarea creada en la linea anterior
        return $pdo->lastInsertId();
    } catch (Exception $e) {
        logError("Error creando tarea: " . $e->getMessage());
        return 0;
    }
}

function crearComentario($task_id, $comment)
{
    global $pdo;
    try {
        $sql = "INSERT INTO comments (task_id, comment) values (:task_id, :comment)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'task_id' => $task_id,
            'comment' => $comment
        ]);
        //devuelve el id de la tarea creada en la linea anterior
        return $pdo->lastInsertId();
    } catch (Exception $e) {
        logError("Error creando tarea: " . $e->getMessage());
        return 0;
    }
}
function editarTarea($id, $title, $description, $due_date)
{
    global $pdo;
    try {
        $sql = "UPDATE tasks set title = :title, description = :description, due_date = :due_date where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'title' => $title,
            'description' => $description,
            'due_date' => $due_date,
            'id' => $id
        ]);
        $affectedRows = $stmt->rowCount();
        return $affectedRows > 0;
    } catch (Exception $e) {
        logError($e->getMessage());
        return false;
    }
}

function editarComentario($comment, $id)
{
    global $pdo;
    try {
        $sql = "UPDATE comments set comment = :comment where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'comment' => $comment,
            'id' => $id
        ]);
        $affectedRows = $stmt->rowCount();
        return $affectedRows > 0;
    } catch (Exception $e) {
        logError($e->getMessage());
        return false;
    }
}

//obtenerTareasPorUsuario
function obtenerTareasPorUsuario($user_id)
{
    global $pdo;
    try {
        $sql = "Select * from tasks where user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $resultado;
    } catch (Exception $e) {
        logError("Error al obtener tareas: " . $e->getMessage());
        return [];
    }
}

//Obtener IDS de las tareas para buscar los comentarios correspondientes
function obtenerDatos($user_id)
{
    $tasks = obtenerTareasPorUsuario($user_id);
    $idTasks = [];

    foreach ($tasks as $taskContent) {
        $comments = obtenerComentariosPorIdTarea($taskContent['id']);

        $idTasks[] = [
            'tarea' => $taskContent,
            'comentarios' => $comments
        ];

    }
    return $idTasks;
}

function obtenerComentariosPorIdTarea($task_id)
{
    global $pdo;
    try {
        $sql = "Select * from comments where task_id = :task_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['task_id' => $task_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        logError("Error al obtener tareas: " . $e->getMessage());
        return [];
    }
}

//Eliminar una tarea por id
function eliminarTarea($id)
{
    global $pdo;
    try {
        $sql = "delete from tasks where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;// true si se elimina algo
    } catch (Exception $e) {
        logError("Error al eliminar la tareas: " . $e->getMessage());
        return false;
    }
}

function eliminarComentario($id)
{
    global $pdo;
    try {
        $sql = "delete from comments where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;// true si se elimina algo
    } catch (Exception $e) {
        logError("Error al eliminar el comentario: " . $e->getMessage());
        return false;
    }
}


$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');
function getJsonInput()
{
    return json_decode(file_get_contents("php://input"), true);
}

session_start();
if (isset($_SESSION['user_id'])) {
    //el usuario tiene sesion
    $user_id = $_SESSION['user_id'];
    logDebug($user_id);
    switch ($method) {
        case 'GET':
            $tareas = obtenerDatos($user_id);
            echo json_encode($tareas);
            break;

        case 'POST':
            $tipo = isset($_GET['data']) ? $_GET['data'] : 'tareas';//SABER SI ES COMENTARIO O TAREAS

            $input = getJsonInput();

            if ($tipo === 'comment') {
                if (isset($input['task_id'], $input['comment'])) {
                    $id = crearComentario($input['task_id'], $input['comment']);

                    if ($id > 0) {
                        http_response_code(201);
                        echo json_encode(["message" => "Comentario creado: ID: " . $id]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "Error general creando el comentario"]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(["error" => "Datos insuficientes"]);
                }
            } elseif ($tipo === 'tareas') {
                if (isset($input['title'], $input['description'], $input['due_date'])) {
                    //vamos a crear tarea
                    $id = crearTarea($user_id, $input['title'], $input['description'], $input['due_date']);
                    if ($id > 0) {
                        http_response_code(201);
                        echo json_encode(value: ["messsage" => "Tarea creada: ID:" . $id]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["error" => "Error general creando la tarea"]);
                    }
                } else {
                    //retornar un error
                    http_response_code(400);
                    echo json_encode(["error" => "Datos insuficientes"]);
                }
            }
            break;

        case 'PUT':
            $tipo = isset($_GET['data']) ? $_GET['data'] : 'tareas';//SABER SI ES COMENTARIO O TAREAS

            if($tipo === 'comment'){
                $input = getJsonInput();
            if (isset($input['comment'], $input['id'])) {
                $editResult = editarComentario($input['comment'], $input['id']);
                if ($editResult) {
                    http_response_code(201);
                    echo json_encode(['message' => "Tarea actualizada"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Error actualizando la tarea"]);
                }
            } else {
                //retornar un error
                http_response_code(400);
                echo json_encode(["error" => "Datos insuficientes"]);
            }
            }elseif($tipo === 'tareas'){
                $input = getJsonInput();
            if (isset($input['title'], $input['description'], $input['due_date']) && $_GET['id']) {
                $editResult = editarTarea($_GET['id'], $input['title'], $input['description'], $input['due_date']);
                if ($editResult) {
                    http_response_code(201);
                    echo json_encode(['message' => "Tarea actualizada"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Error actualizando la tarea"]);
                }
            } else {
                //retornar un error
                http_response_code(400);
                echo json_encode(["error" => "Datos insuficientes"]);
            }
            }
            break;

        case 'DELETE':
            $tipo = isset($_GET['data']) ? $_GET['data'] : 'tareas';

            if($tipo === 'comment'){
                if ($_GET['id']) {
                    $fueEliminado = eliminarComentario($_GET['id']);
                    if ($fueEliminado) {
                        http_response_code(200);
                        echo json_encode(['message' => "Comentario eliminado"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['message' => 'Sucedio un error al eliminar el comentario']);
                    }
    
                } else {
                    //retornar un error
                    http_response_code(400);
                    echo json_encode(["error" => "Datos insuficientes"]);
                }
            }elseif($tipo === 'tareas'){
                if ($_GET['id']) {
                    $fueEliminado = eliminarTarea($_GET['id']);
                    if ($fueEliminado) {
                        http_response_code(200);
                        echo json_encode(['message' => "Tarea eliminada"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['message' => 'Sucedio un error al eliminar la tarea']);
                    }
    
                } else {
                    //retornar un error
                    http_response_code(400);
                    echo json_encode(["error" => "Datos insuficientes"]);
                }
            }
            
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Metodo no permitido"]);
            break;
    }

} else {
    http_response_code(401);
    echo json_encode(["error" => "Sesion no activa"]);
}