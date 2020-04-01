/**
 * Created by igorcyberdyne.
 */

/**
 * Utilities
 */
Function.prototype.proxy = function(pInstance)
{
    var ref = this;
    return function(){ref.apply(pInstance, arguments);};
};

/**
 * Base Class
 * Overriding - toString - whatever
 */
function Class(){}
// Permet d'ajouter des méthode à des constructeurs existant
Class.define = function(pTarget, pPrototype) {
    for(var k in pPrototype)
        pTarget.prototype[k] = pPrototype[k];
};

/**
 * @description Permet de sécuriser le MDP, ci-dessous la procédure globale de fonctionnement
 * 1. Initialisation des variable et configuration des règles
 * 2. Construction des règles dans le front à partir des règles par defaut
 * 3. Mise à jour des statut des règles lors de la saisie des valeur du MDP
 * 4. Reconstruction des règles dans le DOM ==> 2.
 * 5. Mise à jour des règles dans le front selon le statut des règles
 *
 * @param pPasswordFieldTargetSelector
 * @param pParams : {}
 * @returns {PasswordSecurityChecker}
 * @constructor
 */

function PasswordSecurityChecker(pPasswordFieldTargetSelector, pParams){

    var _self = this;
    _self.passwordFieldSelector = document.querySelector(pPasswordFieldTargetSelector);

    if(!_self.passwordFieldSelector){
        console.log(pPasswordFieldTargetSelector + ' not defined');
        return;
    }

    _self.componentIdReference = "password-security-checker";
    _self.labelErrorMessageIdReference = _self.componentIdReference + "-error-message";

    _self.passwordMinCharsSize = pParams && pParams.passwordMinCharsSize ? pParams.passwordMinCharsSize : PasswordSecurityChecker.PASSWORD_MIN_CHARS_SIZE;
    PasswordSecurityChecker.AT_LEAST_EIGHT_CHARACTER_LABEL = PasswordSecurityChecker.AT_LEAST_EIGHT_CHARACTER_LABEL.replace(/(\%d)/, _self.passwordMinCharsSize);
    _self.hasEye = pParams && pParams.hasEye;
    _self.passwordFieldSelector.setAttribute('placeholder', _self.passwordMinCharsSize + " caractères minimum");

    if(_self.hasEye){
        _self.img = document.createElement('img');
        _self.img.setAttribute('class', _self.componentIdReference + ' img-eye-close');
        _self.img.setAttribute('id', 'img-eye-close');
        _self.img.setAttribute('src', PasswordSecurityChecker.IMG_EYE_CLOSE_AS_BASE64);
        var height = (_self.passwordFieldSelector.offsetHeight*80)/100,
            top = _self.passwordFieldSelector.offsetTop + (_self.passwordFieldSelector.offsetTop*(0.60))/100;
        _self.img.style.width = height+"px";
        _self.img.style.height = height+"px";
        _self.img.style.left = (_self.passwordFieldSelector.offsetLeft+_self.passwordFieldSelector.offsetWidth)-(height+2)+"px";
        _self.img.style.top = top+"px";
        _self.passwordFieldSelector.parentElement.append(_self.img);

        _self.img_eye_close = true;
    }

    // On index le tableau des règles
    _self.checkBoxInputRules = {};
    _self.checkBoxInputRules[PasswordSecurityChecker.AT_LEAST_ONE_NUMBER] = {
        'id' : PasswordSecurityChecker.AT_LEAST_ONE_NUMBER,
        'label' : PasswordSecurityChecker.AT_LEAST_ONE_NUMBER_LABEL,
        'regex' : PasswordSecurityChecker.REG_EXP_AT_LEAST_ONE_NUMBER, 'isValid' : 0
    };

    _self.checkBoxInputRules[PasswordSecurityChecker.AT_LEAST_ONE_LOWERCASE_LETTER] = {
        'id' : PasswordSecurityChecker.AT_LEAST_ONE_LOWERCASE_LETTER,
        'label' : PasswordSecurityChecker.AT_LEAST_ONE_LOWERCASE_LETTER_LABEL,
        'regex' : PasswordSecurityChecker.REG_EXP_AT_LEAST_ONE_LOWERCASE_LETTER, 'isValid' : 0
    };

    _self.checkBoxInputRules[PasswordSecurityChecker.AT_LEAST_ONE_CAPITAL_LETTER] = {
        'id' : PasswordSecurityChecker.AT_LEAST_ONE_CAPITAL_LETTER,
        'label' : PasswordSecurityChecker.AT_LEAST_ONE_CAPITAL_LETTER_LABEL,
        'regex' : PasswordSecurityChecker.REG_EXP_AT_LEAST_ONE_CAPITAL_LETTER, 'isValid' : 0
    };

    _self.checkBoxInputRules[PasswordSecurityChecker.AT_LEAST_ONE_SPECIAL_CHARACTER] = {
        'id' : PasswordSecurityChecker.AT_LEAST_ONE_SPECIAL_CHARACTER,
        'label' : PasswordSecurityChecker.AT_LEAST_ONE_SPECIAL_CHARACTER_LABEL,
        'regex' : PasswordSecurityChecker.REG_EXP_AT_LEAST_ONE_SPECIAL_CHARACTER, 'isValid' : 0
    };

    _self.checkBoxInputRules[PasswordSecurityChecker.AT_LEAST_EIGHT_CHARACTER] = {
        'id' : PasswordSecurityChecker.AT_LEAST_EIGHT_CHARACTER,
        'label' : PasswordSecurityChecker.AT_LEAST_EIGHT_CHARACTER_LABEL,
        'regex' : PasswordSecurityChecker.REG_EXP_AT_LEAST_EIGHT_CHARACTER, 'isValid' : 0
    };

    _self.errors = null;

    // Label pour le message d'erreur
    _self.label = document.querySelector('#' + this.labelErrorMessageIdReference);
    _self.label = document.createElement('label');
    _self.label.setAttribute('id', this.labelErrorMessageIdReference);
    _self.label.setAttribute('class', this.componentIdReference + ' label-error-message');

    // Handler
    _self.passwordFieldSelector.addEventListener(PasswordSecurityChecker.KEYUP, _self.checkPasswordRule.proxy(_self));
    _self.passwordFieldSelector.addEventListener(PasswordSecurityChecker.BLUR, _self.checkPasswordRule.proxy(_self));
    if(_self.hasEye)
        _self.img.addEventListener('click', _self.displayClearPassword.proxy(_self));

    var form = _self.passwordFieldSelector.form;
    if(form)
        form.addEventListener('submit', _self.validatePassword.proxy(_self));

    _self.buildInputRules();

    // On insert le label juste au dessus des règles
    document.querySelector('#' + this.componentIdReference).parentElement.insertBefore(_self.label, document.querySelector('#' + this.componentIdReference));

    // Method

    return _self;
}

