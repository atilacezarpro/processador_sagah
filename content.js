chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "startCapture") {

    var trilha = '';
    var unidade = '';

    function removerAcentos(texto) {
      return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function capturarTrilhaEUnidade() {
      do {
        trilha = prompt("Por favor, selecione a Trilha (1 a 4):");
      } while (!validarNumeroDeUmDigito(trilha));

      do {
        unidade = prompt("Por favor, selecione a Unidade (01 a 05):");
      } while (!validarNumeroDeDoisDigitos(unidade));
    }

    function validarNumeroDeUmDigito(numero) {
      return /^[1-4]$/.test(numero);
    }

    function validarNumeroDeDoisDigitos(numero) {
      return /^[0-9]{2}$/.test(numero);
    }

    var perguntasCapturadas = [];

    function capturarDados() {
      var divs = document.querySelectorAll('.question-content, .option-feedback');

      divs.forEach(function(div) {
        var texto = div.innerText;

        var identificadorElement = div.querySelector('.question-identifier');
        if (identificadorElement) {
          var identificador = identificadorElement.innerText;
          identificador = identificador.replace(/[.\-]/g, '');

          texto = texto.replace(/Resposta incorreta\./g, "~");
          texto = texto.replace(/Resposta correta\./g, "=");

          var topicContentBodies = div.querySelectorAll('.topic-content-body');
          topicContentBodies.forEach(function(topicContentBody) {
            var topicContentBodyText = topicContentBody.innerText.replace(/\n/g, ' ');
            texto = texto.replace(topicContentBody.innerText, topicContentBodyText);
          });

          if (!perguntaJaCapturada(identificador)) {
            perguntasCapturadas.push(identificador + '\n' + texto);
          }
        }
      });
    }

    function perguntaJaCapturada(identificador) {
      return perguntasCapturadas.some(function(pergunta) {
        return pergunta.startsWith(identificador + '\n');
      });
    }

    function clicarProximo() {
      var botaoProximo = document.querySelector('.v-icon.notranslate.mdi.mdi-chevron-right.theme--light');
      if (botaoProximo) {
        botaoProximo.click();
      } else {
        console.log("Não há mais botões 'Próximo'.");
      }
    }

    function repetir() {
      setTimeout(function() {
        capturarDados();
        clicarProximo();

        if (document.querySelector('.v-icon.notranslate.mdi.mdi-chevron-right.theme--light')) {
          repetir();
        } else {
          salvarDadosEmArquivo();
        }
      }, 1000);
    }

    function removerLinhasEmBranco(texto) {
      return texto.replace(/^\s*[\r\n]/gm, '');
    }

    function removerExpressoes(texto) {
      var expressoes = [
        /\b\d+ de \d+ perguntas\b/g,
        /\bPróximo\b/g,
        /\bVoltar\b/g
      ];

      expressoes.forEach(function(expressao) {
        texto = texto.replace(expressao, '');
      });

      return texto;
    }

    function salvarDadosEmArquivo() {
      var tituloPagina = removerAcentos(document.title);

      tituloPagina = tituloPagina.replace(/plataforma a/i, '');
      tituloPagina = tituloPagina.replace(/\s+/g, ' ').trim();

      var dadosFormatados = removerLinhasEmBranco(perguntasCapturadas.join('\n'));
      dadosFormatados = removerExpressoes(dadosFormatados);

      dadosFormatados = "Trilha " + trilha + "\n" + unidade + "\n" + dadosFormatados;

      var blob = new Blob([dadosFormatados], { type: 'text/plain;charset=utf-8' });

      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      link.download = 'T' + trilha + '_U' + unidade + ' - ' + tituloPagina.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.txt';

      link.click();
    }

    capturarTrilhaEUnidade();
    repetir();
  }
});
