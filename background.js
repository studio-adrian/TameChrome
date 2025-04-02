function writeToPopupConsole(text) {
    chrome.runtime.sendMessage({ action: "writeToPopupConsole", text: text });
}

function clearPopupConsole() {
    chrome.runtime.sendMessage({ action: "clearPopupConsole" });
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        clearPopupConsole();
        if (request.action === "opentabsReport") {
            writeToPopupConsole("<br>Open Tabs Report...<br>");
            chrome.tabs.query({}, function (tabs) {
                writeToPopupConsole(`Tabs queried:<br>${tabs.map((tab, index) => `${index + 1}. ${tab.title}`).join('<br>')}`);

                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole("No tabs found in any window.");
                    return;
                }

                writeToPopupConsole(`Total tabs found in all windows: ${tabs.length}<br>`);
                let windowCount = 0;
                const windowMap = new Map();
                for (const tab of tabs) {
                    if (windowMap.has(tab.windowId)) {
                        windowMap.get(tab.windowId).push(tab);
                    } else {
                        windowMap.set(tab.windowId, [tab]);
                    }
                }
                writeToPopupConsole(`Total windows open: ${windowMap.size}<br>`);

                const windowCounts = new Map();
                for (const [windowId, tabList] of windowMap) {
                    if (windowCounts.has(tabList.length)) {
                        windowCounts.set(tabList.length, windowCounts.get(tabList.length) + 1);
                    } else {
                        windowCounts.set(tabList.length, 1);
                    }
                }

                let reportData = [];
                for (const [numberOfTabs, countOfWindowsWithThatManyTabs] of windowCounts) {
                    reportData.push({
                        numberOfTabs: numberOfTabs,
                        count: countOfWindowsWithThatManyTabs
                    });
                }
                reportData.sort((a, b) => b.numberOfTabs - a.numberOfTabs);

                writeToPopupConsole("<br>Window Counts Report...<br>");
                writeToPopupConsole("Window Report:<br>");
                if (reportData.length === 0) {
                    writeToPopupConsole("No report.<br>");
                } else {
                    writeToPopupConsole("--------------------------------------------------<br>");
                    for (const item of reportData) {
                        writeToPopupConsole(`${item.count} windows have ${item.numberOfTabs} tabs<br>`);
                    }
                    writeToPopupConsole("--------------------------------------------------<br>");
                }
            });
        } else if (request.action === "domainReport") {
            writeToPopupConsole("<br>Domain Report...<br>");
            chrome.tabs.query({}, function (tabs) {
                writeToPopupConsole(`Tabs queried:<br>${tabs.map(tab => `${tab.title}<br>`).join('')}`);

                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole("No tabs found in any window.<br>");
                    return;
                }

                const urls = new Map();
                let duplicateCount = 0;

                for (const tab of tabs) {
                    let domain = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
                    if (urls.has(domain)) {
                        urls.get(domain).push(tab);
                        duplicateCount++;
                    } else {
                        urls.set(domain, [tab]);
                    }
                }

                writeToPopupConsole(`Total duplicate tabs found (across all windows): ${duplicateCount} in ${urls.size} unique URLs out of ${tabs.length} total tabs<br>`);

                const reportData = [];
                for (const [domain, tabList] of urls) {
                    reportData.push({
                        domain: domain,
                        count: tabList.length,
                        tabs: tabList
                    });
                }

                reportData.sort((a, b) => b.count - a.count);

                writeToPopupConsole(`Domain Report:<br>`);
                if (reportData.length === 0) {
                    writeToPopupConsole(`No report.<br>`);
                } else {
                    writeToPopupConsole(`--------------------------------------------------<br>`);
                    for (const item of reportData) {
                        const domain = item.domain;
                        let countString = item.count.toString();
                        writeToPopupConsole(`${countString} : ${domain}<br>`);
                    }
                    writeToPopupConsole(`--------------------------------------------------<br>`);
                }
            });
        } else if (request.action === "cleanUp") {
            writeToPopupConsole(`<br>Clean Up...<br>`);
            chrome.tabs.query({}, function (tabs) {
                writeToPopupConsole(`Tabs queried: ${JSON.stringify(tabs)}`);

                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole(`No tabs found in any window.`);
                    return;
                }

                const urls = new Map();
                urls.set("mail.google.com", true);
                urls.set("contacts.google.com", true);
                urls.set("jira.trimble.tools", true);
                urls.set("photos.google.com", true);
                urls.set("confluence.trimble.tools", true);
                urls.set("newtab", true);
                urls.set("learn.trimble.com", true);
                urls.set("community.trimble.com", true);
                urls.set("calendar.google.com", true);
                urls.set("trimble.okta.com", true);
                urls.set("www.egencia.com", true);

                writeToPopupConsole(`URLs to close when not in tabs: ${JSON.stringify([...urls.keys()])}`);

                let counter = 0;
                for (const tab of tabs) {
                    let domain = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
                    if (tab.groupId === -1 && urls.has(domain)) {
                        writeToPopupConsole(`Closing tab: ${domain} : ${tab.title} : ${tab.url} : group: None`);
                        chrome.tabs.remove(tab.id);
                        counter++;
                    }
                }
                writeToPopupConsole(`Total tabs closed: ${counter}`);
            });
        } else if (request.action === "duplicatesReport") {
            writeToPopupConsole(`<br>Duplicates Report...<br>`);
            chrome.tabs.query({}, function (tabs) {

                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole(`No tabs found in any window.`);
                    return;
                }

                const urls = new Map();
                let duplicateCount = 0;

                for (const tab of tabs) {
                    if (urls.has(tab.url)) {
                        urls.get(tab.url).push(tab);
                        duplicateCount++;
                    } else {
                        urls.set(tab.url, [tab]);
                    }
                }

                writeToPopupConsole(`Total duplicate tabs found (across all windows): ${duplicateCount} in ${urls.size} unique URLs out of ${tabs.length} total tabs`);

                const reportData = [];
                for (const [url, tabList] of urls) {
                    reportData.push({
                        url: url,
                        title: tabList[0].title,
                        count: tabList.length,
                        tabs: tabList
                    });
                }

                reportData.sort((a, b) => b.count - a.count);

                if (reportData.length === 0) {
                    writeToPopupConsole(`--empty--`);
                } else {
                    writeToPopupConsole(`--------------------------------------------------<br>`);
                    for (const item of reportData) {
                        const truncatedURL = item.url;
                        let countString = item.count.toString();
                        if (item.count > 1) {
                            writeToPopupConsole(`${countString} : ${item.title} : ${truncatedURL}`);
                        }
                    }
                    writeToPopupConsole(`--------------------------------------------------<br>`);
                }
            });
        } else if (request.action === "duplicatesCleanUp") {
            writeToPopupConsole(`<br>Duplicates CleanUp...<br>`);
            writeToPopupConsole(`Closing duplicates in each group and those that have no group...`);
            chrome.tabs.query({}, function (tabs) {
                writeToPopupConsole(`Tabs queried:<br>${tabs.map(tab => `${tab.title}<br>`).join('')}`);

                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole(`No tabs found in any window.`);
                    return;
                }

                const urls = new Map();
                let duplicateCount = 0;

                for (const tab of tabs) {
                    let hash = tab.url + tab.groupId;
                    if (urls.has(hash)) {
                        urls.get(hash).push(tab);
                        duplicateCount++;
                    } else {
                        urls.set(hash, [tab]);
                    }
                }

                writeToPopupConsole(`Total duplicate tabs found (across all windows): ${duplicateCount} in ${urls.size} unique URLs out of ${tabs.length} total tabs`);

                let counter = 0;
                for (const [hash, tabList] of urls) {
                    if (tabList.length > 1) {
                        tabList.sort((a, b) => a.id - b.id);
                        for (let i = 1; i < tabList.length; i++) {
                            const tab = tabList[i];
                            let domain = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
                            writeToPopupConsole(`Closing tab: ${domain} : ${tab.title} : ${tab.url} : group: ${tab.groupId}`);
                            chrome.tabs.remove(tab.id);
                            counter++;
                        }
                        tabList.splice(1);
                    }
                }
                writeToPopupConsole(`Total tabs closed: ${counter}`);
            });
        }
    }
);