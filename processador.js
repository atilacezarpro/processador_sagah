document.addEventListener('DOMContentLoaded', function() {
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
            var processedContent = processarArquivo(content);
            processedData = processedContent;
            console.log('Processed Data:', processedData); // Linha de depuração
            processModelFile(originalFileName);
        };

        reader.readAsText(file);
    }

    function processarArquivo(content) {
        var lines = content.split('\n');
        var processedContent = '';

        for (var i = 0; i < lines.length; i++) {
            var shortcode = '[' + ('0' + (i + 1)).slice(-2) + ']';
            processedContent += shortcode + ' ' + lines[i] + '\n';
        }

        return processedContent;
    }

    function processModelFile(originalFileName) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'modelo.txt', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var modelContent = xhr.responseText;
                console.log('Model Content:', modelContent); // Linha de depuração
                var processedModelContent = modelContent.replace(/\[\d{2}\]/g, function(match) {
                    var index = parseInt(match.slice(1, 3));
                    var lines = processedData.split('\n');
                    console.log('Index:', index, 'Line:', lines[index - 1]); // Linha de depuração
                    return lines[index - 1] ? lines[index - 1].slice(4) : match;
                });
                console.log('Processed Model Content:', processedModelContent); // Linha de depuração
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

        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = newFileName;

        link.click();
    }
});