Class.define(PasswordSecurityChecker, {

    /**
     * @description Permet de mettre à jour le statut des règles selon la valeur rentrée dans le champ.
     * Cette méthode est un handler utilsé lors de l'event KEYUP et BLUR sur le champ ciblé
     *
     * @param e
     */
    checkPasswordRule : function(e){
        var _self = this;

        if(e.type == PasswordSecurityChecker.KEYUP){
            if( e.key == 'ArrowUp' || e.key == 'ArrowDown' || e.key == 'ArrowLeft' || e.key == 'ArrowRight' || e.key == 'Control'
                || (e.ctrlKey == true && e.key == 'a') || (e.ctrlKey == true && e.key == 'c') )
                return ;

            Object.keys(_self.checkBoxInputRules).forEach(function(indexRule){
                var isMatch = e.target.value.match(_self.checkBoxInputRules[indexRule].regex);
                _self.checkBoxInputRules[indexRule].isValid = isMatch ? 1 : 0;
            });
        }

        _self.buildInputRules();
        _self.validatePassword();
    },

    /**
     * @description Permet d'afficher la valeur en clair dans le champ password
     *
     * @param e
     */
    displayClearPassword : function(e){
        this.img_eye_close = !this.img_eye_close;
        this.passwordFieldSelector.setAttribute('type', this.img_eye_close ? 'password' : 'text');
        this.img.setAttribute('src', this.img_eye_close ? PasswordSecurityChecker.IMG_EYE_CLOSE_AS_BASE64 : PasswordSecurityChecker.IMG_EYE_OPEN_AS_BASE64);
    },

    /**
     * @description Permet de construire le label avec lequel afficher le message d'erreur dans le DOM
     *
     * @param event
     */
    validatePassword : function(event){
        this.label.innerHTML = "";
        // S'il le password n'est pas, on affiche des informations destinées à l'utilisateur
        if(!this.isPasswordValid()){
            var errors = this.getErrors();

            // On affiche le message d'erreur
            if(errors){
                this.label.innerHTML = errors;
                if(event){
                    // Cas de l'appel de la méthode par un handler on bloque l'envoi du formulaire
                    event.preventDefault();

                    if(this.hasEye){
                        // On cache le mot de passe lorsqu'on soumet le formulaire
                        if(!this.img_eye_close)
                            this.displayClearPassword();
                    }
                }
            }
        }
    },

    /**
     * @description Retourne le message d'erreur
     * @returns {string|*}
     */
    getErrors : function(){
        return this.errors;
    },

    /**
     * @description Cette méthode permet de vérifier les règles non valides respectivement
     * par leur statut, puis de construire le message d'erreur à afficher
     *
     * @returns {*}
     */
    isPasswordValid : function(){
        this.errors = null;

        var _self = this, globalErrorsMessage = [];
        Object.keys(_self.checkBoxInputRules).forEach(function(index){
            if(_self.checkBoxInputRules[index].isValid == 0){
                globalErrorsMessage.push( _self.checkBoxInputRules[index].label.replace(/(Au moins)/i, ''));
            }
        });

        var isValid = true;
        if(globalErrorsMessage.length > 0){
            var lastError = '';
            if(globalErrorsMessage.length > 1){
                lastError = " et " + globalErrorsMessage[globalErrorsMessage.length - 1];
                globalErrorsMessage = globalErrorsMessage.slice(0, globalErrorsMessage.length - 1);
            }
            this.errors = 'Votre mot de passe doit contenir au moins' + globalErrorsMessage.join(',') + lastError;
            isValid = false;
        }
        return isValid;
    },

    /**
     * @description Construit la liste des règles
     */
    buildInputRules : function(){
        var _self = this, parentDiv;

        // Build div
        if(document.querySelector('#' + _self.componentIdReference))
            document.querySelector('#' + _self.componentIdReference).remove();

        parentDiv = document.createElement('div');
        parentDiv.setAttribute('id', _self.componentIdReference);
        parentDiv.setAttribute('class', _self.componentIdReference);

        Object.keys(_self.checkBoxInputRules).forEach(function(index){
            var inputRule = _self.checkBoxInputRules[index];
            var divItem = document.createElement('div'), label = document.createElement('label'), img = document.createElement('img');

            img.setAttribute('src', _self.checkBoxInputRules[index].isValid ? PasswordSecurityChecker.IMG_CHECK_AS_BASE64 : PasswordSecurityChecker.IMG_UNCHECK_AS_BASE64);
            img.setAttribute('class', "img-checkable img-uncheck");

            label.setAttribute('class', "checkbox-label " + (_self.checkBoxInputRules[index].isValid == 1 ? "checkbox-label-green" : ""));
            label.innerHTML = inputRule.label;

            divItem.setAttribute('id', inputRule.id);
            divItem.setAttribute('class', 'checkbox-item');
            divItem.appendChild(img);
            divItem.appendChild(label);

            parentDiv.appendChild(divItem);

        });

        var parentComponent = _self.passwordFieldSelector.parentElement.parentElement,
            parentElement = parentComponent,
            referenceElement = parentComponent.lastElementChild;

        (parentElement ? parentElement : referenceElement.parentElement).insertBefore(parentDiv, referenceElement);
    }
});

