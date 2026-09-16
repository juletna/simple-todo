# simple-todo

Liste de suivi de chantiers — une seule page HTML, sans dépendance ni serveur.

Ouvre `listechantiers.html` dans un navigateur : tout tourne en local.

## Fonctionnement

Cinq cases qui suivent le déroulé d'un chantier :

1. **RDV à faire** — à planifier / planifiés
2. **Devis** — à faire / envoyés (avec alerte de relance à J+15)
3. **Chantiers & devis validés** — matériel à commander / programmés / en cours
4. **À facturer**
5. **À payer** — pense-bêtes, hors chantiers

Les tâches se déplacent d'une case à l'autre par glisser-déposer ou via le menu ⇄,
qui propose l'étape suivante du workflow. Chaque tâche accepte un intitulé, une
date / période, un lieu, une date d'envoi de devis et une note ; la case où elle
se trouve décide de ce qui s'affiche sur la fiche, mais tous les champs restent
saisissables partout.

## Enregistrement des données

- **Automatique dans le navigateur** (localStorage) à chaque modification.
- **Liaison à un fichier `.json`** (Chrome / Edge) : le fichier est réécrit à
  chaque changement, ce qui permet de le poser dans un dossier synchronisé et de
  retrouver la liste sur un autre poste.
- **Sauvegarde / Restaurer** : export et import manuels d'un `.json`.

Les fichiers de données ne sont pas versionnés ici (voir `.gitignore`) : ils
contiennent des noms de clients. Les quelques tâches affichées au premier
lancement sont des exemples fictifs.

## Impression

Le bouton **Imprimer** produit une feuille A4 portrait reprenant les cinq cases,
avec en option des lignes vierges pour compléter à la main.
