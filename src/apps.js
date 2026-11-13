// Built-in client list, used when the panel does not provide its own apps.
// Import URL placeholders: {url} raw link, {url_enc} URL-encoded link, {name} account name.
const d = (fa, en) => ({ fa, en });
const GH = 'GitHub';

const hiddify = (platform, recommended, links) => ({
  name: 'Hiddify', platform, recommended,
  import_url: 'hiddify://import/{url}#{name}',
  description: d('ساده و همه‌کاره؛ اشتراک را با یک لمس اضافه می‌کند.', 'Simple all-in-one client with one-tap import.'),
  download_links: links,
});
const HIDDIFY_GH = { name: GH, url: 'https://github.com/hiddify/hiddify-app/releases/latest' };

export const DEFAULT_APPS = [
  {
    name: 'v2rayNG', platform: 'android', recommended: true,
    import_url: 'v2rayng://install-config?url={url_enc}#{name}',
    description: d('محبوب‌ترین برنامه‌ی اندروید؛ سبک و پایدار.', 'The most popular Android client; light and stable.'),
    download_links: [
      { name: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.v2ray.ang' },
      { name: GH, url: 'https://github.com/2dust/v2rayNG/releases/latest' },
    ],
  },
  hiddify('android', false, [
    { name: 'Google Play', url: 'https://play.google.com/store/apps/details?id=app.hiddify.com' },
    HIDDIFY_GH,
  ]),
  {
    name: 'Happ', platform: 'android', recommended: false,
    import_url: 'happ://add/{url}',
    description: d('رابط کاربری مدرن با پشتیبانی کامل از اشتراک.', 'Modern interface with full subscription support.'),
    download_links: [{ name: 'Google Play', url: 'https://play.google.com/store/apps/details?id=com.happproxy' }],
  },
  {
    name: 'Streisand', platform: 'ios', recommended: true,
    import_url: 'streisand://import/{url}#{name}',
    description: d('رایگان و ساده برای آیفون و آیپد.', 'Free and simple for iPhone and iPad.'),
    download_links: [{ name: 'App Store', url: 'https://apps.apple.com/us/app/streisand/id6450534064' }],
  },
  {
    name: 'V2Box', platform: 'ios', recommended: false,
    import_url: 'v2box://install-sub?url={url_enc}&name={name}',
    description: d('سبک و سریع با پشتیبانی از بیشتر پروتکل‌ها.', 'Light and fast, supports most protocols.'),
    download_links: [{ name: 'App Store', url: 'https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690' }],
  },
  {
    name: 'Happ', platform: 'ios', recommended: false,
    import_url: 'happ://add/{url}',
    description: d('رابط کاربری مدرن با پشتیبانی کامل از اشتراک.', 'Modern interface with full subscription support.'),
    download_links: [{ name: 'App Store', url: 'https://apps.apple.com/us/app/happ-proxy-utility/id6504287215' }],
  },
  {
    name: 'v2rayN', platform: 'windows', recommended: true,
    import_url: '',
    description: d('برنامه‌ی کامل ویندوز؛ لینک اشتراک را در بخش Subscription وارد کنید.', 'Full-featured Windows client; paste the link under Subscription.'),
    download_links: [{ name: GH, url: 'https://github.com/2dust/v2rayN/releases/latest' }],
  },
  hiddify('windows', false, [HIDDIFY_GH]),
  hiddify('macos', true, [HIDDIFY_GH]),
  {
    name: 'V2Box', platform: 'macos', recommended: false,
    import_url: 'v2box://install-sub?url={url_enc}&name={name}',
    description: d('نسخه‌ی مک از اپ‌استور.', 'macOS version from the App Store.'),
    download_links: [{ name: 'App Store', url: 'https://apps.apple.com/us/app/v2box-v2ray-client/id6446814690' }],
  },
  hiddify('linux', true, [HIDDIFY_GH]),
  {
    name: 'v2rayN', platform: 'linux', recommended: false,
    import_url: '',
    description: d('نسخه‌ی لینوکس v2rayN؛ لینک اشتراک را دستی وارد کنید.', 'Linux build of v2rayN; paste the link manually.'),
    download_links: [{ name: GH, url: 'https://github.com/2dust/v2rayN/releases/latest' }],
  },
];
