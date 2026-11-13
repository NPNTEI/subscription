# قالب صفحه‌ی اشتراک PasarGuard

یک صفحه‌ی اشتراک تک‌فایلی، سبک و واکنش‌گرا برای پنل PasarGuard.

## امکانات

- نمایش حجم باقی‌مانده، مصرف، اعتبار، وضعیت و آخرین اتصال
- کپی لینک اشتراک و کد QR
- لیست برنامه‌ها بر اساس دستگاه کاربر با دکمه‌ی «افزودن به برنامه» (اگر در پنل برنامه‌ای تعریف نشده باشد، لیست پیش‌فرض `src/apps.js` نمایش داده می‌شود)
- راهنمای سه‌مرحله‌ای اتصال
- لیست کانفیگ‌ها با آدرس، نوع اتصال، کپی تکی، کپی همه و QR
- نمودار مصرف (۲۴ ساعت، ۷ روز، ۳۰ روز) با مجموع، میانگین و بیشترین
- اطلاعیه و دکمه‌ی پشتیبانی (از تنظیمات پنل)
- حالت تیره و روشن
- زبان‌ها: `fa`، `en`، `ru`، `zh` (کاربر می‌تواند در صفحه عوض کند)
- بدون وابستگی به CDN؛ فونت و همه‌چیز داخل یک فایل است

## نصب سریع

```sh
curl -fsSL https://raw.githubusercontent.com/NPNTEI/subscription/main/install.sh | sudo bash -s -- --lang fa
```

- `--lang`: زبان پیش‌فرض صفحه (`fa`، `en`، `ru`، `zh`)
- `--version`: نام شاخه یا تگ (پیش‌فرض `main`)

اسکریپت فایل را در `/var/lib/pasarguard/templates/subscription/index.html` می‌گذارد، دو خط زیر را در `/opt/pasarguard/.env` تنظیم می‌کند و پنل را ری‌استارت می‌کند. اگر قالب قبلی وجود داشته باشد، کنار آن با پسوند `.bak` نگه داشته می‌شود.

## نصب دستی

```sh
sudo mkdir -p /var/lib/pasarguard/templates/subscription
sudo curl -fsSL https://raw.githubusercontent.com/NPNTEI/subscription/main/index.html \
  -o /var/lib/pasarguard/templates/subscription/index.html
```

در `/opt/pasarguard/.env`:

```dotenv
CUSTOM_TEMPLATES_DIRECTORY="/var/lib/pasarguard/templates/"
SUBSCRIPTION_PAGE_TEMPLATE="subscription/index.html"
```

```sh
pasarguard restart
```

## ساخت از سورس

```sh
npm install
npm run build
```

خروجی `index.html` در ریشه‌ی مخزن ساخته می‌شود. رنگ‌ها و گردی گوشه‌ها در ابتدای `src/style.css` و متن‌ها در `src/i18n.js` قابل تغییرند.
