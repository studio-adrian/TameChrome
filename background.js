chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "opentabsReport") {
            console.log("Received opentabsReport message.");
            console.log("Report on the number of tabs and windows open, how many are single tab windows...");

            chrome.tabs.query({}, function (tabs) {

                console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    console.log("No tabs found in any window.");
                    return;
                }

                console.log("Total tabs found in all windows:", tabs.length);
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
                console.log("Total windows open:", windowMap.size);

                // for a report where the number of windows with the same number of tabs is counted
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

                console.log("Window Counts Report:\n");
                console.log("Window Report:\n");
                if (reportData.length === 0) {
                    console.log("No report.");
                } else {
                    console.log("--------------------------------------------------");

                    for (const item of reportData) {

                        console.log(`${item.count} windows have ${item.numberOfTabs} tabs`);
                    }
                    console.log("--------------------------------------------------");
                }
            });
        }
        else if (request.action === "domainReport") {
            console.log("Received domainReport message.");

            chrome.tabs.query({}, function (tabs) {

                console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    console.log("No tabs found in any window.");
                    return;
                }

                const urls = new Map();
                let duplicateCount = 0;

                for (const tab of tabs) {
                    //console.log("Processing tab:", tab.title, ":", tab.url, "group: None", "in window:", tab.windowId);
                    // extract the domain from the URL
                    let domain = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
                    //console.log("Processing tab:", tab.title, ":", domain, "URL:", tab.url);

                    if (urls.has(domain)) {
                        urls.get(domain).push(tab);
                        duplicateCount++;
                    } else {
                        urls.set(domain, [tab]);
                    }
                }

                console.log("Total duplicate tabs found (across all windows):", duplicateCount, "in", urls.size, "unique urls", "out of", tabs.length, "total tabs");

                const reportData = [];
                for (const [domain, tabList] of urls) {
                    reportData.push({
                        domain: domain,
                        //title: tabList[0].title,
                        count: tabList.length,
                        tabs: tabList
                    });
                }

                reportData.sort((a, b) => b.count - a.count);

                console.log("Domain Report:\n");
                if (reportData.length === 0) {
                    console.log("No report.");
                } else {
                    console.log("--------------------------------------------------");

                    for (const item of reportData) {
                        const domain = item.domain;
                        let countString = item.count.toString();

                        console.log(`${countString} : ${domain}`);
                    }
                    console.log("--------------------------------------------------");
                }
            });
        }
        else if (request.action === "cleanUp") {
            console.log("Received cleanUp message.");

            chrome.tabs.query({}, function (tabs) {

                console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    console.log("No tabs found in any window.");
                    return;
                }

                // create a list of urls to close
                // as long as they are not in a group
                const urls = new Map();
                //                urls.set("drive.google.com", true);
                urls.set("mail.google.com", true);
                urls.set("contacts.google.com", true);
                //                urls.set("www.google.com ", true);
                urls.set("jira.trimble.tools", true);
                //                urls.set("notebooklm.google.com", true);
                urls.set("photos.google.com", true);
                urls.set("confluence.trimble.tools", true);
                urls.set("newtab", true);
                //                urls.set("bitbucket.trimble.tools", true);
                urls.set("learn.trimble.com", true);
                //                urls.set("trimble-arch.aha.io", true);
                urls.set("community.trimble.com", true);
                urls.set("calendar.google.com", true);
                urls.set("trimble.okta.com", true);
                urls.set("www.egencia.com", true);

                // print all the urls to close
                console.log("urls to close when not in tabs:", urls);

                let counter = 0
                for (const tab of tabs) {
                    //console.log("Processing tab:", tab.title, ":", tab.url, "group: None", "in window:", tab.windowId);
                    // extract the domain from the URL
                    let domain = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
                    //console.log("Processing tab:", tab.title, ":", domain, "URL:", tab.url);

                    // if the tab is not in a tab group
                    // and it is in the list of urls to close
                    // then close it
                    if (tab.groupId === -1 && urls.has(domain)) {
                        console.log("Closing tab:", domain, ":", tab.title, ":", tab.url, "group: None");
                        chrome.tabs.remove(tab.id);
                        counter++;
                    }
                }
                console.log("Total tabs closed:", counter);
            });
        }
        else if (request.action === "duplicatesReport") {
            console.log("Received duplicatesReport message.");

            chrome.tabs.query({}, function (tabs) {

                console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    console.log("No tabs found in any window.");
                    return;
                }

                const urls = new Map();
                let duplicateCount = 0;

                for (const tab of tabs) {
                    //console.log("Processing tab:", tab.title, ":", tab.url, "group: None", "in window:", tab.windowId);

                    if (urls.has(tab.url)) {
                        urls.get(tab.url).push(tab);
                        duplicateCount++;
                    } else {
                        urls.set(tab.url, [tab]);
                    }
                }

                console.log("Total duplicate tabs found (across all windows):", duplicateCount, "in", urls.size, "unique urls", "out of", tabs.length, "total tabs");

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

                console.log("Duplicates Report:");
                if (reportData.length === 0) {
                    console.log("--empty--");
                } else {
                    console.log("--------------------------------------------------\n");

                    for (const item of reportData) {
                        const truncatedURL = item.url;
                        let countString = item.count.toString();
                        if (item.count > 1) {
                            console.log(`${countString} : ${item.title} : ${truncatedURL}`);
                        }
                    }                            
                    console.log("--------------------------------------------------\n");
                }
            });
        }
        else if (request.action === "duplicatesCleanUp") {
            console.log("Received duplicatesCleanUp message.");
            console.log("Closing duplicates in each group and those that have no group...");

            // close all duplicate tabs in the same group
            chrome.tabs.query({}, function (tabs) {

                console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    console.log("No tabs found in any window.");
                    return;
                }

                const urls = new Map();
                let duplicateCount = 0;

                for (const tab of tabs) {
                    //console.log("Processing tab:", tab.title, ":", tab.url, "group: None", "in window:", tab.windowId);

                    // create a hash that is the url and the group id
                    let hash = tab.url + tab.groupId;
                    if (urls.has(hash)) {
                        urls.get(hash).push(tab);
                        duplicateCount++;
                    } else {
                        urls.set(hash, [tab]);
                    }
                }

                console.log("Total duplicate tabs found (across all windows):", duplicateCount, "in", urls.size, "unique urls", "out of", tabs.length, "total tabs");

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
                            console.log(domain, "Closing tab:", tab.title, ":", tab.url, "group:", tab.groupId);
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
                console.log("Total tabs closed:", counter);
            });
        }
        else if (request.action === "popForward1TabWindows") {
            console.log("Received popForward1TabWindows message.");
            console.log("Close the ones you no longer care about...");

            chrome.tabs.query({}, function (tabs) {

                console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    console.log("No tabs found in any window.");
                    return;
                }

                console.log("Total tabs found in all windows:", tabs.length);

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
                console.log("Total windows open:", windowMap.size);

                // loop through the windows and bring forward the those found that only has one tab
                for (const [windowId, tabList] of windowMap) {
                    if (tabList.length === 1) {
                        console.log("Bringing window forward with only one tab:", tabList[0].title, ":", tabList[0].url, "in window:", tabList[0].windowId);
                        chrome.windows.update(tabList[0].windowId, { focused: true });
                    }
                }
            });
        }
        else if (request.action === "popForward2TabWindows") {
            console.log("Received popForward2TabWindows message.");
            console.log("Close the ones you no longer care about...");

            chrome.tabs.query({}, function (tabs) {

                console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    console.log("No tabs found in any window.");
                    return;
                }

                console.log("Total tabs found in all windows:", tabs.length);

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
                console.log("Total windows open:", windowMap.size);

                // loop through the windows and bring forward the those found that only has one tab
                for (const [windowId, tabList] of windowMap) {
                    if (tabList.length === 2) {
                        console.log("Bringing window forward with only one tab:", tabList[0].title, ":", tabList[0].url, "in window:", tabList[0].windowId);
                        chrome.windows.update(tabList[0].windowId, { focused: true });
                    }
                }
            });
        }
        else if (request.action === "popForward3TabWindows") {
            console.log("Received popForward3TabWindows message.");
            console.log("Close the ones you no longer care about...");

            chrome.tabs.query({}, function (tabs) {

                console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    console.log("No tabs found in any window.");
                    return;
                }

                console.log("Total tabs found in all windows:", tabs.length);

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
                console.log("Total windows open:", windowMap.size);

                // loop through the windows and bring forward the those found that only has one tab
                for (const [windowId, tabList] of windowMap) {
                    if (tabList.length === 3) {
                        console.log("Bringing window forward with only one tab:", tabList[0].title, ":", tabList[0].url, "in window:", tabList[0].windowId);
                        chrome.windows.update(tabList[0].windowId, { focused: true });
                    }
                }
            });
        }
        else if (request.action === "popForwardWindowsWithNoGroups") {
            console.log("Received popForwardWindowsWithNoGroups message.");
            console.log("Close the ones you no longer care about...");

            chrome.tabs.query({}, function (tabs) {

                console.log("Tabs queried:", tabs);

                if (!tabs || tabs.length === 0) {
                    console.log("No tabs found in any window.");
                    return;
                }

                console.log("Total tabs found in all windows:", tabs.length);

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
                console.log("Total windows open:", windowMap.size);

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
                        console.log("Bringing window forward with no groups:", tabList[0].title, ":", tabList[0].url, "in window:", tabList[0].windowId);
                        chrome.windows.update(tabList[0].windowId, { focused: true });
                    }
                }
                console.log("Total windows brought forward:", counter);
            });
        }

    });