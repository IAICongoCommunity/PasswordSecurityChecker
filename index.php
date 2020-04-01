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