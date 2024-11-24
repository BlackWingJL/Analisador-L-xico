var FileSystem = require('file-system');

const Delimitadores = require('./Linguagem/Delimitadores.js');
const operadores = require('./Linguagem/Operadores.js');
const PalavrasReservadas = require('./Linguagem/PalavrasReservadas.js');

const code = FileSystem.readFileSync('./Data/InputCode.c', 'utf8');

let trail = "nada";
let current_token = "";
let $VerifyBlock = "";
let commentLine = false;
let commentBlock = false;
let backslash = false;
let open_quotes = false;
let type_open_quotes = "";
let cvsFile = '';

for (let char of code) {
    if (open_quotes) {
        current_token += char;

        if (!backslash && char == type_open_quotes) {
            open_quotes = !open_quotes;
            trail = "literal";
            current_token = checkToken(current_token);
        }
        if (!backslash && char == '\\')
            backslash = true;
        else
            backslash = false;

        trail = "Delimitadores";
    } else if (commentBlock) {
        if (char == "*") {
            $VerifyBlock = "*";
        } else {
            $VerifyBlock += char;
        }

        current_token += char;
        if ($VerifyBlock == '*/') {
            commentBlock = false;
            trail = "comentario";
            current_token = checkToken(current_token);
        }
    } else if (commentLine) {
        if (char == "\n" || char == "\r") {
            commentLine = false;
            trail = "comentario";
            current_token = checkToken(current_token);
        } else {
            current_token += char;
        }
    } else if (char == "\n" || char == "\r") {
        // Ignore newline and carriage return
    } else {
        if (!is_space(char)) {

            if (!is_operator(char)) {

                if (!is_delimiter(char)) {

                    if (!is_number(char)) {
                        if (char == "." && is_number(current_token)) {
                            current_token += char;
                            trail = "constante";
                        } else {
                            if (trail != "letra")
                                current_token = checkToken(current_token);

                            current_token += char;
                            trail = "letra";
                        }
                    } else if (is_number(current_token[0]) && is_number(char)) {
                        current_token += char;
                        trail = "constante";
                    } else {
                        current_token = checkToken(current_token);
                        current_token += char;
                        trail = "constante";
                    }
                } else {
                    if (char == '"' || char == '\'') {
                        type_open_quotes = char;
                        current_token = char;
                        open_quotes = !open_quotes;
                    } else {
                        current_token = checkToken(current_token);
                        current_token += char;
                        trail = "delimitador";
                        current_token = checkToken(current_token);
                    }
                }
            } else if (operadores.includes(current_token[0])) {
                current_token += char;
                trail = "operador";
                if (is_commentLine())
                    commentLine = true;
                if (is_commentBlock())
                    commentBlock = true;
            } else {
                current_token = checkToken(current_token);
                current_token += char;
                trail = "operador";
            }
        } else {
            current_token = checkToken(current_token);
            trail = "nada";
        }
    }

    if (current_token != '')
        checkToken(current_token);

    FileSystem.writeFileSync('./Data/OutputTable.csv', cvsFile, function (err) { });

    function checkToken(current_token) {
        if (current_token !== '') {
            switch (trail) {
                case "comentario":
                    insertTable(current_token, 'Comentário');
                    break;
                case "letra":
                    if (PalavrasReservadas.includes(current_token)) {
                        insertTable(current_token, 'Palavra Reservada');
                    } else {
                        insertTable(current_token, 'Identificador');
                    }
                    break;
                case "constante":
                    insertTable(current_token, 'Constante');
                    break;
                case "operador":
                    insertTable(current_token, 'Operador');
                    break;
                case "delimitador":
                    insertTable(current_token, 'Delimitador');
                    break;
                default:
                    break;
            }
        }
        return '';
    }

    function insertTable(id, token_type) {
        var token = "";
        switch (token_type) {
            case 'Identificador':
            case 'Constante Numérica':
            case 'Constante Literal':
                token = `<${token_type}, ${id}>`;
                break;

            case 'comentário':
                token = `<${token_type}, ${id}>`;
                id = 'comentário';
                break;
        }

        cvsFile += `${token};\t ${id};\t ${token_type}\n`;
    }

    function is_space(char) {
        return char === ' ';
    }

    function is_commentLine() {
        return current_token === '//';
    }

    function is_operator(char) {
        return operadores.includes(char);
    }

    function is_delimiter(char) {
        return Delimitadores.includes(char);
    }

    function is_number(char) {
        var n = parseInt(char);
        return Number.isInteger(n);
    }
}
