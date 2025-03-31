# TameChrome
Close duplicate tabs, report on open tabs, get back in control.

This repo creates a simple extension that helps you manage the number of windows and tabs you have open.  It gives you a place to review open tabs, and to close many that you don't care about.

The extension is simple and can be improved.

## Installation
Download the repo. Open Chrome, go to (3 Dot Menu in Chrome -> Extensions -> Manage Extensions).  Turn on Developer Mode (a slider in the upper right of the Extension Tab); this will allow you to add extensions you write yourself.  Pick on the "Load Unpacked" button, navigate to the directory you have downloaded this repo to.  You should see a "Duplicate Tab Counter" tile added to your extensions list.

I recommend also "pinning" this extension to your Chrome URL line.  You do this by picking on the Extensions Icon all the way top right of a Chrome window (the Icon looks like a jigsaw puzzle piece).  A drop list appears and you can pin "Duplicate Tab Counter".  This will add an Icon "D" which you can select to run any of the reports and commands below.

Be sure to read the Usage section to open the output log window.


## Usage
All output reports and results will go to the "Service Worker View".  It's basically a log viewer.  The easiest way to open the service worker view is to go to the Extensions Manager page in Chrome (3 Dot Menu in Chrome -> Extensions -> Manage Extensions).  Find the "Duplicate Tab Counter" Exension and pick "Inspect views service worker" link.

Once that window is open then seeing the output of the commands will be clear.

## Commands
### Open Tabs Report
This command will report the total number of tabs you have open; the total number of windows you have open; and for each window the number of tabs you have on that window.  This is useful to tell you if you have many single tab (or low tab count) windows open, or a few with many tabs.

### Domain Report
This command will report how many tabs are open for each site.  For example you can tell that you have many tabs that are all mail.google.com or the calendar.  You can also see random single instances of tabs open to websites you have opened a long time ago and no longer care about.

### Clean Up Tabs with No Groups
This command will close tabs.  This command assumes you are organizing open tabs you care about into named tab groups.  This command has a list of domains like mail.google.com, contacts.google.com, jira, photos.google.com, calendar.google.com, etc.  What the command does is it closes all the tabs to these domains **if** the tab is not organized into a tab group.  The idea is if you are always opening these domains to get something quick done (like check your calendar) then you don't care about this tab in the long run.  If you did care you would have placed it into a named tab group.

### Duplicates Report
This report lists all the duplicate URLs.  More specifically it reports all tabs and the counts for the URLs. This is in order of most duplicated to least.  Records include the URL, so you can click on the URL to remind you of the website you have visited.  

### Close Duplicates
This command will close tabs.  It will close duplicates within a tab group, only leaving one.  It will close duplicates outside of groups, regarless of window they appear. The bottom line is you may still end up with duplicates, but not within a group.

### Pop forward windows with X tabs
You may often open chrome windows for a quick set of searches, accumulating 1, 2, or 3 tabs and not organizing them into named groups.  This command will pop these windows forward so you can review and potientially close those windows.  The basic idea is windows with large numbers of tabs or those with tab groups are more likely to be useful longer term.

### Pop forward windows with no tabs on them
Similar to the above, however it doesn't matter how many tabs are on the window. Any that are not organized in tab groups will pop forward for review.

# Extending and tuning functionality
It is easy to extend current functionality and to tune current functionality.  All functions are currently written in javascript in the background.js file.  Read and modify that file as needed.  Note that you have to hit the "refresh" button on the Chrome Extensions page to make your changes visible.

The files popup.html and popup.js are the files that display the command buttons to run reports and run actions.  These files map UI buttons to commands in background.js.  If you add new commands you will need to update these popup files.  Similarly any changes will not be seen until you hit the "refresh" button on the Chrome Extensions page.

Questions, comments, and improvements welcome.

