/**
 * Static Random Pic API
 * 由构建脚本生成
 */
(function() {
    var counts = {"h":979,"v":3596};
    var domain = 'https://pic.acofork.com';
    
    // ==================== 状态管理 ====================
    
    // 背景禁用状态（从 localStorage 读取）
    var backgroundDisabled = localStorage.getItem('theme-bg-disabled') === 'true';
    
    // 记住首次加载的背景 URL（用于保持会话一致性）
    var currentBackgroundUrl = null;
    
    // 会话随机 URL 缓存
    var sessionRandomH = null;
    var sessionRandomV = null;

    // ==================== 辅助函数 ====================
    
    // 检测设备类型（移动端 vs 桌面端）
    function getDeviceType() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android|ipad|iphone|ipod|windows phone|iemobile|blackberry|mobile/i.test(userAgent)) {
            return 'mobile';
        }
        return 'desktop';
    }

    // 获取指定类型（h 或 v）的随机 URL，同一会话内保持一致
    function getRandomUrl(type) {
        if (!counts[type] || counts[type] === 0) return '';
        
        // 如果存在会话 URL 则返回
        if (type === 'h' && sessionRandomH) return sessionRandomH;
        if (type === 'v' && sessionRandomV) return sessionRandomV;

        // 如果不存在则生成新的
        var num = Math.floor(Math.random() * counts[type]) + 1;
        var url = domain + '/ri/' + type + '/' + num + '.webp';

        // 保存到会话状态
        if (type === 'h') sessionRandomH = url;
        if (type === 'v') sessionRandomV = url;

        return url;
    }

    // 根据设备类型获取随机 URL
    function getRandomUrlByDevice() {
        var deviceType = getDeviceType();
        var type = deviceType === 'mobile' ? 'v' : 'h';
        return getRandomUrl(type);
    }

    // ==================== 全局函数暴露 ====================
    
    window.getRandomPicH = function() { return getRandomUrl('h'); };
    window.getRandomPicV = function() { return getRandomUrl('v'); };
    window.getRandomPic = function() { return getRandomUrlByDevice(); };

    // ==================== 背景设置逻辑 ====================
    
    function setRandomBackground() {
        // 如果禁用，清除背景并退出
        if (backgroundDisabled) {
            const bgBox = document.getElementById('bg-box');
            if (bgBox) {
                bgBox.style.backgroundImage = 'none';
                bgBox.classList.remove('loaded');
            }
            if (document.body.classList.contains('wp-theme-zibll')) {
                document.body.style.backgroundImage = 'none';
                document.body.classList.remove('loaded');
            }
            console.log('[RandomPic] 背景已禁用');
            return;
        }
        
        // 优先使用已缓存的 currentBackgroundUrl
        let bgUrl = currentBackgroundUrl;
        if (!bgUrl) {
            bgUrl = getRandomUrlByDevice();
            currentBackgroundUrl = bgUrl; // 首次加载时缓存
        }
        
        // 查找背景框元素
        const bgBox = document.getElementById('bg-box'); 
          
        if (bgBox) { 
            // 方案1：使用 #bg-box 元素
            const img = new Image(); 
            img.onload = function() { 
                bgBox.style.backgroundImage = `url('${bgUrl}')`; 
                bgBox.classList.add('loaded'); 
                console.log('随机背景已加载:', bgUrl); 
                
                // 设置 CSS 变量以实现透明效果
                document.documentElement.style.setProperty('--card-bg', 'var(--card-bg-transparent)'); 
                document.documentElement.style.setProperty('--float-panel-bg', 'var(--float-panel-bg-transparent)'); 
            }; 
            img.onerror = function() { 
                console.error('背景图片加载失败:', bgUrl); 
            }; 
            img.src = bgUrl; 
        } else if (document.body.classList.contains('wp-theme-zibll')) {
            // 方案2：wp-theme-zibll 主题，设置 body 的背景
            const img = new Image(); 
            img.onload = function() { 
                document.body.style.backgroundImage = `url('${bgUrl}')`; 
                document.body.style.backgroundPosition = 'center top';
                document.body.style.backgroundRepeat = 'no-repeat';
                document.body.style.backgroundAttachment = 'fixed';
                document.body.style.backgroundSize = 'cover';
                document.body.classList.add('loaded'); 
                console.log('随机背景已加载到 body (wp-theme-zibll):', bgUrl); 
            }; 
            img.onerror = function() { 
                console.error('body 背景图片加载失败 (wp-theme-zibll):', bgUrl); 
            }; 
            img.src = bgUrl; 
        } else { 
            // 方案3：回退方案，检查 data-random-bg 属性
            initGenericBackgrounds();
        } 
    }

    // ==================== 图片标签处理 ====================
    
    function initImgTags() {
        var imgTags = document.getElementsByTagName('img');
        for (var i = 0; i < imgTags.length; i++) {
            var img = imgTags[i];
            var alt = img.getAttribute('alt');
            var src = img.getAttribute('src');

            if (alt === 'random:h' || (src && src.indexOf('/random/h') !== -1)) {
                img.src = getRandomUrl('h');
            } else if (alt === 'random:v' || (src && src.indexOf('/random/v') !== -1)) {
                img.src = getRandomUrl('v');
            }
        }
    }

    // 通用 data-random-bg 的辅助函数（作为备用或次要功能）
    function initGenericBackgrounds() {
        var bgElements = document.querySelectorAll('[data-random-bg]');
        bgElements.forEach(function(el) {
            // 跳过 bg-box（虽然 setRandomBackground 已经专门处理了 #bg-box）
            if (el.id === 'bg-box') return;

            var type = el.getAttribute('data-random-bg');
            if (type === 'h' || type === 'v') {
                var url = getRandomUrl(type);
                if (url) {
                    var img = new Image();
                    img.onload = function() {
                        el.style.backgroundImage = 'url("' + url + '")';
                        el.classList.add('loaded');
                    };
                    img.src = url;
                }
            }
        });
    }

    // ==================== 初始化逻辑 ====================
    
    function init() {
        setRandomBackground();
        initImgTags();
    }
  
    // 初始加载时运行
    if (document.readyState === 'loading') { 
        document.addEventListener('DOMContentLoaded', init); 
    } else { 
        init(); 
    } 
  
    // ==================== Swup 集成 ====================
    
    function setupSwup() {
        if (window.swup && window.swup.hooks) {
            // 注册内容替换钩子
            window.swup.hooks.on('content:replace', init);
            console.log('Random Pic API: 已注册到 Swup 钩子。');
        }
    }

    if (window.swup) {
        setupSwup();
    } else {
        document.addEventListener('swup:enable', setupSwup);
    }

    // 旧版 Swup 支持
    document.addEventListener('swup:contentReplaced', init); 
    
    // ==================== 全局控制接口 ====================
    
    // 设置背景禁用状态
    window.setBackgroundDisabled = function(disabled) {
        backgroundDisabled = Boolean(disabled);
        localStorage.setItem('theme-bg-disabled', backgroundDisabled);
        setRandomBackground(); // 重新应用
    };
    
    // 更换壁纸接口
    window.refreshRandomBackground = function() {
        // 强制清除所有缓存
        sessionRandomH = null;
        sessionRandomV = null;
        currentBackgroundUrl = null;
    
        // 如果背景未被禁用，则立即加载新图
        if (!backgroundDisabled) {
            setRandomBackground();
            console.log('[RandomPic] 壁纸已更换');
        } else {
            console.log('[RandomPic] 壁纸已预生成，但背景处于禁用状态');
        }
    };
    
})();
