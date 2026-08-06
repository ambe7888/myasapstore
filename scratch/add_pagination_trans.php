<?php

$p = __DIR__ . '/../resources/lang/fr.json';
$d = json_decode(file_get_contents($p), true);

$d['pagination.previous'] = 'Précédent';
$d['pagination.next'] = 'Suivant';
$d['pagination.prev'] = 'Précédent';
$d['pagination.next'] = 'Suivant';

file_put_contents($p, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Pagination keys added to fr.json successfully!\n";
