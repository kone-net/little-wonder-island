(()=>{'use strict';const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function direct(v){if(!/^[\w-]{11}$/.test(v.videoId))throw Error('Invalid video');return 'https://www.youtube.com/watch?v='+v.videoId;}
function render(v){const href=direct(v);return '<div class="u-video-help"><a class="x-btn" data-u="openYouTube" href="'+esc(href)+'" target="_blank" rel="noopener">↗ 在 YouTube 打开本集</a><button class="x-btn" data-u="copyVideo" data-url="'+esc(href)+'">复制本集链接</button><details><summary>已登录，仍提示验证？</summary><p>课堂嵌入播放器和 Chrome 的登录环境可能不同。复制本集链接，在你已经登录的 Chrome 中打开。看完回到课堂继续即可。</p></details><input id="uVideoLink" readonly value="'+esc(href)+'" aria-label="本集 YouTube 链接" hidden></div>';}
window.ClassroomVideoHelp={render,direct};
})();
