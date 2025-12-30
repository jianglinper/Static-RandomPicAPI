/**
 * Static Random Pic API
 * 由构建脚本生成
 */
(function() {
    var counts = {"h":979,"v":3596};
    var domain = 'https://pic.olinl.com';
    
    // 会话一致性状态管理
    var sessionRandomH = null;
    var sessionRandomV = null;

    // 辅助函数：检测设备类型（移动端 vs 桌面端）
    function getDeviceType() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android|ipad|iphone|ipod|windows phone|iemobile|blackberry|mobile/i.test(userAgent)) {
            return 'mobile';
        }
        return 'desktop';
    }

    // 辅助函数：获取指定类型（h 或 v）的随机 URL，同一会话内保持一致
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

    
    // 辅助函数：根据设备类型获取随机 URL
    function getRandomUrlByDevice() {
        var deviceType = getDeviceType();
        var type = deviceType === 'mobile' ? 'v' : 'h';
        return getRandomUrl(type);
    }

    // 暴露全局函数
    window.getRandomPicH = function() { return getRandomUrl('h'); };
    window.getRandomPicV = function() { return getRandomUrl('v'); };
    window.getRandomPic = function() { return getRandomUrlByDevice(); };

    // 1. 背景逻辑（根据用户需求定制）
    function setRandomBackground() { 

         // // 使用辅助函数获取随机 URL（动态计数和域名）
         //const bgUrl = getRandomUrl('h');

         // 根据设备类型获取随机 URL
         const bgUrl = getRandomUrlByDevice();
          
         // 查找背景框元素
         const bgBox = document.getElementById('bg-box'); 
          
         if (bgBox) { 
             // 预加载图片
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
             // 如果 body 的 class 包含 wp-theme-zibll，则设置 body 的背景
             const img = new Image(); 
             img.onload = function() { 
                 document.body.style.backgroundImage = `url('${bgUrl}')`; 
                 document.body.classList.add('loaded'); 
                 console.log('随机背景已加载到 body (wp-theme-zibll):', bgUrl); 
             }; 
             img.onerror = function() { 
                 console.error('body 背景图片加载失败 (wp-theme-zibll):', bgUrl); 
             }; 
             img.src = bgUrl; 
         } else { 
             // 回退：如果没有 #bg-box，检查 data-random-bg 以实现向后兼容/其他元素
             // 这保留了通用功能（如果需要），但优先处理上面的用户特定逻辑。
             initGenericBackgrounds();
         } 
    }

    // 2. 图片标签逻辑（通用）
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

         // 回退：如果没有找到 data-random-bg 元素，则在 body 上设置背景
        // if (bgElements.length === 0) {
        //     var bgUrl = getRandomUrlByDevice();
        //     if (bgUrl) {
        //         var img = new Image();
        //         img.onload = function() {
        //             document.body.style.backgroundImage = 'url("' + bgUrl + '")';
        //             document.body.classList.add('loaded');
        //             console.log('随机背景已加载到 body:', bgUrl);
        //         };
        //         img.onerror = function() {
        //             console.error('body 背景图片加载失败:', bgUrl);
        //         };
        //         img.src = bgUrl;
        //     }
        // }
    }

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
  
    // Swup 集成
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
})();
