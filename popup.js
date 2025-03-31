
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


