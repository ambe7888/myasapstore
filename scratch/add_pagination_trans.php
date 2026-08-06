<?php

$p = __DIR__ . '/../resources/lang/fr.json';
$d = json_decode(file_get_contents($p), true);

$d['pagination.previous'] = 'Précédent';
$d['pagination.next'] = 'Suivant';
$d['pagination.prev'] = 'Précédent';
$d['Add Company'] = 'Créer une entreprise';
$d['Add company'] = 'Créer une entreprise';
$d['Add New Company'] = 'Créer une entreprise';

file_put_contents($p, json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Translations updated in fr.json successfully!\n";
