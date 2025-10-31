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
                    // extract the domain from the URL
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

                // create a list of urls to close
                // as long as they are not in a group
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

                // print all the urls to close
                writeToPopupConsole(`URLs to close when not in tabs: ${JSON.stringify([...urls.keys()])}`);

                let counter = 0;
                for (const tab of tabs) {
                    // extract the domain from the URL
                    let domain = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];

                    // if the tab is not in a tab group
                    // and it is in the list of urls to close
                    // then close it
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
            // close all duplicate tabs in the same group
            chrome.tabs.query({}, function (tabs) {
                writeToPopupConsole(`Tabs queried:<br>${tabs.map(tab => `${tab.title}<br>`).join('')}`);

                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole(`No tabs found in any window.`);
                    return;
                }

                const urls = new Map();
                let duplicateCount = 0;

                for (const tab of tabs) {
                    // create a hash that is the url and the group id
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
                        // sort the tablist by tab id
                        tabList.sort((a, b) => a.id - b.id);
                        // remove all tabs except the first one
                        for (let i = 1; i < tabList.length; i++) {
                            const tab = tabList[i];
                            // extract the domain from the URL                                
                            let domain = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
                            writeToPopupConsole(`Closing tab: ${domain} : ${tab.title} : ${tab.url} : group: ${tab.groupId}`);
                            chrome.tabs.remove(tab.id);
                            counter++;
                        }
                        // remove all the entries from the tablist except the first one
                        // this will leave the first one in the list
                        tabList.splice(1);
                    }
                }

                // make a copy of the urls map, this has the urls that are still open
                const urlsCopy = new Map(urls);
                // clear the urls map
                urls.clear();
                duplicateCount = 0;
                // look for duplicates of those that remain
                // now we close any duplicate tabs that are not in a group
                for (const [hash, tabList] of urlsCopy) {
                    const tab = tabList[0];
                    let hash2 = tab.url;
                    if (urls.has(hash2)) {
                        urls.get(hash2).push(tab);
                        duplicateCount++;
                    } else {
                        urls.set(hash2, [tab]);
                    }
                }

                // close any that are not in a group
                for (const [hash, tabList] of urls) {
                    if (tabList.length > 1) {
                        for (let i = 0; i < tabList.length; i++) {
                            const tab = tabList[i];
                            if (tab.groupId === -1) {
                                // extract the domain from the URL                                
                                let domain = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
                                console.log(domain, "Closing tab:", tab.title, ":", tab.url, "group: None");
                                chrome.tabs.remove(tab.id);
                                counter++;
                            }
                        }
                    }
                }
                writeToPopupConsole(`Total tabs closed: ${counter}`);
            });
        }
        else if (request.action === "popForward1TabWindows") {
            writeToPopupConsole("Pop Forward 1 Tab Window:<br>");
            writeToPopupConsole("Close the ones you no longer care about...<br>");

            chrome.tabs.query({}, function (tabs) {

                // console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole("No tabs found in any window<br>");
                    return;
                }

                writeToPopupConsole(`Total tabs found in all windows: ${tabs.length}<br>`);

                // print the number of windows open
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

                // loop through the windows and bring forward the those found that only has one tab
                for (const [windowId, tabList] of windowMap) {
                    if (tabList.length === 1) {
                        writeToPopupConsole(`Bringing window forward with only one tab: ${tabList[0].title} : ${tabList[0].url} in window: ${tabList[0].windowId}<br>`);
                        chrome.windows.update(tabList[0].windowId, { focused: true });
                    }
                }
            });
        }
        else if (request.action === "popForward2TabWindows") {
            writeToPopupConsole("Pop Forward 2 Tab Windows:<br>");
            writeToPopupConsole("Close the ones you no longer care about...<br>");

            chrome.tabs.query({}, function (tabs) {

                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole("No tabs found in any window<br>");
                    return;
                }

                writeToPopupConsole(`Total tabs found in all windows: ${tabs.length}<br>`);

                // print the number of windows open
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

                // loop through the windows and bring forward the those found that only has one tab
                for (const [windowId, tabList] of windowMap) {
                    if (tabList.length === 2) {
                        writeToPopupConsole(`Bringing window forward with only two tabs: ${tabList[0].title} : ${tabList[0].url} in window: ${tabList[0].windowId}<br>`);
                        chrome.windows.update(tabList[0].windowId, { focused: true });
                    }
                }
            });
        }
        else if (request.action === "popForward3TabWindows") {
            writeToPopupConsole("Pop Forward 3 Tab Windows:<br>");
            writeToPopupConsole("Close the ones you no longer care about...<br>");

            chrome.tabs.query({}, function (tabs) {
                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole("No tabs found in any window.");
                    return;
                }

                writeToPopupConsole(`Total tabs found in all windows: ${tabs.length}<br>`);

                // print the number of windows open
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

                // loop through the windows and bring forward the those found that only has one tab
                for (const [windowId, tabList] of windowMap) {
                    if (tabList.length === 3) {
                        writeToPopupConsole(`Bringing window forward with only three tabs: ${tabList[0].title} : ${tabList[0].url} in window: ${tabList[0].windowId}<br>`);
                        chrome.windows.update(tabList[0].windowId, { focused: true });
                    }
                }
            });
        }
        else if (request.action === "popForwardWindowsWithNoGroups") {
            writeToPopupConsole("Pop Forward Windows With No Groups:<br>");
            writeToPopupConsole("Close the ones you no longer care about...<br>");

            chrome.tabs.query({}, function (tabs) {
                if (!tabs || tabs.length === 0) {
                    writeToPopupConsole("No tabs found in any window<br>");
                    return;
                }

                writeToPopupConsole(`Total tabs found in all windows: ${tabs.length}<br>`);

                // print the number of windows open
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

                // loop through the windows and bring forward the those found that have no groups on them
                let counter = 0;
                for (const [windowId, tabList] of windowMap) {
                    let bHasGroupOnIt = false;
                    for (const tab of tabList) {
                        if (tab.groupId != -1) {
                            bHasGroupOnIt = true;
                            break;
                        }
                    }
                    if (!bHasGroupOnIt) {
                        counter++;
                        writeToPopupConsole(`Bringing window forward with no groups: ${tabList[0].title} : ${tabList[0].url} in window: ${tabList[0].windowId}<br>`);
                        chrome.windows.update(tabList[0].windowId, { focused: true });
                    }
                }
                writeToPopupConsole(`Total windows brought forward: ${counter}<br>`);
            });
        }

    });
