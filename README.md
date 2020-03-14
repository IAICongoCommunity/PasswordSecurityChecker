# PasswordSecurityChecker

PasswordSecurityChecker is a component that verifies the security of a password according to the GDPR.
Le traitement avec ce composant est reparti sous deux environnement. Un coté client avec du Javascript et l'autre coté
serveur du PHP

## Comment ça marche ?
D'une manière globale, on passe toujours par l'initialisation des variables et la configuration des règles

### Côté Javascript
Permet de voir en live les règles de sécurité remplies. Le processus se construit comme tel:
 - Construction des règles dans le front à partir des règles par defaut (1)
 - Mise à jour des statuts des règles lors de la saisie des valeurs du PWD
 - Reconstruction des règles dans le DOM ==> (1).
 - Mise à jour des règles dans le front selon le statut des règles

### Côté PHP
Permet de vérifier le PWD puis d'afficher les règles ou critères de sécurité non respecté.
Il joue le rôle de renforcement de la sécurité côté serveur surtout s'il arrivait que le client désactive le Javascript
sur son navigateur