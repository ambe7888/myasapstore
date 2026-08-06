<?php

$jsonPath = __DIR__ . '/../resources/lang/fr.json';

if (!file_exists($jsonPath)) {
    echo "fr.json not found\n";
    exit(1);
}

$data = json_decode(file_get_contents($jsonPath), true);
if (!is_array($data)) {
    $data = [];
}

$translations = [
    "Funnel" => "Tunnel de vente",
    "Funnels" => "Tunnels de vente",
    "Sales Funnel" => "Tunnel de vente",
    "Sales Funnels" => "Tunnels de vente",
    "Product Funnel" => "Tunnel de vente produit",
    "Product Funnels" => "Tunnels de vente produits",
    "Funnel Builder" => "Éditeur de tunnel de vente",
    "Create Funnel" => "Créer un tunnel de vente",
    "Edit Funnel" => "Modifier le tunnel",
    "Funnel Name" => "Nom du tunnel",
    "Funnel URL" => "Lien du tunnel",
    "Funnel Settings" => "Paramètres du tunnel",
    "Funnel Blocks" => "Blocs du tunnel",
    "Click a block type on the left to add it here" => "Cliquez sur un type de bloc à gauche pour l'ajouter ici",
    "Click a block to edit its settings" => "Cliquez sur un bloc pour modifier ses paramètres",
    "Remove this block?" => "Supprimer ce bloc ?",
    "Share this funnel" => "Partager ce tunnel de vente",
    "Published" => "Publié",
    "Draft" => "Brouillon",
    "Publish" => "Publier",
    "Unpublish" => "Dépublier",
    "Views" => "Vues",
    "Clicks" => "Clics",
    "Orders" => "Commandes",
    "Conv. Rate" => "Taux de conv.",
    "Conversion Rate" => "Taux de conversion",
    "Header" => "En-tête",
    "Product" => "Produit",
    "Content" => "Contenu",
    "Social Proof" => "Preuve sociale",
    "Urgency" => "Urgence",
    "Media" => "Médias",
    "Conversion" => "Conversion",
    "Layout" => "Disposition",
    "Hero Section" => "Section héro",
    "Product Showcase" => "Présentation du produit",
    "Features List" => "Liste des caractéristiques",
    "Customer Reviews" => "Témoignages & Avis clients",
    "Countdown Timer" => "Compte à rebours",
    "Video Embed" => "Vidéo intégrée",
    "Buy Button / CTA" => "Bouton d'achat / CTA",
    "FAQ Accordion" => "Foire aux questions (FAQ)",
    "Trust Badges" => "Badges de confiance",
    "Guarantee Banner" => "Garantie satisfait ou remboursé",
    "Discount Banner" => "Bannière de réduction",
    "Form Checkout" => "Formulaire de commande directe",
    "Text Block" => "Bloc de texte",
    "Image Banner" => "Bannière image",
    "Divider / Spacer" => "Séparateur d'espace",
    "Déposez vos blocs ici" => "Déposez vos blocs ici",
    "Glissez un bloc depuis la palette à gauche ou cliquez dessus pour commencer" => "Glissez un bloc depuis la palette à gauche ou cliquez dessus pour commencer",
    "Insérer ici" => "Insérer ici",
    "Glisser pour déplacer" => "Glisser pour déplacer",
    "Monter" => "Monter",
    "Descendre" => "Descendre",
    "Masquer" => "Masquer",
    "Afficher" => "Afficher",
    "Supprimer" => "Supprimer",
    "Order Now" => "Commander maintenant",
    "Complete Order" => "Finaliser la commande",
    "Shipping Address" => "Adresse de livraison",
    "Payment Method" => "Mode de paiement",
    "Order Summary" => "Résumé de la commande",
    "Order Placed Successfully!" => "Commande effectuée avec succès !",
    "Thank you for your order. We will contact you shortly." => "Merci pour votre commande. Nous vous contacterons très prochainement.",
    "No funnels created yet" => "Aucun tunnel de vente créé pour le moment",
    "Create your first product funnel to boost sales with targeted landing pages" => "Créez votre premier tunnel de vente pour augmenter vos conversions avec des pages de vente ciblées",
    "Create Product Funnel" => "Créer un tunnel de vente produit",
    "Select a product for this funnel" => "Sélectionnez le produit pour ce tunnel de vente"
];

foreach ($translations as $k => $v) {
    $data[$k] = $v;
}

ksort($data);

file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Added " . count($translations) . " funnel translations to fr.json successfully!\n";
