
# 🎵 پخش زنده رادیو جوان (HLS)

این ریپو چند تا **لینک مستقیم HLS (m3u8)** + یه اسکریپت ساده Node.js برای راه‌اندازی **سرور واسط (Forwarder)** داره تا بتونی راحت پخش زنده رادیو جوان رو تماشا کنی.

سایت اصلی `play.radiojavan.com/tv` تو ایران فیلتره، ولی با لینک‌های زیر مستقیم و بدون دردسر پخش زنده موزیک‌ویدیوها رو از سرور رسمی می‌گیری.

### لینک‌های مستقیم پخش زنده

| نوع لینک                              | آدرس لینک |
|-------------------------------------|----------|
| لینک اول ( با اینترنت ایران کار می‌کنه ) | `https://radio2.tssv.ir/hls/stream.m3u8` |
| | |
| لینک دوم ( با اینترنت ایران کار می‌کنه ) | `https://radio.tssv.ir/hls/stream.m3u8` |
| | |
| لینک تانل ( اگر بقیه کار نکرد )         | `https://radio3.sr-api.ir:5555/hls/stream.m3u8` |
| | |
| | |
| | |
| | |
| سرور اصلی ( ممکنه روی بعضی اینترنت‌ها کار نکنه ) | `https://51.254.225.31/hls/stream.m3u8` |
| | |
| لینک اصلی رادیو جوان ( توی ایران فیلتره )         | `https://rjtvhls.wns.live/hls/stream.m3u8` |

---

### 🎥 پیش‌نمایش پخش زنده رادیو جوان

**لینک ۱ (بهترین و پایدارترین - با اینترنت ایران کار می‌کنه):**

<video  src="https://radio.tssv.ir/hls/stream.m3u8" type="application/x-mpegURL" controls>
  <source src="https://radio.tssv.ir/hls/stream.m3u8" type="application/x-mpegURL">
  مرورگر شما پخش زنده HLS را پشتیبانی نمی‌کن.
</video>

**لینک ۲ ( با اینترنت ایران کار می‌کنه ):**

<video >
  <source src="[https://radio.tssv.ir/hls/stream.m3u8](https://radio3.sr-api.ir:5555/hls/stream.m3u8)" type="application/x-mpegURL">
  مرورگر شما پخش زنده HLS را پشتیبانی نمی‌کند.
</video>

---
### 🚀 ServerForward.js (Node.js)

اگر دانش فنی کافی داری میتونی با اسکریپت ServerForward.js یک **TCP/TLS Forwarder**روی سرور و دامنه خودت بالا بیاری برای نیم بها کردن یا سرعت بیشتر و....
باید روی دامنه خودت این اسکریپت رو کانفیگ کنی
**اجرای سریع:**
```bash
node ServerForward.js
```
