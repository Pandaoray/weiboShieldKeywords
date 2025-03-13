// 首先定义所有辅助函数
async function fetchFilteredWords() {
    const response = await fetch("https://weibo.com/ajax/setting/getFilteredWords");
    const data = await response.json();
    if (!data || !data.card_group) {
        throw new Error("未找到关键词数据");
    }
    return data.card_group;
}

function showSuccessMessage(message) {
    const successContainer = document.createElement("div");
    successContainer.style.position = "fixed";
    successContainer.style.top = "20px";
    successContainer.style.left = "50%";
    successContainer.style.transform = "translateX(-50%)";
    successContainer.style.backgroundColor = "#4CAF50";
    successContainer.style.color = "white";
    successContainer.style.padding = "15px 25px";
    successContainer.style.borderRadius = "30px";
    successContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    successContainer.style.zIndex = "9999";
    successContainer.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
    successContainer.style.fontSize = "16px";
    successContainer.style.fontWeight = "bold";
    successContainer.style.display = "flex";
    successContainer.style.alignItems = "center";
    successContainer.style.justifyContent = "center";
    successContainer.style.opacity = "0";
    successContainer.style.transition = "opacity 0.3s ease-in-out";
    successContainer.innerText = message;

    document.body.appendChild(successContainer);

    setTimeout(() => {
        successContainer.style.opacity = "1";
    }, 100);

    setTimeout(() => {
        successContainer.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(successContainer);
        }, 300);
    }, 3000);
}

function showErrorMessage(message) {
    const errorContainer = document.createElement("div");
    errorContainer.style.position = "fixed";
    errorContainer.style.top = "20px";
    errorContainer.style.left = "50%";
    errorContainer.style.transform = "translateX(-50%)";
    errorContainer.style.backgroundColor = "#ff4444";
    errorContainer.style.color = "white";
    errorContainer.style.padding = "15px 25px";
    errorContainer.style.borderRadius = "30px";
    errorContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    errorContainer.style.zIndex = "9999";
    errorContainer.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
    errorContainer.style.fontSize = "16px";
    errorContainer.style.fontWeight = "bold";
    errorContainer.style.display = "flex";
    errorContainer.style.alignItems = "center";
    errorContainer.style.justifyContent = "center";
    errorContainer.style.opacity = "0";
    errorContainer.style.transition = "opacity 0.3s ease-in-out";
    errorContainer.innerText = message;

    document.body.appendChild(errorContainer);

    setTimeout(() => {
        errorContainer.style.opacity = "1";
    }, 100);

    setTimeout(() => {
        errorContainer.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(errorContainer);
        }, 300);
    }, 5000);
}

function showCompletionMessage() {
    const messageContainer = document.createElement("div");
    messageContainer.style.position = "fixed";
    messageContainer.style.top = "20px";
    messageContainer.style.left = "50%";
    messageContainer.style.transform = "translateX(-50%)";
    messageContainer.style.backgroundColor = "#4CAF50";
    messageContainer.style.color = "white";
    messageContainer.style.padding = "15px 25px";
    messageContainer.style.borderRadius = "30px";
    messageContainer.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    messageContainer.style.zIndex = "9999";
    messageContainer.style.fontFamily = "'Helvetica Neue', Arial, sans-serif";
    messageContainer.style.fontSize = "16px";
    messageContainer.style.fontWeight = "bold";
    messageContainer.style.display = "flex";
    messageContainer.style.alignItems = "center";
    messageContainer.style.justifyContent = "center";
    messageContainer.style.opacity = "0";
    messageContainer.style.transition = "opacity 0.3s ease-in-out";

    const checkIcon = document.createElement("span");
    checkIcon.innerHTML = "✓";
    checkIcon.style.marginRight = "10px";
    checkIcon.style.fontSize = "20px";

    const messageText = document.createElement("span");
    messageText.innerText = "续命完成！";

    messageContainer.appendChild(checkIcon);
    messageContainer.appendChild(messageText);

    document.body.appendChild(messageContainer);

    // 淡入效果
    setTimeout(() => {
        messageContainer.style.opacity = "1";
    }, 100);

    // 3秒后淡出并移除消息
    setTimeout(() => {
        messageContainer.style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(messageContainer);
        }, 300);
    }, 3000);
}

