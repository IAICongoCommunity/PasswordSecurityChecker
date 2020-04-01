<?php
/**
 * Created by PhpStorm.
 * User: igorcyberdyne
 */


class PasswordSecurityChecker
{
    // Const
    const PASSWORD_MIN_CHARS_SIZE = 8;

    // Index
    const AT_LEAST_ONE_NUMBER = 'AT_LEAST_ONE_NUMBER';
    const AT_LEAST_ONE_LOWERCASE_LETTER = 'AT_LEAST_ONE_LOWERCASE_LETTER';
    const AT_LEAST_ONE_CAPITAL_LETTER = 'AT_LEAST_ONE_CAPITAL_LETTER';
    const AT_LEAST_ONE_SPECIAL_CHARACTER = 'AT_LEAST_ONE_SPECIAL_CHARACTER';
    const AT_LEAST_EIGHT_CHARACTER = 'AT_LEAST_EIGHT_CHARACTER';

    const AT_LEAST_ONE_NUMBER_LABEL = "Au moins un chiffre (0-9)";
    const AT_LEAST_ONE_LOWERCASE_LETTER_LABEL = 'Au moins une minuscule (a-z)';
    const AT_LEAST_ONE_CAPITAL_LETTER_LABEL = 'Au moins une majuscule (A-Z)';
    const AT_LEAST_ONE_SPECIAL_CHARACTER_LABEL = 'Au moins un caratère spécial (ex: $ @ & + - / # _ ? !)';
    const AT_LEAST_EIGHT_CHARACTER_LABEL = 'Au moins %d caractères';

    const REG_EXP_AT_LEAST_ONE_NUMBER = '/(\d+){1,}/';
    const REG_EXP_AT_LEAST_ONE_LOWERCASE_LETTER = '/(?=.*[a-z]{1,})/';
    const REG_EXP_AT_LEAST_ONE_CAPITAL_LETTER = '/(?=.*[A-Z]{1,})/';
    const REG_EXP_AT_LEAST_ONE_SPECIAL_CHARACTER = '/(?=.*[\W\_\s]{1,})/';
    const REG_EXP_AT_LEAST_EIGHT_CHARACTER = '/.{8,}/';

    private static $checkRules = [
        self::AT_LEAST_EIGHT_CHARACTER => [
            'id' => self::AT_LEAST_EIGHT_CHARACTER, 'regex' => self::REG_EXP_AT_LEAST_EIGHT_CHARACTER,
            'isValid' => 0, 'label' => self::AT_LEAST_EIGHT_CHARACTER_LABEL
        ],
        self::AT_LEAST_ONE_NUMBER => [
            'id' => self::AT_LEAST_ONE_NUMBER, 'regex' => self::REG_EXP_AT_LEAST_ONE_NUMBER,
            'isValid' => 0, 'label' => self::AT_LEAST_ONE_NUMBER_LABEL
        ],
        self::AT_LEAST_ONE_LOWERCASE_LETTER => [
            'id' => self::AT_LEAST_ONE_LOWERCASE_LETTER, 'regex' => self::REG_EXP_AT_LEAST_ONE_LOWERCASE_LETTER,
            'isValid' => 0, 'label' => self::AT_LEAST_ONE_LOWERCASE_LETTER_LABEL
        ],
        self::AT_LEAST_ONE_CAPITAL_LETTER => [
            'id' => self::AT_LEAST_ONE_CAPITAL_LETTER, 'regex' => self::REG_EXP_AT_LEAST_ONE_CAPITAL_LETTER,
            'isValid' => 0, 'label' => self::AT_LEAST_ONE_CAPITAL_LETTER_LABEL
        ],
        self::AT_LEAST_ONE_SPECIAL_CHARACTER => [
            'id' => self::AT_LEAST_ONE_SPECIAL_CHARACTER, 'regex' => self::REG_EXP_AT_LEAST_ONE_SPECIAL_CHARACTER,
            'isValid' => 0, 'label' => self::AT_LEAST_ONE_SPECIAL_CHARACTER_LABEL
        ],
    ];

    private $error;
    private $password;

    public function __construct($pPassword = ""){
        $this->error = "";
        $this->password = $pPassword;
        self::$checkRules[self::AT_LEAST_EIGHT_CHARACTER]['label'] = str_replace('%d', self::PASSWORD_MIN_CHARS_SIZE, self::$checkRules[self::AT_LEAST_EIGHT_CHARACTER]['label']);
    }

    public function getPassword(){
        return $this->password;
    }

    public function displayDefaultRules($details = false){
        $ul = "<p>Vous devez remplir les critères ci-dessous pour avoir un mot de passe sécurisé</p><ul>";
        foreach(self::$checkRules as $index => $rule){
            if($details)
                $li = "<li>".$rule['label']."</li>";
            else
                $li = "<li>Label : ".$rule['label']."<ul><li>regex : ".$rule['regex']."</li><li>ID : ".$rule['id']."</li></ul></li>";
            $ul .= $li;
        }
        $ul .= "</ul>";
        echo $ul;
    }

    /**
     * @param $pPassword
     * @return bool
     */
    public function isPasswordValid($pPassword = ""){
        $checkRules = self::$checkRules;
        $globalErrorsMessage = [];
        $this->error = '';
        $this->password = $pPassword;

        foreach($checkRules as $indexRule => $rule){
            $isMatch = preg_match($rule['regex'], $pPassword, $extract, PREG_OFFSET_CAPTURE);
            $checkRules[$indexRule]['isValid'] = $isMatch;
            if(!$isMatch)
                array_push($globalErrorsMessage, preg_replace('/(Au moins)/i', '', $checkRules[$indexRule]['label']));
        }

        $size = count($globalErrorsMessage);
        if($size > 0){
            $lastError = '';
            if($size > 1){
                // On modifie la dernière entrée pour ajouter le "et" si il y'a plus d'une erreur
                $lastError = " et " . $globalErrorsMessage[$size - 1];
                $globalErrorsMessage = array_slice($globalErrorsMessage, 0, $size - 1);
            }
            $this->error = 'Votre mot de passe doit contenir au moins <strong>' . implode(',', $globalErrorsMessage) . $lastError . '</strong>';
        }
        return empty($this->error);
    }

    /**
     * @return string
     */
    public function getError(){return $this->error;}

}