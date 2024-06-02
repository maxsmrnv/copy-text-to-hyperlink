'use strict';

const copyToClipboard = async (text, url) => {
    const htmlContent = `<a href="${url}">${text}</a>`;
    try {
        await navigator.clipboard.write([
            new ClipboardItem({
                "text/html": new Blob([htmlContent], { type: "text/html" }),
                "text/plain": new Blob([url], { type: "text/plain" })
            })
        ]);
    } catch (error) {
        console.error('Could not copy content: ', error);
    }
};

const copyUrlToClipboard = async (url) => {
    navigator.clipboard.writeText(url).catch(err => {
        console.error('Failed to copy URL:', err);
    });
};

const getSelectedText = () => window.getSelection().toString();

const handleTabCopy = async (tab) => {
    const { url, id: tabId } = tab;

    chrome.scripting.executeScript(
        {
            target: { tabId },
            func: getSelectedText
        },
        ([{ result: selectedText }]) => {
            if (selectedText.length > 0) {
                chrome.scripting.executeScript(
                    {
                        target: { tabId },
                        func: copyToClipboard,
                        args: [selectedText, url],
                    }
                );
            } else {
                chrome.scripting.executeScript(
                    {
                        target: { tabId },
                        func: copyUrlToClipboard,
                        args: [url],
                    }
                );
            }
        }
    );
};

chrome.commands.onCommand.addListener(() => {
    chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        ([activeTab]) => {
            console.log("Executing copy-text-to-hyperlink command");
            handleTabCopy(activeTab);
        }
    );
});