// Const
PasswordSecurityChecker.PASSWORD_MIN_CHARS_SIZE = 8;

// Index
PasswordSecurityChecker.AT_LEAST_ONE_NUMBER = 'AT_LEAST_ONE_NUMBER';
PasswordSecurityChecker.AT_LEAST_ONE_LOWERCASE_LETTER = 'AT_LEAST_ONE_LOWERCASE_LETTER';
PasswordSecurityChecker.AT_LEAST_ONE_CAPITAL_LETTER = 'AT_LEAST_ONE_CAPITAL_LETTER';
PasswordSecurityChecker.AT_LEAST_ONE_SPECIAL_CHARACTER = 'AT_LEAST_ONE_SPECIAL_CHARACTER';
PasswordSecurityChecker.AT_LEAST_EIGHT_CHARACTER = 'AT_LEAST_EIGHT_CHARACTER';

// Label for each index
PasswordSecurityChecker.AT_LEAST_ONE_NUMBER_LABEL = "Au moins un chiffre (0-9)";
PasswordSecurityChecker.AT_LEAST_ONE_LOWERCASE_LETTER_LABEL = 'Au moins une minuscule (a-z)';
PasswordSecurityChecker.AT_LEAST_ONE_CAPITAL_LETTER_LABEL = 'Au moins une majuscule (A-Z)';
PasswordSecurityChecker.AT_LEAST_ONE_SPECIAL_CHARACTER_LABEL = 'Au moins un caratère spécial (ex: $ @ & + - / # _ ? !)';
PasswordSecurityChecker.AT_LEAST_EIGHT_CHARACTER_LABEL = 'Au moins %d caractères';

