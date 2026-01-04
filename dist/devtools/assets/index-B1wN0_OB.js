(function() {let __HMR_ID = "0.3hua654rjgk";
const LOCAL_RELOAD_SOCKET_PORT = 8081;
const LOCAL_RELOAD_SOCKET_URL = `ws://localhost:${LOCAL_RELOAD_SOCKET_PORT}`;

const DO_UPDATE = 'do_update';
const DONE_UPDATE = 'done_update';

var MessageInterpreter = {
  send: (message) => JSON.stringify(message),
  receive: (serializedMessage) => JSON.parse(serializedMessage),
};

var initClient = ({ id, onUpdate }) => {
  const ws = new WebSocket(LOCAL_RELOAD_SOCKET_URL);

  ws.onopen = () => {
    ws.addEventListener('message', event => {
      const message = MessageInterpreter.receive(String(event.data));

      if (message.type === DO_UPDATE && message.id === id) {
        onUpdate();
        ws.send(MessageInterpreter.send({ type: DONE_UPDATE }));
      }
    });
  };
};

(() => {
  let pendingReload = false;

  initClient({
    // @ts-expect-error That's because of the dynamic code loading
    id: __HMR_ID,
    onUpdate: () => {
      // disable reload when tab is hidden
      if (document.hidden) {
        pendingReload = true;
        return;
      }
      reload();
    },
  });

  // reload
  const reload = () => {
    pendingReload = false;
    window.location.reload();
  };

  // reload when tab is visible
  const reloadWhenTabIsVisible = () => {
    if (!document.hidden && pendingReload) {
      reload();
    }
  };

  document.addEventListener('visibilitychange', reloadWhenTabIsVisible);
})();

})();
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
try {
  console.log("Edit 'pages/devtools/src/index.ts' and save to reload.");
  chrome.devtools.panels.create("Dev Tools", "/icon-34.png", "/devtools-panel/index.html");
} catch (e) {
  console.error(e);
}
//# sourceMappingURL=index-B1wN0_OB.js.map