// 修改 updateBlockWord 函数，将延迟改回 0.5 秒
async function updateBlockWord(keyword, currentIndex, totalKeywords, progressText) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                // 获取XSRF-TOKEN
                const xsrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1];
                if (!xsrfToken) {
                    throw new Error("无法获取XSRF-TOKEN");
                }

                // 调用更新屏蔽关键词的接口
                const response = await fetch("https://weibo.com/ajax/setting/updateBlockWords", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "application/json, text/plain, */*",
                        "x-xsrf-token": xsrfToken,
                        "x-requested-with": "XMLHttpRequest",
                        "user-agent": navigator.userAgent,
                        "sec-ch-ua": navigator.userAgentData.brands.map(b => `"${b.brand}";v="${b.version}"`).join(', '),
                        "sec-ch-ua-mobile": navigator.userAgentData.mobile ? '?1' : '?0',
                        "sec-ch-ua-platform": `"${navigator.userAgentData.platform}"`,
                        "referer": "https://weibo.com/set/shield?type=keyword",
                        "origin": "https://weibo.com",
                    },
                    body: JSON.stringify({
                        value: keyword,
                        status: 1,
                        comment: 0
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.ok !== 1) {
                    throw new Error(`API error: ${result.msg || '未知错误'}`);
                }
                console.log(`成功更新屏蔽词: ${keyword}`, result);
                progressText.innerText = `正在处理：${currentIndex}/${totalKeywords}`;
                resolve(result);
            } catch (error) {
                console.error(`更新屏蔽词失败: ${keyword}`, error);
                progressText.innerText = `更新失败: ${keyword}. 错误: ${error.message}`;
                showErrorMessage(`更新"${keyword}"失败: ${error.message}`);
                reject(error);
            }
        }, 500); // 改回 0.5 秒延迟
    });
}

// 添加删除屏蔽词的函数
async function deleteBlockWord(keyword, currentIndex, totalKeywords, progressText) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                // 获取XSRF-TOKEN
                const xsrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1];
                if (!xsrfToken) {
                    throw new Error("无法获取XSRF-TOKEN");
                }

                // 调用删除屏蔽关键词的接口
                const response = await fetch("https://weibo.com/ajax/setting/deleteFilteredWords", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "application/json, text/plain, */*",
                        "x-xsrf-token": xsrfToken,
                        "x-requested-with": "XMLHttpRequest",
                        "user-agent": navigator.userAgent,
                        "sec-ch-ua": navigator.userAgentData.brands.map(b => `"${b.brand}";v="${b.version}"`).join(', '),
                        "sec-ch-ua-mobile": navigator.userAgentData.mobile ? '?1' : '?0',
                        "sec-ch-ua-platform": `"${navigator.userAgentData.platform}"`,
                        "referer": "https://weibo.com/set/shield?type=keyword",
                        "origin": "https://weibo.com",
                    },
                    body: JSON.stringify({
                        value: keyword
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.ok !== 1) {
                    throw new Error(`API error: ${result.msg || '未知错误'}`);
                }
                console.log(`成功删除屏蔽词: ${keyword}`, result);
                progressText.innerText = `正在删除：${currentIndex}/${totalKeywords}`;
                resolve(result);
            } catch (error) {
                console.error(`删除屏蔽词失败: ${keyword}`, error);
                progressText.innerText = `删除失败: ${keyword}. 错误: ${error.message}`;
                showErrorMessage(`删除"${keyword}"失败: ${error.message}`);
                reject(error);
            }
        }, 500); // 使用相同的 0.5 秒延迟
    });
}

function initializePage() {
    if (document.querySelector(".wbpro-setup__line2") && !buttonAdded) {
        addButton();
    } else if (!buttonAdded) {
        setTimeout(initializePage, 500);
    }
}

// 然后是主要的按钮添加函数
let buttonAdded = false;

