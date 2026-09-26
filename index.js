import htmlContent from './403.html';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Chỉ xử lý route /loader
    if (url.pathname === '/loader') {
      const userAgent = request.headers.get('user-agent') || '';
      const clientAuth = request.headers.get('authorization');
      const clientTime = request.headers.get('x-timestamp');

      const isBrowser = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari');

      let isValid = false;

      if (clientAuth && clientTime) {
        const currentTime = Math.floor(Date.now() / 1000);
        const reqTime = parseInt(clientTime, 10);

        // Kiểm tra lệch thời gian không quá 10 giây
        if (!isNaN(reqTime) && Math.abs(currentTime - reqTime) <= 10) {
          // Tính HMAC MD5 chuẩn Web Crypto API
          const secretKey = env.SECRET_KEY || '';
          const dataToHash = clientTime + secretKey;
          const expectedAuth = await md5(dataToHash);

          if (clientAuth === expectedAuth) {
            isValid = true;
          }
        }
      }

      // Nếu là trình duyệt hoặc Auth không hợp lệ -> Trả về trang Arcade 403 HTML
      if (isBrowser || !isValid) {
        return new Response(htmlContent, {
          status: 403,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      }

      // Hợp lệ: Kéo script bảo mật về trả cho Roblox Client
      try {
        const secretScriptUrl = env.SECRET_SCRIPT_URL;
        if (!secretScriptUrl) {
          throw new Error('Chưa cấu hình SECRET_SCRIPT_URL');
        }

        const scriptResponse = await fetch(secretScriptUrl);
        const scriptData = await scriptResponse.text();

        return new Response(scriptData, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      } catch (error) {
        return new Response('print("Server Error!")', {
          status: 500,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      }
    }

    // Các path khác mặc định trả về 404
    return new Response('Not Found', { status: 404 });
  },
};

// Hàm bổ trợ mã hóa MD5 tương thích Cloudflare Workers
async function md5(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
