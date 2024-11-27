document.addEventListener('DOMContentLoaded', () => {
    // 初始化 AOS 动画库
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');

    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.textContent = '蓝月正在输入...';
    messagesContainer.appendChild(typingIndicator);

    let messageHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

    function loadHistory() {
        messageHistory.forEach(msg => {
            addMessage(msg.content, msg.isUser, msg.timestamp, false);
        });
    }

    function saveToHistory(content, isUser) {
        const message = {
            content,
            isUser,
            timestamp: new Date().toISOString()
        };
        messageHistory.push(message);
        localStorage.setItem('chatHistory', JSON.stringify(messageHistory));
    }

    function addMessage(content, isUser = false, timestamp = new Date().toISOString(), save = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isUser ? 'user-message' : 'ai-message');
        messageDiv.classList.add('animate__animated', 'animate__fadeIn');
        
        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const textDiv = document.createElement('div');
        textDiv.classList.add('message-content');
        
        const textContent = document.createElement('div');
        textContent.textContent = content;
        
        const timeDiv = document.createElement('div');
        timeDiv.classList.add('message-timestamp');
        timeDiv.textContent = new Date(timestamp).toLocaleString();
        
        textDiv.appendChild(textContent);
        textDiv.appendChild(timeDiv);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(textDiv);
        messagesContainer.appendChild(messageDiv);
        
        if (save) {
            saveToHistory(content, isUser);
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function toggleTypingIndicator(visible) {
        typingIndicator.classList.toggle('visible', visible);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessageToAPI(message) {
        try {
            console.log('Sending message to API:', message);
            
            const response = await fetch('https://app.wenwen-ai.com/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer sk-jbDQVsnY4j7ZBpdVV1eIXuEN2RMSqw4ucvzBjuL8Bd69xTMyHGSg',
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
                    'Host': 'app.wenwen-ai.com',
                    'Connection': 'keep-alive'
                },
                body: JSON.stringify({
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {
                            "role": "system", 
                            "content": "你是蓝月，一位品牌营销专家、小红书个人品牌教练和AI自动化专家。你有15年品牌营销经验，是小红书博主，最高月涨粉8k。你是斑码AI社群专属IP变现教练，你的IP学员第二个月收入过万。你教授《斑码AI自动化爆款训练营》和《破局产品打造行动营》。你可以为用户提供小红书运营、AI自动化和品牌营销方面的咨询。"
                        },
                        {"role": "user", "content": message}
                    ],
                    "temperature": 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers),
                    error: errorText
                });
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('API Response data:', data);

            // 检查响应格式
            if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
                console.error('Unexpected API response format:', data);
                throw new Error('Invalid API response format');
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async function handleSend() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            userInput.style.height = 'auto';
            
            toggleTypingIndicator(true);
            
            try {
                const reply = await sendMessageToAPI(message);
                toggleTypingIndicator(false);
                addMessage(reply);
            } catch (error) {
                console.error('Error:', error);
                toggleTypingIndicator(false);
                addMessage('抱歉，发生了错误，请稍后重试。');
            }
        }
    }

    function exportChat() {
        const text = messageHistory.map(msg => 
            `[${new Date(msg.timestamp).toLocaleString()}] ${msg.isUser ? '访客' : '蓝月'}: ${msg.content}`
        ).join('\n');
        
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `与蓝月的对话记录_${new Date().toLocaleDateString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function clearChat() {
        if (confirm('确定要清空所有聊天记录吗？')) {
            messageHistory = [];
            localStorage.removeItem('chatHistory');
            messagesContainer.innerHTML = '';
            messagesContainer.appendChild(typingIndicator);
            addMessage('聊天记录已清空。');
        }
    }

    exportBtn.addEventListener('click', exportChat);
    clearBtn.addEventListener('click', clearChat);
    
    sendButton.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + 'px';
    });

    loadHistory();
    if (messageHistory.length === 0) {
        addMessage('你好！我是蓝月，很高兴为您服务。我可以为您提供小红书运营、AI自动化和品牌营销方面的咨询。');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });

    // 替换原有的 showWechat 函数和社交链接事件监听
    function createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
        return tooltip;
    }

    function showTooltip(text, event) {
        const tooltip = document.querySelector('.tooltip') || createTooltip();
        tooltip.textContent = text;
        tooltip.classList.add('show');
        
        // 计算位置
        const rect = event.target.closest('a').getBoundingClientRect();
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        tooltip.style.top = `${rect.bottom + 10}px`;
    }

    function hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }

    // 为社交链接添加事件监听
    document.querySelectorAll('.social-links a').forEach(link => {
        const isExternalLink = link.hasAttribute('href') && link.getAttribute('href').startsWith('http');
        
        if (!isExternalLink) {
            // 非链接的处理（微信和电话）
            link.addEventListener('mouseenter', (e) => {
                const contactInfo = link.getAttribute('title').split('：')[1];
                showTooltip(contactInfo, e);
            });
            
            link.addEventListener('mouseleave', hideTooltip);
            
            // 点击时的处理
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const contactInfo = link.getAttribute('title').split('：')[1];
                // 创建临时输入框来复制文本
                const tempInput = document.createElement('input');
                tempInput.value = contactInfo;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                // 显示复制成功提示
                showTooltip('已复制到剪贴板！', e);
                setTimeout(hideTooltip, 1500);
            });
        }
    });

    // 移除原有的 showWechat 函数
    // 更新 HTML 中的 onclick
    document.querySelector('.social-links a[title*="微信"]').removeAttribute('onclick');
}); 