function addButton() {
    if (buttonAdded) {
        return;
    }

    const buttonContainer = document.createElement("div");
    buttonContainer.style.textAlign = "center";
    
    const buttonGroup = document.createElement("div");
    buttonGroup.style.display = "flex";
    buttonGroup.style.justifyContent = "center";
    buttonGroup.style.gap = "10px";
    buttonGroup.style.margin = "10px auto";

    const progressText = document.createElement("div");
    progressText.style.marginTop = "10px";
    progressText.style.color = "#ff5722";

    const progressBar = document.createElement("div");
    progressBar.style.width = "100%";
    progressBar.style.height = "5px";
    progressBar.style.backgroundColor = "#e0e0e0";
    progressBar.style.borderRadius = "2.5px";
    progressBar.style.marginTop = "10px";
    progressBar.style.overflow = "hidden";
    progressBar.style.display = "none";

    const progressFill = document.createElement("div");
    progressFill.style.width = "0%";
    progressFill.style.height = "100%";
    progressFill.style.backgroundColor = "#4CAF50";
    progressFill.style.transition = "width 0.3s ease-in-out";

    // 创建续命按钮
    const button = document.createElement("button");
    button.disabled = true;
    button.style.padding = "10px 20px";
    button.style.backgroundColor = "#cccccc";
    button.style.color = "#fff";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.margin = "0";
    button.innerText = "正在处理...";

    // 创建导出按钮
    const exportButton = document.createElement("button");
    exportButton.style.padding = "10px 20px";
    exportButton.style.backgroundColor = "#2196F3";
    exportButton.style.color = "#fff";
    exportButton.style.border = "none";
    exportButton.style.borderRadius = "5px";
    exportButton.style.cursor = "pointer";
    exportButton.style.margin = "0";
    exportButton.innerText = "一键「导出」";

    // 创建导入按钮
    const importButton = document.createElement("button");
    importButton.style.padding = "10px 20px";
    importButton.style.backgroundColor = "#4CAF50"; // 使用绿色区分
    importButton.style.color = "#fff";
    importButton.style.border = "none";
    importButton.style.borderRadius = "5px";
    importButton.style.cursor = "pointer";
    importButton.style.margin = "0";
    importButton.innerText = "一键「导入」";

    // 创建 VIP 提示文本
    const vipNotice = document.createElement("div");
    vipNotice.style.color = "#666";
    vipNotice.style.fontSize = "12px";
    vipNotice.style.marginBottom = "10px";
    vipNotice.style.textAlign = "center";
    vipNotice.innerHTML = "⚠️ <b>提示：「屏蔽关键词」功能仅对 VIP 会员开放</b>";
    vipNotice.setAttribute('data-vip-notice', '');

    // 创建清空按钮
    const clearButton = document.createElement("button");
    clearButton.style.padding = "10px 20px";
    clearButton.style.backgroundColor = "#FF5252"; // 使用红色以示警告
    clearButton.style.color = "#fff";
    clearButton.style.border = "none";
    clearButton.style.borderRadius = "5px";
    clearButton.style.cursor = "pointer";
    clearButton.style.margin = "0";
    clearButton.innerText = "一键「清空」";

    // 创建模态框及其内容
    const modal = document.createElement("div");
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modal.style.zIndex = "10000";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";

    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#fff";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "10px";
    modalContent.style.width = "80%";
    modalContent.style.maxWidth = "500px";
    modalContent.style.position = "relative";

    const closeButton = document.createElement("button");
    closeButton.innerHTML = "×";
    closeButton.style.position = "absolute";
    closeButton.style.right = "10px";
    closeButton.style.top = "10px";
    closeButton.style.border = "none";
    closeButton.style.background = "none";
    closeButton.style.fontSize = "20px";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "#666";

    const title = document.createElement("h3");
    title.innerText = "一键「导入」";
    title.style.marginTop = "0";
    title.style.marginBottom = "15px";

    const textarea = document.createElement("textarea");
    textarea.style.width = "100%";
    textarea.style.height = "200px";
    textarea.style.marginBottom = "15px";
    textarea.style.padding = "10px";
    textarea.style.boxSizing = "border-box";
    textarea.style.border = "1px solid #ddd";
    textarea.style.borderRadius = "5px";
    textarea.placeholder = "请输入要屏蔽的关键词，每行一个";

    const importProgress = document.createElement("div");
    importProgress.style.display = "none";
    importProgress.style.marginBottom = "15px";
    importProgress.style.color = "#666";

    const confirmButton = document.createElement("button");
    confirmButton.innerText = "确认导入";
    confirmButton.style.padding = "10px 20px";
    confirmButton.style.backgroundColor = "#4CAF50";
    confirmButton.style.color = "#fff";
    confirmButton.style.border = "none";
    confirmButton.style.borderRadius = "5px";
    confirmButton.style.cursor = "pointer";

    // 修改模态框内容，添加 VIP 提示
    const modalVipNotice = document.createElement("div");
    modalVipNotice.style.color = "#666";
    modalVipNotice.style.fontSize = "12px";
    modalVipNotice.style.marginBottom = "15px";
    modalVipNotice.innerHTML = "⚠️ <b>提示：「屏蔽关键词」功能仅对 VIP 会员开放</b>";

    // 构建模态框结构
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(modalVipNotice); // 添加在文本框之前
    modalContent.appendChild(textarea);
    modalContent.appendChild(importProgress);
    modalContent.appendChild(confirmButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // 构建按钮组DOM结构
    buttonGroup.appendChild(button);
    buttonGroup.appendChild(exportButton);
    buttonGroup.appendChild(importButton);
    buttonGroup.appendChild(clearButton);
    progressBar.appendChild(progressFill);
    buttonContainer.appendChild(vipNotice); // 添加在按钮组之前
    buttonContainer.appendChild(buttonGroup);
    buttonContainer.appendChild(progressText);
    buttonContainer.appendChild(progressBar);

    // 查找目标元素并将按钮插入
    const targetElement = document.querySelector(".wbpro-setup__line2");
    if (!targetElement) {
        console.error("Target element not found");
        return;
    }
    
    targetElement.appendChild(buttonContainer);
    buttonAdded = true;

    // 设置续命按钮初始状态
    button.disabled = false;
    button.style.backgroundColor = "#ff5722";
    button.innerText = "一键「续命」";

    // 导出按钮点击事件（移到这里）
    exportButton.addEventListener("click", async () => {
        if (!isVipUser()) {
            showErrorMessage("此功能仅限微博会员使用");
            return;
        }
        try {
            exportButton.disabled = true;
            exportButton.style.backgroundColor = "#cccccc";
            exportButton.innerText = "导出中...";

            const keywords = await fetchFilteredWords();
            const exportText = keywords
                .filter(item => item.title_sub)
                .map(item => item.title_sub)
                .join('\n');

            await navigator.clipboard.writeText(exportText);
            showSuccessMessage("屏蔽词已复制到剪贴板！");

            exportButton.disabled = false;
            exportButton.style.backgroundColor = "#2196F3";
            exportButton.innerText = "一键「导出」";
        } catch (error) {
            console.error("导出失败: ", error);
            showErrorMessage(`导出失败: ${error.message}`);
            
            exportButton.disabled = false;
            exportButton.style.backgroundColor = "#2196F3";
            exportButton.innerText = "一键「导出」";
        }
    });

    // 续命按钮点击事件
    button.addEventListener("click", async () => {
        if (!isVipUser()) {
            showErrorMessage("此功能仅限微博会员使用");
            return;
        }
        try {
            button.disabled = true;
            button.style.backgroundColor = "#cccccc";
            button.innerText = "正在处理...";
            progressBar.style.display = "block";

            const keywords = await fetchFilteredWords();
            const totalKeywords = keywords.length;

            for (let i = 0; i < totalKeywords; i++) {
                const item = keywords[i];
                if (item.title_sub) {
                    await updateBlockWord(item.title_sub, i + 1, totalKeywords, progressText);
                    progressFill.style.width = `${((i + 1) / totalKeywords) * 100}%`;
                }
            }

            localStorage.setItem('weiboRenewComplete', 'true');
            window.location.reload();
        } catch (error) {
            console.error("操作失败: ", error);
            progressText.innerText = `操作失败: ${error.message}`;
            progressBar.style.display = "none";
            
            button.disabled = false;
            button.style.backgroundColor = "#ff5722";
            button.innerText = "一键「续命」";
        }
    });

    // 导入按钮点击事件
    importButton.addEventListener("click", () => {
        if (!isVipUser()) {
            showErrorMessage("此功能仅限微博会员使用");
            return;
        }
        modal.style.display = "flex";
    });

    // 关闭按钮点击事件
    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
        textarea.value = "";
        importProgress.style.display = "none";
        confirmButton.disabled = false;
        confirmButton.style.backgroundColor = "#4CAF50";
    });

    // 确认导入按钮点击事件
    confirmButton.addEventListener("click", async () => {
        if (!isVipUser()) {
            showErrorMessage("此功能仅限微博会员使用");
            return;
        }
        try {
            const keywords = textarea.value.split('\n')
                .map(keyword => keyword.trim())
                .filter(keyword => keyword.length > 0);

            if (keywords.length === 0) {
                showErrorMessage("请输入要屏蔽的关键词");
                return;
            }

            confirmButton.disabled = true;
            confirmButton.style.backgroundColor = "#cccccc";
            importProgress.style.display = "block";
            importProgress.innerText = "正在导入...";

            // 完全串行处理所有关键词
            let processedCount = 0;
            for (const keyword of keywords) {
                await updateBlockWord(
                    keyword,
                    ++processedCount,
                    keywords.length,
                    importProgress
                );
            }

            showSuccessMessage("一键「导入」完成！");
            modal.style.display = "none";
            textarea.value = "";
            importProgress.style.display = "none";
            confirmButton.disabled = false;
            confirmButton.style.backgroundColor = "#4CAF50";

            // 刷新页面显示最新结果
            window.location.reload();
        } catch (error) {
            console.error("一键「导入」失败: ", error);
            showErrorMessage(`一键「导入」失败: ${error.message}`);
            
            confirmButton.disabled = false;
            confirmButton.style.backgroundColor = "#4CAF50";
        }
    });

    // 点击弹窗外部关闭弹窗
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            textarea.value = "";
            importProgress.style.display = "none";
            confirmButton.disabled = false;
            confirmButton.style.backgroundColor = "#4CAF50";
        }
    });

    // 清空按钮点击事件
    clearButton.addEventListener("click", async () => {
        if (!isVipUser()) {
            showErrorMessage("此功能仅限微博会员使用");
            return;
        }

        // 添加确认对话框
        if (!confirm("确定要删除所有屏蔽词吗？此操作不可恢复！")) {
            return;
        }

        try {
            clearButton.disabled = true;
            clearButton.style.backgroundColor = "#cccccc";
            clearButton.innerText = "正在清空...";
            progressBar.style.display = "block";

            const keywords = await fetchFilteredWords();
            const totalKeywords = keywords.length;

            if (totalKeywords === 0) {
                showErrorMessage("没有找到需要删除的屏蔽词");
                clearButton.disabled = false;
                clearButton.style.backgroundColor = "#FF5252";
                clearButton.innerText = "一键「清空」";
                return;
            }

            // 串行处理所有关键词
            for (let i = 0; i < totalKeywords; i++) {
                const item = keywords[i];
                if (item.title_sub) {
                    await deleteBlockWord(item.title_sub, i + 1, totalKeywords, progressText);
                    progressFill.style.width = `${((i + 1) / totalKeywords) * 100}%`;
                }
            }

            showSuccessMessage("所有屏蔽词已清空！");
            window.location.reload(); // 刷新页面显示最新结果
        } catch (error) {
            console.error("清空失败: ", error);
            progressText.innerText = `清空失败: ${error.message}`;
            progressBar.style.display = "none";
            
            clearButton.disabled = false;
            clearButton.style.backgroundColor = "#FF5252";
            clearButton.innerText = "一键「清空」";
        }
    });

    // 在添加完按钮后设置状态
    setButtonsState(button, exportButton, importButton, clearButton);
}

