<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing asignaciones.php POST request...\n\n";

$url = 'http://localhost/YanguasEjercicios/mockups-asist-net/api/asignaciones.php';
$data = [
    'id_ficha' => '2395149',
    'id_instructor' => 5
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Response:\n";
echo $result;
echo "\n\nHTTP Response Headers:\n";
print_r($http_response_header);
?>
