<?php
$transacciones = [
    ["id" => 1, "descripcion" => "Ropa", "monto" => 12000]
];

function registrarTransaccion($id, $descripcion, $monto)
{
    global $transacciones;

    $nuevaTransac = [
        "id" => $id,
        "descripcion" => $descripcion,
        "monto" => $monto
    ];
    array_push($transacciones, $nuevaTransac);
}

function generarEstadoDeCuenta()
{
    global $transacciones;
    $total = 0;

    foreach ($transacciones as $transac) {
        $total += $transac["monto"];
    }

    $totalConInteres = $total * (1 + (2.6 / 100));
    $cashback = $totalConInteres * (0.1 / 100);
    $totalAPagar = $totalConInteres - $cashback;

    $txt = "";
    $txt .= "ESTADO DE CUENTA" . PHP_EOL;
    foreach ($transacciones as $transac) {
        $txt .= "ID: " . $transac["id"] . " | Descripcion: " . $transac["descripcion"] . " | Monto: " . $transac["monto"] . " Colones" . PHP_EOL;
    }
    $txt .= "Monto total: " . strval($total) . PHP_EOL .
        "Monto total + intereses: " . strval($totalConInteres) . PHP_EOL .
        "Cashback: " . strval($cashback) . PHP_EOL .
        "Monto a pagar: " . strval($totalAPagar) . " Colones";

    echo $txt;

    $archivo = fopen("estado_cuenta.txt", "w") or die("NO se puede abrir el archivo");
    fwrite($archivo, $txt);
    fclose($archivo);

}


registrarTransaccion(2, "Lentes", 5000);
registrarTransaccion(3, "Faja", 2500);
registrarTransaccion(4, "Auriculaes", 7200);
registrarTransaccion(5, "Camisa", 4500);

generarEstadoDeCuenta();


?>