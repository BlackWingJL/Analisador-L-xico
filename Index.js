const FileSystem = require('file-system');

const operadores = require('./Linguagem/Operadores.js');
const Delimitadores = require('./Linguagem/Delimitadores.js');
const PalavrasReservadas = require('./Linguagem/PalavrasReservadas.js');

const code = FileSystem.readFileSync('./Data/InputCode.c', 'utf8');
let cvsFile = 'Token; Lexema; Descrição\n'; // Cabeçalho do CSV

let trail = "nada";
let current_token = "";
let $VerifyBlock = "";
let commentLine = false;
let commentBlock = false;
let backslash = true;
let open_quotes = false;
let type_open_quotes = "";

for (let char of code) {
    if (open_quotes) {
        current_token += char;

        if (!backslash && char === type_open_quotes) {
            open_quotes = false;
            trail = "literal";
            current_token = checkToken(current_token);
        }

        backslash = char === '\\' && !backslash;
    } else if (commentBlock) {
        current_token += char;

        if ($VerifyBlock === '*' && char === '/') {
            commentBlock = false;
            trail = "comentario";
            current_token = checkToken(current_token);
        }
        $VerifyBlock = char === '*' ? '*' : "";
    } else if (commentLine) {
        if (char === '\n' || char === '\r') {
            commentLine = false;
            trail = "comentario";
            current_token = checkToken(current_token);
        } else {
            current_token += char;
        }
    } else if (char === '\n' || char === '\r') {
        // Ignorar novas linhas sem processar
        current_token = checkToken(current_token);
    } else if (!is_space(char)) {

        if (!is_operator(char)) {

            if (!is_delimiter(char)) {

                if (!is_number(char)) {
                    if (char === '.' && is_number(current_token)) {
                        current_token += char; // Continua construindo o número decimal
                        trail = "constante";
                    } else {
                        if (trail !== "letra") 
                            current_token = checkToken(current_token); // Processa o token anterior

                        current_token += char; // Continua construindo o identificador
                        trail = "letra";
                    }
                } else {
                    current_token += char; // Continua construindo um número
                    trail = "constante";
                }
            } else {
                current_token = checkToken(current_token); // Processa o token anterior
                current_token += char; // Trata o delimitador
                trail = "delimitador";
                current_token = checkToken(current_token); // Processa o delimitador imediatamente
            }
        } else {
            current_token = checkToken(current_token); // Processa o token anterior
            current_token += char; // Trata o operador
            trail = "operador";
        }
    } else {
        current_token = checkToken(current_token); // Processa o token ao encontrar espaço
        trail = "nada";
    }
}
if (current_token != '')
    checkToken(current_token);

// Escreve os tokens acumulados no arquivo apenas uma vez, no final
FileSystem.writeFileSync('./Data/OutputTable.csv', cvsFile);

function checkToken(current_token) {
    current_token = current_token.trim(); // Remove espaços e quebras de linha extras
    if (current_token !== '') {
        switch (trail) {
            case "comentario":
                insertTable(current_token, 'Comentário');
                break;

            case "letra":
                if (PalavrasReservadas.includes(current_token)) {
                    insertTable(current_token, 'Palavra Reservada');
                } else if (current_token != "\n") {
                    insertTable(current_token, 'Identificador');
                }
                break;

            case "operador":
                if (current_token == '=')
                    insertTable(current_token, 'Atribuição');
                else
                    insertTable(current_token, 'Operador');
                break;

            case "constante":
                insertTable(current_token, 'Constante Numérica');
                break;

            case "literal":
                insertTable(current_token, 'Constante Literal');
                break;

            case "delimitador":
                if (current_token === ',')
                    insertTable(current_token, 'Separador');
                else if (current_token === ';')
                    insertTable(current_token, 'Terminador');
                else if (['(', '{', '['].includes(current_token))
                    insertTable(current_token, 'Delimitador - Abertura');
                else if ([')', '}', ']'].includes(current_token))
                    insertTable(current_token, 'Delimitador - Fechamento');
                else
                    insertTable(current_token, 'Delimitador');
                break;
        }
    }
    return ''; // Reseta o token atual
}

function insertTable(id, token_type) {
    var token = "";
    let descricao = token_type;

    switch(token_type) {
        case 'Identificador':
        case 'Constante Numérica':
        case 'Constante Literal':
            token = `<${token_type}, ${id}>`;
            break;

        case 'Comentário':
            token = `<${token_type}, ${id}>`;
            descricao = 'Comentário'; // Para comentários, usamos uma descrição simples
            break;

        default:
            token = `<${id}, >`;
            break;
    }

    cvsFile += `${token};\t ${id};\t ${descricao}\n`;
}

function is_space(char) {
    return char === ' ';
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
