// התראות דחיפה — OneSignal
// נטען בכל עמודי האתר; שואל את הגולש אם לאשר קבלת התראות
(function () {
  var s = document.createElement('script');
  s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  s.defer = true;
  document.head.appendChild(s);
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function (OneSignal) {
    await OneSignal.init({
      appId: '466f3fcf-f74e-4a0d-a6c8-d469728121ad',
      promptOptions: {
        slidedown: {
          prompts: [{
            type: 'push',
            autoPrompt: true,
            delay: { pageViews: 1, timeDelay: 3 },
            text: {
              actionMessage: 'רוצים לקבל התראה כשעולה שיחה חדשה מתורגמת?',
              acceptButton: 'כן, עדכנו אותי',
              cancelButton: 'לא עכשיו'
            }
          }]
        }
      }
    });
  });
})();
