chrome.runtime.onInstalled.addListener(() => {
    console.log("Weibo屏蔽关键词插件已安装");
});

// 监听消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchData") {
        fetch(request.url)
            .then(response => response.json())
            .then(data => {
                // 将获取的数据发送回content script
                sendResponse({data: data});
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
                sendResponse({error: error});
            });
        return true; // 保持消息通道打开
    }
});