// 修改会员检测函数
function isVipUser() {
    try {
        // 查找所有脚本标签
        const scripts = document.querySelectorAll('script');
        let userInfo = null;

        // 遍历所有脚本标签，查找包含 $CONFIG 的内容
        for (const script of scripts) {
            const content = script.textContent || '';
            if (content.includes('$CONFIG')) {
                try {
                    // 使用更精确的正则表达式来匹配完整的用户信息
                    const configMatch = content.match(/\$CONFIG\s*=\s*({[\s\S]*?});/);
                    if (configMatch && configMatch[1]) {
                        try {
                            const config = JSON.parse(configMatch[1]);
                            if (config && config.user) {
                                userInfo = config.user;
                                console.log("成功获取用户信息:", userInfo);
                                break;
                            }
                        } catch (parseError) {
                            console.log("配置解析失败，尝试其他方法");
                        }
                    }
                } catch (e) {
                    console.log("提取配置失败:", e);
                }
            }
        }

        // 如果上面的方法失败，尝试从页面元素获取
        if (!userInfo) {
            // 尝试从页面中查找用户信息
            const userNode = document.querySelector('.gn_name[node-type="nickname"]');
            if (userNode) {
                // 如果找到用户昵称元素，说明用户已登录
                console.log("通过页面元素检测到用户已登录");
                return true;
            }
        }

        if (!userInfo) {
            console.log("未找到用户信息，暂时允许使用功能");
            return true; // 临时：如果无法获取用户信息，默认允许使用功能
        }

        // 打印用户信息，方便调试
        console.log("用户会员信息:", {
            id: userInfo.idstr,
            name: userInfo.screen_name,
            mbrank: userInfo.mbrank,
            vipUser: userInfo.vipUser
        });

        // 检查会员状态
        // mbrank: 0-无会员, 1-月会员, 6-年会员, 7-年会员...
        return userInfo.mbrank > 0 || userInfo.vipUser === 1;
    } catch (error) {
        console.error("检查会员状态失败:", error);
        return true; // 临时：如果发生错误，默认允许使用功能
    }
}

