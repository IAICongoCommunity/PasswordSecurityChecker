# PasswordSecurityChecker

**Auteur :** [@igorcyberdyne](https://github.com/igorcyberdyne)
**Version : V1**

**PasswordSecurityChecker** est un composant qui permet de vérifier la sécurité d'un mot de passe selon le GDPR.
Le traitement avec ce composant est reparti sous deux environnements. Un côté client avec du Javascript et l'autre côté
serveur du PHP

## Comment ça marche ?
### Côté Javascript
Permet de voir en live les règles de sécurités remplies. Le processus se construit comme tel:
 - Construction des règles dans le front à partir des règles par défaut (1)
 - Mise à jour des statuts des règles lors de la saisie des valeurs du PWD
 - Reconstruction des règles dans le DOM ==> (1).
 - Mise à jour des règles dans le front selon le statut des règles

### Côté PHP
Permet de vérifier le PWD puis d'afficher les règles ou critères de sécurités non respectés.
Il joue le rôle de renforcement de la sécurité côté serveur surtout s'il arrivait que le client désactive le Javascript
sur son navigateur.

### Exemple
Ci-dessous la mise en place du composant

> Télécharger le composant sur [github/PasswordSecurityChecker](https://github.com/IAICongoCommunity/PasswordSecurityChecker), soit utiliser `$ composer gdpr/passwordsecuritychecker`

    <?php
        require_once 'vendor/autoload.php';
        extract($_POST, EXTR_OVERWRITE);
        $PasswordSecurityChecker = new PasswordSecurityChecker();
        if(!empty($password) && !$PasswordSecurityChecker->isPasswordValid($password))
            echo $PasswordSecurityChecker->getError();
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Title</title>
        <link rel="stylesheet" href="assets/css/PasswordSecurityChecker.css" />
    </head>
    <body>
        <?php
        $PasswordSecurityChecker->displayDefaultRules();
        ?>
        <form action="" method="post">
            <label>Password:</label>
            <br>
            <input id="password" class="form-control" type="password" name="password" value="<?=$PasswordSecurityChecker->getPassword()?>" />
            <input type="submit" name="submit" value="valider" />
        </form>

        <script src="assets/js/PasswordSecurityChecker.js"></script>
        <script type="text/javascript">
            (function(){
                new PasswordSecurityChecker("#password");
            })();
        </script>
    </body>
    </html>

### Explications

 - Le code <abbr title="PHP Language">PHP</abbr> entre les `lignes 1 et 7` permet d'importer la classe PasswordSecurityChecker puis de vérifier le PWD une fois que le formulaire est validé
 - Le code <abbr title="PHP Language">PHP</abbr> à la `ligne 17` visualise uniquement les règles prédéfinies. C'est à retirer lors de la mise en PROD
 - Le code <abbr title="JavaScript Language">javascript</abbr> sur la `ligne 29` permet de charger le composant sur le champ, en passant en argument l'identifiant du champ