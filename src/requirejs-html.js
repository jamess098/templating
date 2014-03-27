import {Injector} from 'di/injector';
import {Compiler} from './compiler';
import {CompilerConfig} from './compiler_config';

// TODO: How to configure this injector??
// TODO: Where to get the CompilerConfig from??
var injector = new Injector();
var compiler = injector.get(Compiler);

export function load(name, req, onload, config) {
  // TODO: read out the require config and instantiate the
  // compiler here!
  // ?? Maybe pass the compilerConfig to every call of the compiler ??
  var url = req.toUrl(name+'.html');
  loadText(url, function(error, doc) {
    if (error) {
      onload.error(error);
    } else {
      var vf;
      try {
        // TODO: Parse the module tags as well!
        vf = compiler.compileChildNodes(doc, []);
      } catch (e) {
        onload.error(e);
      }
      if (vf) {
        onload({
          __esModule: true,
          viewFactory: vf
        });
      }
    }
  });
}
load.responseTypeContentSupported = isResponseTypeContentSupported();

function loadText(url, callback) {
  var done = false;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  if (load.responseTypeContentSupported) {
    xhr.responseType = 'document';
  } else {
    xhr.responseType = 'text/html';
  }
  xhr.onreadystatechange = onreadystatechange;
  xhr.onabort = xhr.onerror = function() {
    if (!done) {
      done = true;
      callback(new Error('Error loading '+url+': aborted'), xhr);
    }
  }
  xhr.send();

  function onreadystatechange() {
    if (xhr.readyState === 4) {
      done = true;
      if (xhr.status !== 200) {
        callback(new Error('Error loading '+url+': '+xhr.status+' '+xhr.statusText), xhr);
      } else {
        var doc;
        if (load.responseTypeContentSupported) {
          doc = xhr.responseXML;
        } else {
          doc = document.createElement('div');
          doc.innerHTML = xhr.responseText;
        }
        callback(null, doc);
      }
    }
  }
}

function isResponseTypeContentSupported() {
  if (!window.XMLHttpRequest)
    return false;
  var req = new window.XMLHttpRequest();
  req.open('GET', window.location.href, false);
  try {
    req.responseType = 'document';
  } catch(e) {
    return true;
  }
  return false;
}