// 修改按钮状态设置函数
function setButtonsState(button, exportButton, importButton, clearButton) {
    const isVip = isVipUser();
    
    if (!isVip) {
        // 非会员状态
        button.disabled = true;
        button.style.backgroundColor = "#cccccc";
        button.style.cursor = "not-allowed";
        button.title = "仅限微博会员使用此功能";

        exportButton.disabled = true;
        exportButton.style.backgroundColor = "#cccccc";
        exportButton.style.cursor = "not-allowed";
        exportButton.title = "仅限微博会员使用此功能";

        importButton.disabled = true;
        importButton.style.backgroundColor = "#cccccc";
        importButton.style.cursor = "not-allowed";
        importButton.title = "仅限微博会员使用此功能";

        clearButton.disabled = true;
        clearButton.style.backgroundColor = "#cccccc";
        clearButton.style.cursor = "not-allowed";
        clearButton.title = "仅限微博会员使用此功能";

        // 修改提示文本颜色为警告色
        const vipNotice = document.querySelector('[data-vip-notice]');
        if (vipNotice) {
            vipNotice.style.color = "#ff5722";
        }
    } else {
        // 会员状态 - 设置正常状态
        button.disabled = false;
        button.style.backgroundColor = "#ff5722";
        button.style.cursor = "pointer";
        button.innerText = "一键「续命」";

        exportButton.disabled = false;
        exportButton.style.backgroundColor = "#2196F3";
        exportButton.style.cursor = "pointer";

        importButton.disabled = false;
        importButton.style.backgroundColor = "#4CAF50";
        importButton.style.cursor = "pointer";

        clearButton.disabled = false;
        clearButton.style.backgroundColor = "#FF5252";
        clearButton.style.cursor = "pointer";
    }
}

// 最后是事件监听器和观察器
window.addEventListener('load', () => {
    if (localStorage.getItem('weiboRenewComplete') === 'true') {
        showCompletionMessage();
        localStorage.removeItem('weiboRenewComplete');
    }
    initializePage();
});

const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        if (mutation.type === 'childList') {
            initializePage();
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
