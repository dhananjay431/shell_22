(function (window) {
  "use strict";

  var MockInterceptor = {
    logs: [],
    enabled: false,
  };

  function parseHeaders(headerString) {
    var headers = {};

    if (!headerString) return headers;

    var pairs = headerString.trim().split(/[\r\n]+/);

    pairs.forEach(function (line) {
      var parts = line.split(": ");
      var key = parts.shift();
      var value = parts.join(": ");
      headers[key] = value;
    });

    return headers;
  }

  function saveLog(log) {
    MockInterceptor.logs.push(log);

    try {
      localStorage.setItem(
        "__mock_api_logs__",
        JSON.stringify(MockInterceptor.logs),
      );
    } catch (e) {}
  }

  function setupXHR() {
    if (!window.XMLHttpRequest) return;

    var originalOpen = XMLHttpRequest.prototype.open;
    var originalSend = XMLHttpRequest.prototype.send;
    var originalSetHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.open = function (method, url) {
      this.__mock = {
        method: method,
        url: url,
        requestHeaders: {},
      };

      return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.setRequestHeader = function (key, value) {
      this.__mock.requestHeaders[key] = value;

      return originalSetHeader.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
      var xhr = this;
      var start = Date.now();

      xhr.__mock.requestBody = body;

      xhr.addEventListener("load", function () {
        var log = {
          type: "xhr",
          method: xhr.__mock.method,
          url: xhr.__mock.url,
          requestHeaders: xhr.__mock.requestHeaders,
          requestBody: xhr.__mock.requestBody,
          status: xhr.status,
          responseHeaders: parseHeaders(xhr.getAllResponseHeaders()),
          responseBody: xhr.responseText,
          duration: Date.now() - start,
        };

        saveLog(log);
      });

      return originalSend.apply(this, arguments);
    };
  }

  function setupFetch() {
    if (!window.fetch) return;

    var originalFetch = window.fetch;

    window.fetch = function () {
      var args = arguments;
      var url = args[0];
      var options = args[1] || {};

      var start = Date.now();

      return originalFetch.apply(this, args).then(function (response) {
        var clone = response.clone();

        clone.text().then(function (body) {
          var headers = {};

          if (response.headers && response.headers.forEach) {
            response.headers.forEach(function (v, k) {
              headers[k] = v;
            });
          }

          saveLog({
            type: "fetch",
            method: options.method || "GET",
            url: url,
            requestHeaders: options.headers || {},
            requestBody: options.body || null,
            status: response.status,
            responseHeaders: headers,
            responseBody: body,
            duration: Date.now() - start,
          });
        });

        return response;
      });
    };
  }

  function generateJsonServerDB() {
    var db = {};

    MockInterceptor.logs.forEach(function (item) {
      var endpoint = item.url
        .replace(/^https?:\/\//, "")
        .replace(/[^\w]/g, "_");

      try {
        var json = JSON.parse(item.responseBody);

        db[endpoint] = json;
      } catch (e) {
        db[endpoint] = {
          rawResponse: item.responseBody,
        };
      }
    });

    return db;
  }

  function download(filename, content) {
    var blob = new Blob([content], { type: "application/json" });

    var a = document.createElement("a");

    a.href = URL.createObjectURL(blob);
    a.download = filename;

    document.body.appendChild(a);

    a.click();

    setTimeout(function () {
      document.body.removeChild(a);
    }, 100);
  }

  MockInterceptor.start = function () {
    if (MockInterceptor.enabled) return;

    MockInterceptor.enabled = true;

    setupXHR();
    setupFetch();

    console.log("[MockInterceptor] Started");
  };

  MockInterceptor.stop = function () {
    MockInterceptor.enabled = false;
  };

  MockInterceptor.exportLogs = function () {
    download("network-log.json", JSON.stringify(MockInterceptor.logs, null, 2));
  };

  MockInterceptor.exportJsonServer = function () {
    download("db.json", JSON.stringify(generateJsonServerDB(), null, 2));
  };

  MockInterceptor.clear = function () {
    MockInterceptor.logs = [];

    localStorage.removeItem("__mock_api_logs__");
  };

  window.MockInterceptor = MockInterceptor;
})(window);
 MockInterceptor.start();
//console.log(MockInterceptor.logs);
//MockInterceptor.exportLogs();
//MockInterceptor.exportJsonServer();
