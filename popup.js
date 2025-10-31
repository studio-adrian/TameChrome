// Add a function to write to the text box
function writeToPopupConsole(text) {
  const consoleOutput = document.getElementById('popupConsole');
  if (consoleOutput) {
    const line = document.createElement('div');
    line.innerHTML = text;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight; // Auto-scroll to the bottom
  }
}
// Add a function to clear the text box
function clearPopupConsole() {
  const consoleOutput = document.getElementById('popupConsole');
  if (consoleOutput) {
    consoleOutput.innerHTML = ''; // Clear the console output
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "writeToPopupConsole" && message.text) {
      writeToPopupConsole(message.text);
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "clearPopupConsole" && message.text) {
    clearPopupConsole(message.text);
  }
});


document.getElementById('opentabsReport').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: "opentabsReport" });
});

document.getElementById('domainReport').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: "domainReport" });
});

document.getElementById('cleanUp').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: "cleanUp" });
});

document.getElementById('duplicatesReport').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: "duplicatesReport" });
});

document.getElementById('duplicatesCleanUp').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: "duplicatesCleanUp" });
});

document.getElementById('popForward1TabWindows').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: "popForward1TabWindows" });
});
document.getElementById('popForward2TabWindows').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: "popForward2TabWindows" });
});
document.getElementById('popForward3TabWindows').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: "popForward3TabWindows" });
});

document.getElementById('popForwardWindowsWithNoGroups').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: "popForwardWindowsWithNoGroups" });
});


