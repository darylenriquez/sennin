yaml = require('js-yaml');
fs   = require('fs');
path = require('path');

var key;

try {
  var doc = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../config/key.yml'), 'utf8'));

  key = doc.key;
} catch (e) {
  console.log(e);
}

var recognition = new (webkitSpeechRecognition || SpeechRecognition)();
var languages   = { en: "en-US", ja: "ja-JP", tl: "es-ES" }

function onResultListening(event){
  document.querySelector('#text-input').value = event.results[0][0].transcript;
  document.querySelector('#input-control').click();
}

function endListening(){
  recognition.stop();
}

function onEndListening(event){
  document.querySelector('#text-input').placeholder = "Input Text"
}

function startListening() {
  var lang = document.querySelector('#source-language').value;

  recognition.lang            = languages[lang];
  recognition.interimResults  = false;
  recognition.maxAlternatives = 1;
  recognition.onend           = onEndListening;
  recognition.onresult        = onResultListening;

  recognition.start();
  document.querySelector('#text-input').value = ""
  document.querySelector('#text-input').placeholder = "Listening..."
};

function requestTranslate(){
  var text    = document.querySelector('#text-input').value;
  var target  = document.querySelector('#target-language').value;
  var source  = document.querySelector('#source-language').value;
  var http    = new XMLHttpRequest();
  var url     = "https://translate.yandex.net/api/v1.5/tr.json/translate";
  var params  = "lang=" + source + "-" + target +"&key=" + key + "&text=" + text +".";

  endListening();

  document.getElementById('action-label').textContent = 'Translating...';

  if(text != ""){
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            var json_response = JSON.parse(http.responseText);

            if(json_response.code == 200){
              document.querySelector('#translation-result').textContent = json_response.text;

              var msg = new SpeechSynthesisUtterance(json_response.text);
              msg.lang = languages[target];
              window.speechSynthesis.speak(msg);

              document.getElementById('action-label').textContent = 'Translation';
            }
        }
    }

    http.send(params);
  }
}

(function() {
  document.querySelector('#mic-control').onclick = startListening;
  document.querySelector('#input-control').onclick = requestTranslate;
})();
