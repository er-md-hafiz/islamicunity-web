const en = { title: "Qibla Finder", subtitle: "Every place can be a place of connection.", find: "Find Qibla", locating: "Finding your location…", enable: "Enable device compass", retry: "Retry location", recalibrate: "Recalibrate", initial: "Enable location to calculate your Qibla bearing. No location is assumed.", manual: "Manual true-north bearing", live: "Live direction · reference confirmed", north: "Clockwise from true north", refresh: "Refresh location", location: "Current location", reference: "Sensor north reference", unknown: "Not confirmed — manual bearing", magnetic: "Magnetic north (apply WMM2025)", true: "True north (already corrected)" };
const translations = {
  en,
  hi: { title: "क़िबला दिशा", subtitle: "हर जगह जुड़ाव की जगह बन सकती है।", find: "क़िबला खोजें", locating: "आपकी स्थिति खोज रहे हैं…", enable: "डिवाइस कंपास चालू करें", retry: "स्थिति फिर खोजें", recalibrate: "फिर कैलिब्रेट करें", initial: "क़िबला गणना के लिए स्थान चालू करें। कोई स्थान पहले से नहीं माना गया है।", manual: "वास्तविक उत्तर से दिशा", live: "लाइव दिशा · उत्तर संदर्भ की पुष्टि हुई", north: "वास्तविक उत्तर से घड़ी की दिशा में", refresh: "स्थान अपडेट करें", location: "वर्तमान स्थान", reference: "सेंसर का उत्तर संदर्भ", unknown: "पुष्टि नहीं — मैनुअल दिशा", magnetic: "चुंबकीय उत्तर (WMM2025 सुधार)", true: "वास्तविक उत्तर (पहले से सुधारा गया)" },
  ur: { title: "قبلہ کی سمت", subtitle: "ہر جگہ تعلق کی جگہ بن سکتی ہے۔", find: "قبلہ تلاش کریں", locating: "مقام تلاش ہو رہا ہے…", enable: "ڈیوائس کمپاس فعال کریں", retry: "مقام دوبارہ تلاش کریں", recalibrate: "دوبارہ کیلیبریٹ کریں", initial: "قبلہ معلوم کرنے کے لیے مقام فعال کریں۔ کوئی مقام فرض نہیں کیا گیا۔", manual: "حقیقی شمال سے سمت", live: "براہ راست سمت · شمال کی تصدیق", north: "حقیقی شمال سے گھڑی کی سمت", refresh: "مقام تازہ کریں", location: "موجودہ مقام", reference: "سینسر کا شمالی حوالہ", unknown: "غیر مصدقہ — دستی سمت", magnetic: "مقناطیسی شمال (WMM2025 تصحیح)", true: "حقیقی شمال (پہلے سے درست)" },
  ar: { title: "اتجاه القبلة", subtitle: "كل مكان يمكن أن يكون مكانًا للتواصل.", find: "ابحث عن القبلة", locating: "جارٍ تحديد موقعك…", enable: "تفعيل بوصلة الجهاز", retry: "إعادة تحديد الموقع", recalibrate: "إعادة المعايرة", initial: "فعّل الموقع لحساب اتجاه القبلة. لا يتم افتراض أي موقع.", manual: "اتجاه يدوي من الشمال الحقيقي", live: "اتجاه مباشر · تم تأكيد مرجع الشمال", north: "باتجاه عقارب الساعة من الشمال الحقيقي", refresh: "تحديث الموقع", location: "الموقع الحالي", reference: "مرجع شمال المستشعر", unknown: "غير مؤكد — اتجاه يدوي", magnetic: "الشمال المغناطيسي (تصحيح WMM2025)", true: "الشمال الحقيقي (مصحح بالفعل)" },
};
export const qiblaCopy = language => ({ ...en, ...translations[language] });
export const locationErrors = {
  denied: "Location permission denied. Enable location for this site in browser settings, then retry. In the Android app, its host must also grant location access.",
  timeout: "Location detection timed out. Move to an open area and retry.",
  unavailable: "Your location could not be determined. Check device location services and retry.",
  invalid: "The device returned invalid coordinates. Retry location detection.",
  unsupported: "Location requires HTTPS and a browser or WebView with geolocation support.",
};
export const sensorMessages = {
  initial: "Compass is off. You can use the manual true-north bearing after enabling location.",
  waiting: "Waiting for an absolute compass reading. Keep the phone flat, screen facing up.",
  unsupported: "No usable absolute compass readings received. Use the manual true-north bearing.",
  denied: "Compass permission denied. Allow motion/orientation access in browser settings, then enable the compass again.",
  stale: "Compass readings stopped. Live direction is paused; restart the compass or use manual alignment.",
  paused: "Compass paused while the page was hidden. Enable it again when ready.",
  tilted: "Keep the phone flat with the screen facing up. Live direction is paused while the device is tilted.",
  unreliable: "Sensor readings are unreliable. Move away from magnets and metal, make a figure-eight motion, then restart readings.",
};
