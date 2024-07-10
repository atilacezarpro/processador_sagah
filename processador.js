// Variável global para armazenar os dados processados temporariamente
var processedData = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('processButton').addEventListener('click', function(event) {
        var trailName = document.getElementById('trailName').value.trim();
        if (!trailName) {
            alert('Por favor, insira o nome da trilha.');
            return;
        }

        var fileInput = document.getElementById('fileInput');
        var files = fileInput.files;

        if (files.length > 0) {
            processFiles(files, trailName);
        } else {
            alert('Por favor, selecione um arquivo para enviar.');
        }
    });
});

function processFiles(files, trailName) {
    processedData = []; // Limpa os dados processados anteriores
    var filesProcessed = 0;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();

        reader.onload = (function(file) {
            return function(event) {
                var content = event.target.result;
                var processedContent = processarArquivo(content); // Função para processar o arquivo
                processedData.push(processedContent); // Armazena os dados processados temporariamente

                filesProcessed++;
                if (filesProcessed === files.length) {
                    processModelFiles(trailName);
                }
            };
        })(file);

        reader.readAsText(file);
    }
}

function processarArquivo(content) {
    // Dividir o conteúdo do arquivo em linhas
    var lines = content.split('\n');
    var processedContent = '';

    // Iterar sobre cada linha e adicionar o shortcode numerado
    for (var i = 0; i < lines.length; i++) {
        // Adicionar o shortcode numerado com três dígitos (ex: [001], [002], ..., [010], [011], ..., [100])
        var shortcode = '[' + ('00' + (i + 1)).slice(-3) + ']';
        processedContent += shortcode + lines[i] + '\n'; // Removido o espaço entre shortcode e linha
    }

    return processedContent;
}

function processModelFiles(trailName) {
    // Carrega o arquivo modelo
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'modelo.txt', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var modelContent = xhr.responseText;
            var finalContent = '';

            // Substitui os shortcodes no modelo pelo conteúdo processado
            for (var i = 0; i < processedData.length; i++) {
                var lines = processedData[i].split('\n');
                var processedModelContent = modelContent.replace(/\[\d{3}\]/g, function(match) {
                    var index = parseInt(match.slice(1, 4));
                    return lines[index - 1] ? lines[index - 1].slice(5).trim() : match; // Remove o shortcode se a linha existir e remove espaços extras
                });
                finalContent += processedModelContent + '\n';
            }

            // Gera um novo documento com o texto processado
            var fileName = 'trilha_' + trailName + '.txt';
            baixarArquivo(finalContent, fileName);
        }
    };
    xhr.send();
}

function baixarArquivo(content, filename) {
    var blob = new Blob([content], { type: 'text/plain' });

    // Cria um link para download do arquivo
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    // Simula um clique no link para iniciar o download
    link.click();
}
