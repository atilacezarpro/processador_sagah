// Variável global para armazenar os dados processados temporariamente
var processedData = '';

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

function processFile(file) {
    var reader = new FileReader();

    reader.onload = function(event) {
        var content = event.target.result;
        var originalFileName = file.name;
        var processedContent = processarArquivo(content); // Função para processar o arquivo
        processedData = processedContent; // Armazena os dados processados temporariamente
        processModelFile(); // Processa o arquivo modelo
    };

    reader.readAsText(file);
}

function processarArquivo(content) {
    // Dividir o conteúdo do arquivo em linhas
    var lines = content.split('\n');
    var processedContent = '';

    // Iterar sobre cada linha e adicionar o shortcode numerado
    for (var i = 0; i < lines.length; i++) {
        // Adicionar o shortcode numerado com dois dígitos (ex: [01], [02], ..., [10], [11], ...)
        var shortcode = '[' + ('0' + (i + 1)).slice(-2) + ']';
        processedContent += shortcode + ' ' + lines[i] + '\n';
    }

    return processedContent;
}

function processModelFile() {
    // Carrega o arquivo modelo
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'modelo.txt', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var modelContent = xhr.responseText;
            // Substitui os shortcodes no modelo pelo conteúdo processado
            var processedModelContent = modelContent.replace(/\[\d{2}\]/g, function(match) {
                var index = parseInt(match.slice(1, 3));
                return processedData.split('\n')[index - 1].slice(4); // Remove o shortcode
            });
            // Gera um novo documento com o texto processado
            baixarArquivo(processedModelContent, 'documento_processado.txt');
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
