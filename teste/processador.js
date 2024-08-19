var processedData = [];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('processButton').addEventListener('click', function(event) {
        var trailName = document.getElementById('trailName').value.trim();
        if (!trailName) {
            alert('Por favor, insira o número da trilha.');
            return;
        }

        var fileInput = document.getElementById('fileInput');
        var files = fileInput.files;

        if (files.length > 0) {
            processFiles(files, trailName);
        } else {
            alert('Por favor, selecione um ou mais arquivo(s) para enviar.');
        }
    });
});

function processFiles(files, trailName) {
    processedData = [];
    var filesProcessed = 0;

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();

        reader.onload = (function(file) {
            return function(event) {
                var content = event.target.result;
                var processedContent = processarArquivo(content);
                processedData.push(processedContent);

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
    var lines = content.split('\n');
    var processedContent = '';

    for (var i = 0; i < lines.length; i++) {
        var shortcode = '[' + ('00' + (i + 1)).slice(-3) + ']';
        processedContent += shortcode + lines[i] + '\n';
    }

    return processedContent;
}

function processModelFiles(trailName) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'modelo.txt', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var modelContent = xhr.responseText;
            var finalContent = '';

            for (var i = 0; i < processedData.length; i++) {
                var lines = processedData[i].split('\n');
                var processedModelContent = modelContent.replace(/\[\d{3}\]/g, function(match) {
                    var index = parseInt(match.slice(1, 4));
                    return lines[index - 1] ? lines[index - 1].slice(5).trim() : match;
                });
                finalContent += processedModelContent + '\n';
            }

            sessionStorage.setItem('finalContent', finalContent);
            window.location.href = 'editar.html';
        }
    };
    xhr.send();
}
