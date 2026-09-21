# simple-todo

Liste de suivi de chantiers — une seule page HTML, sans dépendance ni serveur.

Ouvre `listechantiers.html` dans un navigateur : tout tourne en local.

L’onglet **Pro / Perso** sélectionné est mémorisé dans ce navigateur et restauré
au rechargement. Le header tient sur une ligne ; le menu **⋯** contient la liaison
au fichier, l’état de sauvegarde et les options d’impression. Sur mobile, il
regroupe aussi Annuler, Sauvegarde et Restaurer.

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

## Onglet Perso

L’onglet **Perso** regroupe les travaux maison, avec des domaines libres.
Les deux espaces sont vides au premier lancement : aucune liste de clients,
tâche personnelle ou donnée d’exemple n’est embarquée. Les listes enregistrées
dans le navigateur et les sauvegardes importées sont conservées.
Les nouvelles tâches démarrent sans critères ni statut.

- Tableau de bord : trois tâches par catégorie (priorités P1, tâches rapides,
  tâches à planifier ou décider, tâches bloquées ou en attente).
- Recherche, filtres par section et statut, et bouton **J’ai 2 heures** pour les
  tâches réalisables estimées à moins de 2 heures. Les tâches terminées restent consultables via le filtre.
- Édition directe dans les cellules : titre, notes, propriétés et date. Les changements
  sont enregistrés en quittant le champ ; Entrée valide le titre, Échap annule la
  saisie. Les notes acceptent plusieurs lignes (Ctrl/Cmd + Entrée pour valider).
- Une ligne **Nouvelle tâche…** permet d’ajouter une tâche sans formulaire.
  Le menu **···** ouvre les détails et la suppression. **Annuler** restaure la dernière action.
- Dans la fiche d’édition, un mode flux parcourt la liste filtrée dans l’ordre
  capturé à son ouverture, même si le score ou le statut change ensuite.
  **Enregistrer** sauvegarde en gardant la fiche ouverte ; **Enregistrer + précédent /
  suivant** sauvegarde puis passe à la tâche voisine. **Précédent / Suivant** abandonne
  le brouillon de la tâche courante. Un compteur indique la position et les boutons
  sont désactivés aux extrémités. Les achats et dépendances en brouillon suivent
  les mêmes règles. **Fermer** quitte sans enregistrer les dernières modifications.
- Les domaines sont des tags colorés libres : saisir un nom ou choisir une suggestion
  dans la cellule (Entrée ou sortie du champ pour valider). Effacer le champ retire le tag.
  Les suggestions et le filtre contiennent uniquement les tags utilisés par au moins
  une tâche, y compris les tâches terminées ou masquées par un filtre. Un tag disparaît
  automatiquement lorsque sa dernière utilisation est retirée. Les espaces superflus
  et les différences de casse ne créent pas de doublons. Les nouvelles tâches sont
  sans domaine, sauf si un domaine est actuellement filtré.
- Le point coloré à côté du tag ouvre une palette de dix couleurs. Le choix
  s’applique à toutes les tâches du domaine, est sauvegardé et peut être annulé.
  « Couleur automatique » restaure la palette par défaut. Les couleurs inutilisées
  sont supprimées avec la dernière utilisation du tag.
- Glisser les en-têtes pour réorganiser les colonnes ; le menu **Colonnes** propose
  aussi des flèches (pratique sur mobile) et un retour à l’ordre initial.
  Au clavier : Alt + flèche gauche/droite sur un en-tête. L’ordre est conservé
  dans le navigateur et les sauvegardes JSON ; **Annuler** restaure l’ordre précédent.
- Le score se recalcule immédiatement ; les lignes sont retriées lorsqu’on quitte
  le tableau pour éviter de déplacer les champs pendant la saisie.
- **Dépend de** remplace la note de blocage : rechercher et sélectionner un ou
  plusieurs prérequis. La colonne **Disponibilité** indique « Prête », « Bloquée »,
  « En attente » ou « Terminée », séparément du statut manuel. Tous les prérequis
  doivent être terminés pour débloquer une tâche. Rouvrir un prérequis rebloque
  les tâches non terminées qui en dépendent.
- **Prêtes à avancer** exclut les tâches bloquées, en attente ou terminées.
  **J’ai 2 heures** applique aussi ces conditions. « Débloque N tâches » compte les
  tâches auxquelles il ne manque que ce prérequis.
- La modale de liens propose **Dépend de** (prérequis de la tâche courante)
  et **Bloque** (tâches qui attendent celle-ci). Les deux sélections sont conservées
  lorsqu’on change de sens. Appliquer met à jour les liens réciproques en une action
  annulable ; depuis une fiche, les deux sens restent en brouillon jusqu’à Enregistrer.
- Les cycles sont refusés. Un lien introuvable dans une sauvegarde reste bloquant
  et peut être retiré dans le sélecteur. Supprimer une tâche utilisée comme
  prérequis demande confirmation, retire ses liens et peut être annulé.
- Les critères utilisent des mots : risque Aucun / Faible / Moyen / Élevé ;
  gain Aucun gain direct / Petite amélioration / Amélioration notable / Amélioration majeure.
  Chaque liste correspond aux notes 0 à 3. « Non renseigné » conserve l’absence de note.
