import { useState, useEffect } from "react";

const welcomeTranslations = [
  { lang: "English", text: "Welcome" },
  { lang: "Spanish", text: "Bienvenido" },
  { lang: "French", text: "Bienvenue" },
  { lang: "German", text: "Willkommen" },
  { lang: "Italian", text: "Benvenuto" },
  { lang: "Portuguese", text: "Bem-vindo" },
  { lang: "Dutch", text: "Welkom" },
  { lang: "Russian", text: "Добро пожаловать" },
  { lang: "Japanese", text: "ようこそ" },
  { lang: "Chinese", text: "欢迎" },
  { lang: "Korean", text: "환영합니다" },
  { lang: "Arabic", text: "أهلا وسهلا" },
  { lang: "Hindi", text: "स्वागत है" },
  { lang: "Bengali", text: "স্বাগতম" },
  { lang: "Turkish", text: "Hoş geldiniz" },
  { lang: "Vietnamese", text: "Chào mừng" },
  { lang: "Polish", text: "Witamy" },
  { lang: "Ukrainian", text: "Ласкаво просимо" },
  { lang: "Romanian", text: "Bun venit" },
  { lang: "Greek", text: "Καλώς ήρθατε" },
  { lang: "Czech", text: "Vítejte" },
  { lang: "Swedish", text: "Välkommen" },
  { lang: "Hungarian", text: "Üdvözöljük" },
  { lang: "Finnish", text: "Tervetuloa" },
  { lang: "Norwegian", text: "Velkommen" },
  { lang: "Danish", text: "Velkommen" },
  { lang: "Thai", text: "ยินดีต้อนรับ" },
  { lang: "Hebrew", text: "ברוך הבא" },
  { lang: "Indonesian", text: "Selamat datang" },
  { lang: "Malay", text: "Selamat datang" },
  { lang: "Filipino", text: "Maligayang pagdating" },
  { lang: "Swahili", text: "Karibu" },
  { lang: "Persian", text: "خوش آمدید" },
  { lang: "Urdu", text: "خوش آمدید" },
  { lang: "Tamil", text: "வரவேற்பு" },
  { lang: "Telugu", text: "స్వాగతం" },
  { lang: "Marathi", text: "स्वागत आहे" },
  { lang: "Gujarati", text: "સ્વાગત છે" },
  { lang: "Kannada", text: "ಸ್ವಾಗತ" },
  { lang: "Malayalam", text: "സ്വാഗതം" },
  { lang: "Punjabi", text: "ਸਵਾਗਤ ਹੈ" },
  { lang: "Sinhala", text: "ආයුබෝවන්" },
  { lang: "Khmer", text: "សូមស្វាគមន៍" },
  { lang: "Lao", text: "ຍິນດີຕ້ອນຮັບ" },
  { lang: "Burmese", text: "ကြိုဆိုပါတယ်" },
  { lang: "Mongolian", text: "Тавтай морилно уу" },
  { lang: "Nepali", text: "स्वागत छ" },
  { lang: "Albanian", text: "Mirë se vini" },
  { lang: "Serbian", text: "Добродошли" },
  { lang: "Croatian", text: "Dobrodošli" },
  { lang: "Bosnian", text: "Dobrodošli" },
  { lang: "Slovenian", text: "Dobrodošli" },
  { lang: "Slovak", text: "Vitajte" },
  { lang: "Bulgarian", text: "Добре дошли" },
  { lang: "Macedonian", text: "Добредојдовте" },
  { lang: "Estonian", text: "Tere tulemast" },
  { lang: "Latvian", text: "Laipni lūdzam" },
  { lang: "Lithuanian", text: "Sveiki atvykę" },
  { lang: "Icelandic", text: "Velkomin" },
  { lang: "Irish", text: "Fáilte" },
  { lang: "Welsh", text: "Croeso" },
  { lang: "Scottish", text: "Fàilte" },
  { lang: "Basque", text: "Ongi etorri" },
  { lang: "Catalan", text: "Benvingut" },
  { lang: "Galician", text: "Benvido" },
  { lang: "Maltese", text: "Merħba" },
  { lang: "Georgian", text: "კეთილი იყოს თქვენი მობრძანება" },
  { lang: "Armenian", text: "Բարի գալուստ" },
  { lang: "Kazakh", text: "Қош келдіңіз" },
  { lang: "Uzbek", text: "Xush kelibsiz" },
  { lang: "Azerbaijani", text: "Xoş gəlmisiniz" },
  { lang: "Tajik", text: "Хуш омадед" },
  { lang: "Turkmen", text: "Hoş geldiňiz" },
  { lang: "Kyrgyz", text: "Кош келиңиз" },
  { lang: "Amharic", text: "እንኳን ደህና መጡ" },
  { lang: "Somali", text: "Soo dhawow" },
  { lang: "Hausa", text: "Barka da zuwa" },
  { lang: "Yoruba", text: "Ẹ káàbọ̀" },
  { lang: "Igbo", text: "Nnọọ" },
  { lang: "Zulu", text: "Siyakwamukela" },
  { lang: "Xhosa", text: "Wamkelekile" },
  { lang: "Afrikaans", text: "Welkom" },
  { lang: "Malagasy", text: "Tonga soa" },
  { lang: "Sesotho", text: "Rea u amohela" },
  { lang: "Shona", text: "Mauya" },
  { lang: "Kinyarwanda", text: "Murakaza neza" },
  { lang: "Esperanto", text: "Bonvenon" },
  { lang: "Latin", text: "Salve" },
  { lang: "Hawaiian", text: "Aloha" },
  { lang: "Maori", text: "Haere mai" },
  { lang: "Samoan", text: "Afio mai" },
  { lang: "Tongan", text: "Talitali fiefia" },
  { lang: "Fijian", text: "Bula vinaka" },
  { lang: "Cherokee", text: "ᎣᏏᏲ" },
  { lang: "Navajo", text: "Yá'át'ééh" },
  { lang: "Inuktitut", text: "ᐊᐃᑦᑐᑦ" },
  { lang: "Yiddish", text: "ברוכים הבאים" },
  { lang: "Luxembourgish", text: "Wëllkomm" },
];

interface SlidingWelcomeProps {
  className?: string;
  speed?: number;
}

export default function SlidingWelcome({ className = "", speed = 2000 }: SlidingWelcomeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % welcomeTranslations.length);
        setIsAnimating(false);
      }, 300);
    }, speed);

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`transition-all duration-300 ${
          isAnimating
            ? "transform -translate-y-full opacity-0"
            : "transform translate-y-0 opacity-100"
        }`}
        data-testid="sliding-welcome-text"
      >
        {welcomeTranslations[currentIndex].text}
      </div>
    </div>
  );
}