// RegExp
PasswordSecurityChecker.REG_EXP_AT_LEAST_ONE_NUMBER = /(\d+){1,}/;
PasswordSecurityChecker.REG_EXP_AT_LEAST_ONE_LOWERCASE_LETTER = /(?=.*[a-z]{1,})/;
PasswordSecurityChecker.REG_EXP_AT_LEAST_ONE_CAPITAL_LETTER = /(?=.*[A-Z]{1,})/;
PasswordSecurityChecker.REG_EXP_AT_LEAST_ONE_SPECIAL_CHARACTER = /(?=.*[\W\_\s]{1,})/;
PasswordSecurityChecker.REG_EXP_AT_LEAST_EIGHT_CHARACTER = /.{8,}/;

PasswordSecurityChecker.KEYUP = 'keyup';
PasswordSecurityChecker.BLUR = 'blur';

// Image as base64
PasswordSecurityChecker.IMG_CHECK_AS_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUoAAAE5CAIAAAB5/f49AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAA0TSURBVHhe7d1PiJ3VGYBxbZJSQ+gEmXQxFVSYCSQrV1ER4koormwoCm7chWCguBZdtWQdhATJzo3QUqWrImRlNkZXriYwIzSLkk2CJEFUMGH6tuf0dszM3Pnu951z3j/n+RHwvpugN+fhfDPxvvP41tbWYwAi+kX+J4BwyBsIi7yBsMgbCIu8gbDIGwiLvIGwyBsIi7yBsMgbCIu8gbDIGwiLvIGwyBsIi7yBsMgbCIu8gbDIGwiLvIGwyBsIi7yBsMgbCIu8gbDIGwiLvIGwyBsIi7yBsMgbCIu8gbDIGwiLvIGwyBsIi7zRo6++X79059M8xEXe6I60/co377x768PwhZM3+pLaTq/DF07e6Mj2tpPYhZM3erGz7SRw4eSNLuzVdhK1cPJGfPPbTkIWTt4IbkjbSbzCyRuRDW87CVY4eSOsRdtOIhVO3ohpXNtJmMLJGwFNaTuJUTh5I5rpbScBCidvhFKq7UQK//u9a3lw6PGtra38EnCubNszV1cvnjp8Mg+ucHsjiEptC/lt5TfPgyvkjQjqtZ04LZy84V7tthOPhZM3fGvTduKucPKGYy3bTnwVTt7wqn3biaPCyRsuabWdeCmcvOGPbtuJi8LJG85YaDuxXzh5wxM7bSfGCydvuGGt7cRy4eQNH2y2nZgtnI+UwAHLbc/cOPHxyqHlPNjA7Q3rXLQtXtg4e+unO3mwgbxhmpe2xb2H31krnLxhl6O2E2uFkzeMctd2Yqpw8oZFTttO7BRO3jDHdduJkcLJG7YEaDuRwk9vvq1bOHnDkDBtJ7cf3NUtnLxhRbC2E93CyRsmhGw7USycvKEvcNuJVuHkDWXh205UCidvaOqk7aR94XxiDGq6anvm2MGj35z8ax4q4/aGjj7bFnKHv7hxNg+VkTcUdNt2sv7jzTaFkzda67ztpE3h5I2maHumQeHkjXZo+xG1CydvNELbu6paOHmjBdqeQwp/efN8Hooib1RH2/v6+ofNGoWTN+qi7YFqFE7eqIi2F1K8cPJGLbQ9QtnCyRtV0PZoBQsnb5RH2xOVKpy8URhtFyGFv3Hz/TyMRd4oibYL+uz+l3/818U8jELeKIa2i/vo239MKZy8UQZtVzKlcPJGAbRd1ejCyRtT0XYD4wonb0xC282MKJy8MR5tNyaFv3vrwzwMQN4YibZV/PaXv8mvBiBvjEHbKi6snDu/fCYPA5A3FkbbKhZtW5A3FkPbKka0LcgbC6BtFePaFuSNoWhbxei2BXljENpWMaVtQd7YH22rmNi2IG/sg7ZVTG9bkDfmoW0VRdoW5I090baKUm0L8sbuaFtFwbZFF3nLSc2vMMytn+784Z/v5QGtlG1bxM873UJtflp6DNL2Cxtn7z38Ls9oonjbInjesyfMNj8tPQDaVlGjbRE570e+eqTwfdG2ikpti7B57/qdIQqfg7ZV1GtbxMx717YTCt8Vbauo2rYImPecthMpfHX9dTnQee4ebauo3baIlve+bSe3H9w9vfk2hQvaVtGgbREq74FtJxQuaFuFhN2gbREn74XaTjovnLZVSNhydeehsiB5j2g76bZw2lbRsm0RIe/RbScdFk7bKhq3LdznPbHtpKvCaVtF+7aF77yLtJ10Ujhtq1BpWzjOu2DbSfjCaVuFVtvi8a2trfzSleJtzywdOHL9+JWVQ8t5joK2VSi2LVze3vXaFhKAZBDsDqdtFbptC395V207CVY4batQb1s4y7tB20mYwmlbhYW2hae8m7WdBCictlUYaVu4ybtx24nrwmlbhZ22hY+8VdpOnBZO2ypMtS0c5K3YduKucNpWYa1tYT1v9bYTSeXEjTflXybPhtG2CoNtC9N5G2l7Rv5ljBdO2ypsti3s5m2t7cRy4bStwmzbwmjeNttObBZO2yosty0s5m257cRa4bStwnjbwtxHShyd1KurF08dPpkHPbStwn7bwtbt7eukWrjDaVuFi7aFobw9nlTdwmlbxVtPvuqibWElb78nVatw2lYhbX/wlOlvDG1nIm/vJ7V94bStwlfbQj/vGCe1ZeG0rcJd20I570gntU3htK3CY9tCM+94J7V24bStwmnbQi3vqCe1XuG0rcJv20In79gntUbhtK3CddtCIe8eTmrZwmlbhfe2Reu8+zmppQqXd+yljXO03ViAtkXTvHu7haTwS3c+zcMo8o6d3nz724f384wmYrQt2uXd5xPmu7c+HF14avv2g7t5RhNh2haN8u6z7WRc4bStIlLbokXePbedLFo4basI1raonjdtJ8ML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";
PasswordSecurityChecker.IMG_UNCHECK_AS_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfjCxkOMR2pAKzpAAAAKklEQVRIx2NgGAWjYBRQBTAyeFJqwH/KDGCi1AsDbwDFgTgKRsEooBIAABvRAZvQOteSAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTExLTI1VDE0OjQ5OjI5KzAwOjAwDjV6xgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0xMS0yNVQxNDo0OToyOSswMDowMH9ownoAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC";