- L’échéance suit la date cible : Aucune (0), Plus tard (1), Ce mois-ci (2),
  Cette semaine (3, jusqu’au dimanche inclus) ou Dépassée (4, avant aujourd’hui).
  Les raccourcis fixent respectivement aucune date, la fin du mois suivant,
  la fin du mois, dimanche ou hier. La date reste modifiable ; « Cette semaine »
  prime sur « Ce mois-ci » quand la semaine chevauche deux mois.
  Effacer la date remet l’échéance à « Non renseigné » ; choisir « Aucune »
  ou « Non renseigné » efface la date. Le score évolue au changement de jour,
  au retour dans l’onglet et au rechargement, sans modifier les dates enregistrées.
- Les anciennes dates sont conservées et deviennent la référence pour l’urgence.
  Les anciennes notes d’échéance sans date reçoivent une date une seule fois,
  selon ces raccourcis au jour de la mise à niveau. Les durées XS et S sont
  regroupées en « Moins de 2 heures », avec le même bonus +2.
- Score de base = risque × 4 + échéance × 2 + gain × 2, avec bonus de durée :
  moins de 2 heures +2, une demi-journée 0, une journée −2,
  plusieurs jours −4. Le score reprend le maximum entre ce score de base et ceux
  des tâches non terminées qui en dépendent (directement ou en chaîne), puis
  ajoute +3 par tâche en aval, plafonné à +9. Ainsi un prérequis non qualifié peut
  hériter de la priorité d’une tâche qualifiée. Sans aucun score de base complet,
  le score reste vide, sans empêcher une priorité de risque ou d’échéance.
- Les priorités sont indépendantes du score : P1 pour risque élevé ou échéance
  dépassée ; P2 pour risque moyen ou échéance cette semaine ; P3 pour risque faible,
  échéance ce mois-ci ou gain notable / majeur ; P4 sinon, après évaluation complète.
  La règle la plus prioritaire l’emporte, y compris celle des tâches non terminées
  en aval : les prérequis héritent de cette priorité, même avec un score vide.
  Le badge explique sa raison au survol. Le gain nul et une durée longue ne font
  jamais descendre une tâche dangereuse de P1.
- L’ordre est relatif aux tâches présentes : priorité, risque le plus élevé
  (y compris en aval), score décroissant, durée courte puis titre en cas d’égalité.
  Les tâches sans priorité restent à évaluer, les tâches terminées sont en fin de liste.
  Aucun quota ne fabrique des P1 : retirer des tâches ou filtrer la liste ne change
  pas les priorités restantes.
- L’impression de Perso reprend la liste filtrée. Les sauvegardes JSON et le
  fichier lié contiennent les deux espaces. Les anciennes sauvegardes reçoivent
  un espace personnel vide si elles n’en contiennent pas.

## Achats et courses

Dans la colonne **Achats** ou les détails d’une tâche, ajouter autant de lignes
que nécessaire : article, quantité facultative, magasin / lieu, ville / localité,
et case « Acheté ». Les trois champs texte sont libres, avec suggestions issues
des lignes existantes ; aucun catalogue séparé. Supprimer la dernière utilisation
retire la suggestion. Les lignes achetées restent des utilisations existantes.

La vue **Courses** regroupe les achats de toutes les tâches, tous domaines confondus,
par ville → magasin → article. Seules les combinaisons identiques sont fusionnées
(espaces et casse normalisés). Les quantités numériques sont additionnées ; les
quantités absentes restent explicitement à préciser. Les tâches concernées sont
cliquables pour modifier leurs achats. Une coche marque toutes les lignes du groupe
achetées. La vue « Achetés » permet de les retrouver et de les remettre à acheter ;
**Annuler** restaure aussi la dernière action groupée. La recherche porte sur les
articles, lieux, villes et tâches, et garde les groupes complets.

Les achats sont inclus dans les sauvegardes JSON et le fichier lié. L’impression
depuis **Courses** reprend la liste filtrée. Ils ne modifient pas automatiquement
le statut des tâches ni les dépendances entre tâches.

## Vérifications

Exécuter `node --test tests/*.test.cjs` pour vérifier critères, échéances, dépendances et regroupement des achats.

## Enregistrement des données

- **Automatique dans le navigateur** (localStorage) à chaque modification.
- **Liaison à un fichier `.json`** (Chrome / Edge) : le fichier est réécrit à
  chaque changement, ce qui permet de le poser dans un dossier synchronisé et de
  retrouver la liste sur un autre poste.
- **Sauvegarde / Restaurer** : export et import manuels d'un `.json`.

Les fichiers de données ne sont pas versionnés ici (voir `.gitignore`) : ils
contiennent des données privées. Aucun fichier JSON, stockage du navigateur ou
fichier lié n’est inclus dans la publication du code. L’application n’envoie
pas les listes à un serveur : elles restent dans le navigateur et dans le
fichier local choisi par l’utilisateur.

## Impression

Le bouton **Imprimer** produit une feuille A4 portrait reprenant les cinq cases,
avec en option des lignes vierges pour compléter à la main.
