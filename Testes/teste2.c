#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_TOKEN_SIZE 100
#define MAX_LINE_SIZE 1024

// Lista de palavras reservadas
const char *reservedWords[] = {"int", "float", "if", "else", "return", "while", "for", "void"};
const int numReservedWords = 8;

// Lista de operadores
const char operators[] = "+-*/=%<>!&|";

// Lista de delimitadores
const char delimiters[] = ",;(){}[]";

// Funções auxiliares
int isReservedWord(const char *word) {
    for (int i = 0; i < numReservedWords; i++) {
        if (strcmp(word, reservedWords[i]) == 0) {
            return 1;
        }
    }
    return 0;
}

int isOperator(char c) {
    return strchr(operators, c) != NULL;
}

int isDelimiter(char c) {
    return strchr(delimiters, c) != NULL;
}

void classifyToken(const char *token) {
    if (isReservedWord(token)) {
        printf("<PALAVRA RESERVADA, %s>\n", token);
    } else if (isdigit(token[0])) {
        printf("<CONSTANTE NUMÉRICA, %s>\n", token);
    } else if (isalpha(token[0])) {
        printf("<IDENTIFICADOR, %s>\n", token);
    } else {
        printf("<TOKEN INVÁLIDO, %s>\n", token);
    }
}

// Função principal do analisador léxico
void analyzeCode(const char *filename) {
    FILE *file = fopen(filename, "r");
    if (!file) {
        perror("Erro ao abrir o arquivo");
        return;
    }

    char line[MAX_LINE_SIZE];
    while (fgets(line, sizeof(line), file)) {
        char token[MAX_TOKEN_SIZE] = "";
        int tokenIndex = 0;

        for (int i = 0; line[i] != '\0'; i++) {
            char c = line[i];

            // Ignorar espaços
            if (isspace(c)) {
                if (tokenIndex > 0) {
                    token[tokenIndex] = '\0';
                    classifyToken(token);
                    tokenIndex = 0;
                }
                continue;
            }

            // Verificar operadores e delimitadores
            if (isOperator(c) || isDelimiter(c)) {
                if (tokenIndex > 0) {
                    token[tokenIndex] = '\0';
                    classifyToken(token);
                    tokenIndex = 0;
                }
                printf("<%s, %c>\n", isOperator(c) ? "OPERADOR" : "DELIMITADOR", c);
                continue;
            }

            // Construir token
            token[tokenIndex++] = c;
        }

        // Classificar último token da linha
        if (tokenIndex > 0) {
            token[tokenIndex] = '\0';
            classifyToken(token);
        }
    }

    fclose(file);
}

int main() {
    char filename[MAX_TOKEN_SIZE];
    printf("Digite o nome do arquivo de entrada: ");
    scanf("%s", filename);

    analyzeCode(filename);

    return 0;
}