PasswordSecurityChecker.IMG_EYE_OPEN_AS_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAGYktHRAD/AP8A/6C9p5MAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMDUtMTVUMTQ6NTY6MzMtMDU6MDCNmmpUAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE1LTA1LTE1VDE0OjU2OjMzLTA1OjAw/MfS6AAAAzRJREFUWEftV01OKkEQbtAEV8pCTCCBGMETCAnIDhfgFpZ6AOEiwgaPgnkExQMYCXAL3BO3/vWbr6ZrqGaGARN5q/cllaarqr+qnq7+IfL19aWVgNZaRSIR03OxLR0JEoBCGiS2qUMbpV8OthmIsaxDnxL4TVJgUx0Q/ReBwnRWDQDrCKLRqM/OgN/397fpuQjjI9m0CHd2doxGqYeHBzUej9VsNiN7Op1WxWJRXV5eGg+lHN5QPoBaJPD5+ak/Pj6olQIdYzqd6lKphExD5fz8nHwZy3yyD6EEggwQ4O3tTZ+cnAQGC5NcLqfn8zlxgGtVDBWkNMui2+22R+h8LitAoVDQ19fX+urqSufzecsm5fb2lric2rBiICHE8ZaAhRFEmkql9NPT0Hj4MRgMdDKZ9I0DF4ODo/UlwDg4OPCR9Pt/jFUTQbPZ1Nlslj71zc2N99WAXq/nGx+Px411URdWAoxYLGYNPD4+NhYXz8/Pll3KaDQyXi6c3WHZ9/ZixrJIghLg7BOJhDWgVquRnvH+/m7Zg0R+CaBarZKea+jo6Ij0PHFKAKhUKhZRo9EgPTsCrVbL8kGRdjodS4flADCGuev1uuVzcXFBethxMOi7uzvLAQPYAURYcyCXy3o+CM6QSaAmAIxjATAh9oF0u13Se5cRYJ1QBrAt+gu99Fk+fhlyLPvIcYSfLAE+r/TBzLHPpa7ZbJEv73OAZ+8EpxaxAPBaRYgCkWQoIAkaIOxBwskylovw8PCQ9Dwx7yRkYKtIwkwmYywusNWkXYpzQRkvF7wNOTi2OCPwJGTg0JDEkPv7e2N1j1UsBwoOgkOJvyLQ7/e9cRx8f3/fWN3giOdLgKsdwFnPJCw4ZnHcrsLj4yMd18vjzs7OjMciuC8BacAMgeUCkwJSXETrLiPeruCUMVgogSADBMCVenp6GkgeJlgaXOUAuFbFCLyOpTMDjww8NoKCSSmXy3oymZhRq4NDh8lv/Cbc3d01PaWGw6F6eXlRr6+vTg9Psgw9yZy7w3Vw4PBSu4oPOhKZQJgz4yeP0nV8aL0E1jkzflv3/4+J99+Qsa1AElIXMYcOKUkhnLevU+ovpXjt4TxIoDQAAAAASUVORK5CYII=";

