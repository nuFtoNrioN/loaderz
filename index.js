function md5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000); lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000); lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else return (lResult ^ lX8 ^ lY8);
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return y ^ (x | (~z)); }
  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(Dưới đây là mã nguồn `index.js` đã được viết lại cho **Cloudflare Worker** dựa trên logic cũ của bạn:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Chỉ xử lý các yêu cầu đến route /loader
    if (url.pathname === '/loader') {
      const userAgent = request.headers.get('user-agent') || '';
      const clientAuth = request.headers.get('authorization');
      const clientTime = request.headers.get('x-timestamp');

      // Kiểm tra xem request có đến từ trình duyệt hay không
      const isBrowser = userAgent.includes('Mozilla') || 
                        userAgent.includes('Chrome') || 
                        userAgent.includes('Safari');

      let isValid = false;

      // Xác thực chữ ký mã hóa
      if (clientAuth && clientTime) {
        const currentTime = Math.floor(Date.now() / 1000);
        const reqTime = parseInt(clientTime, 10);

        // Kiểm tra chênh lệch thời gian (trong khoảng 10 giây)
        if (Math.abs(currentTime - reqTime) <= 10) {
          // Khởi tạo chuỗi MD5 bằng Web Crypto API
          const encoder = new TextEncoder();
          const data = encoder.encode(clientTime + env.SECRET_KEY);
          const hashBuffer = await crypto.subtle.digest('MD5', data);
          
          // Chuyển kết quả hash thành chuỗi Hex
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const expectedAuth = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

          if (clientAuth === expectedAuth) {
            isValid = true;
          }
        }
      }

      // Nếu truy cập từ trình duyệt hoặc không hợp lệ -> Chặn (403)
      if (isBrowser || !isValid) {
        return new Response('403 Access Denied', { 
          status: 403,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }

      // Lấy đoạn script từ SECRET_SCRIPT_URL
      try {
        const scriptResponse = await fetch(env.SECRET_SCRIPT_URL);
        const scriptData = await scriptResponse.text();

        return new Response(scriptData, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      } catch (error) {
        return new Response('print("Server Error!")', {
          status: 500,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    }

    // Trả về 404 cho các đường dẫn khác
    return new Response('Not Found', { status: 404 });
  }
};
