// Variável global para armazenar os dados processados temporariamente
var processedData = '';

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('uploadBox').addEventListener('change', function(event) {
        var fileInput = document.getElementById('fileInput');
        var files = fileInput.files;

        if (files.length > 0) {
            processFile(files[0]);
        }
    });

    document.getElementById('processButton').addEventListener('click', function(event) {
        var fileInput = document.getElementById('fileInput');
        var files = fileInput.files;

        if (files.length > 0) {
            processFile(files[0]);
        } else {
            alert('Por favor, selecione um arquivo para enviar.');
        }
    });
});

function processFile(file) {
    var reader = new FileReader();

    reader.onload = function(event) {
        var content = event.target.result;
        var originalFileName = file.name;
        var processedContent = processarArquivo(content); // Função para processar o arquivo
        processedData = processedContent; // Armazena os dados processados temporariamente
        processModelFile(originalFileName); // Processa o arquivo modelo
    };

    reader.readAsText(file);
}

function processarArquivo(content) {
    // Dividir o conteúdo do arquivo em linhas
    var lines = content.split('\n');
    var processedContent = '';

    // Iterar sobre cada linha e adicionar o shortcode numerado
    for (var i = 0; i < lines.length; i++) {
        // Adicionar o shortcode numerado com três dígitos (ex: [001], [002], ..., [010], [011], ..., [100])
        var shortcode = '[' + ('00' + (i + 1)).slice(-3) + ']';
        processedContent += shortcode + ' ' + lines[i] + '\n';
    }

    return processedContent;
}

function processModelFile(originalFileName) {
    // Carrega o arquivo modelo
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'modelo.txt', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var modelContent = xhr.responseText;
            // Substitui os shortcodes no modelo pelo conteúdo processado
            var processedModelContent = modelContent.replace(/\[\d{3}\]/g, function(match) {
                var index = parseInt(match.slice(1, 4));
                var lines = processedData.split('\n');
                return lines[index - 1] ? lines[index - 1].slice(5) : match; // Remove o shortcode se a linha existir
            });
            // Gera um novo documento com o texto processado
            baixarArquivo(processedModelContent, originalFileName);
        }
    };
    xhr.send();
}

function baixarArquivo(content, originalFileName) {
    var blob = new Blob([content], { type: 'text/plain' });
    
    // Adiciona o sufixo _processado ao nome do arquivo original
    var filenameParts = originalFileName.split('.');
    var newFileName = filenameParts.slice(0, -1).join('.') + '_processado.' + filenameParts.slice(-1);

    // Cria um link para download do arquivo
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = newFileName;

    // Simula um clique no link para iniciar o download
    link.click();
}