PasswordSecurityChecker.IMG_EYE_CLOSE_AS_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAGYktHRAD/AP8A/6C9p5MAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMDUtMTVUMTQ6NTY6MjYtMDU6MDATCEVtAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE1LTA1LTE1VDE0OjU2OjI2LTA1OjAwYlX90QAABBNJREFUWEetVzsvbFEU3jMIGo8EiVciIlEJiUcMnedcHYLCo78TP0FFJDT8AtQKkdwJRiQ6iaBV6VBoNRLPffe3zl5n1j7njDtcX7KyZ6/Xt/b7TOz9/V0rAa21isVitufhO7p4PE4t8PHxYX95YD8IeUEBYUfuf1cH8qWlJTU+Pk469KP8IDQDfueLo2RIXUFBAbXS5+DgQI2Njam3t7dQrD8DXyViROkmJibsLw/Dw8PUBv2A+E+SY/S3t7dqf3/fapRaXV1VRUVFysy01XjgWH8JGP8iwnoG7RKNjY3q/v7e9rxYrHsUR6gANkiwjtcWODw8VBcXF+ru7o6Sg3RoaEg9PDyomZkZ66VUJpNRo6OjzuglB7UowGwO/fr6Sq0U6BhXV1c6kUig0rykry9BccF8sg+hAqIMEODx8VE3NzdHknwm7e3tFAsgVy4OHI2Q0i6LXltb8xOa6XIIuru79dzcnF5YWNCdnZ2OTcr6+jrlMkvlcKAg8PhLwMLo6uoKJaurq9PHxxnrkcXU1FTIVwqKZTA52lABjPLy8lCSdPqPtXpJFhcXdWtrK0017DxDW1tb+uTkxImFVFZW2ujsvnAKYBQXFzuBTU1N1uLh7OzMsUOYvLCw0Hp5aGhocPxKSkqsJVsEFQABqqurnYBkMkl6xsvLi2OHyL1hjib5YYoZIyMjjl9NTQ3peeBUADAwMOAngkxOTpJezlAq9dvxkeTYiIDc7ZzbXM1O3ODgIOlhx8WgNzc3HQcEsAMS8YhaWlp8H0kOeXp6Ih8mlwJgQNJ/Y2OD9P5jBJikTgvAFtSj5RjAbEhVWlqK2bQaDzKWn2GZm8DTFFyC4CwAqVTK8WEBcp1zgEdvyKkFFwA/ZxNig8jE5hklPQMk0g7Z2dkhW5CcYd4C8mPyqqoq0vPA/JuQgaMiCXCUJGSRfLY5RzCXeaTIj8lxxBk8QzQDwcCKigqfhAWXy/b2tqO7vr4mf8TyLALpdNr3YfKysjJrzZ6UUAFy6np6evwkUTI9PW09szg6OqLrOujLRxRg8lAB0oC1BuRjxMIjwlsxPz+vZ2dnI98NFuQAkFNysFABUQYIgCe1o6ODkjF5PoI7I5/nOOc3IWCKU2btlNk81Gf9Z+jv71eXl5fq5uaGYpEjFwd0n34T4jPMPL8qmfxFfWB3d1fV1tYqsynp2w+++CTr7e01fknr5RUPfEoeLEA6ow1+gNbX1zsfnEEgnm88QOZjhDjol0HQGeQrKyu25+H8/JxajE6KWUtqv0IOUN8EYoc6Bkz98/OzMpeS1Xh/Nvb29ohIIh8iIEoHRG5C4PT01P7yAPIg/oecdTEcBasjsIH/B+APZltbm1peXnZG/yPkEHvpkBKQztgHDF7fKL/v65T6CzbQ8aPeiPzZAAAAAElFTkSuQmCC";

