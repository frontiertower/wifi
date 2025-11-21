import { useState, useEffect } from "react";

const welcomeTranslations = [
  { lang: "English", text: "Welcome to Frontier Tower" },
  { lang: "Spanish", text: "Bienvenido a Frontier Tower" },
  { lang: "French", text: "Bienvenue à Frontier Tower" },
  { lang: "German", text: "Willkommen im Frontier Tower" },
  { lang: "Italian", text: "Benvenuto a Frontier Tower" },
  { lang: "Portuguese", text: "Bem-vindo ao Frontier Tower" },
  { lang: "Dutch", text: "Welkom bij Frontier Tower" },
  { lang: "Russian", text: "Добро пожаловать в Frontier Tower" },
  { lang: "Japanese", text: "Frontier Towerへようこそ" },
  { lang: "Chinese", text: "欢迎来到Frontier Tower" },
  { lang: "Korean", text: "Frontier Tower에 오신 것을 환영합니다" },
  { lang: "Arabic", text: "أهلا وسهلا بك في Frontier Tower" },
  { lang: "Hindi", text: "Frontier Tower में आपका स्वागत है" },
  { lang: "Bengali", text: "Frontier Tower-এ স্বাগতম" },
  { lang: "Turkish", text: "Frontier Tower'a Hoş Geldiniz" },
  { lang: "Vietnamese", text: "Chào mừng đến với Frontier Tower" },
  { lang: "Polish", text: "Witamy w Frontier Tower" },
  { lang: "Ukrainian", text: "Ласкаво просимо до Frontier Tower" },
  { lang: "Romanian", text: "Bun venit la Frontier Tower" },
  { lang: "Greek", text: "Καλώς ήρθατε στο Frontier Tower" },
  { lang: "Czech", text: "Vítejte ve Frontier Tower" },
  { lang: "Swedish", text: "Välkommen till Frontier Tower" },
  { lang: "Hungarian", text: "Üdvözöljük a Frontier Tower-ban" },
  { lang: "Finnish", text: "Tervetuloa Frontier Toweriin" },
  { lang: "Norwegian", text: "Velkommen til Frontier Tower" },
  { lang: "Danish", text: "Velkommen til Frontier Tower" },
  { lang: "Thai", text: "ยินดีต้อนรับสู่ Frontier Tower" },
  { lang: "Hebrew", text: "ברוך הבא ל-Frontier Tower" },
  { lang: "Indonesian", text: "Selamat datang di Frontier Tower" },
  { lang: "Malay", text: "Selamat datang ke Frontier Tower" },
  { lang: "Filipino", text: "Maligayang pagdating sa Frontier Tower" },
  { lang: "Swahili", text: "Karibu Frontier Tower" },
  { lang: "Persian", text: "خوش آمدید به Frontier Tower" },
  { lang: "Urdu", text: "Frontier Tower میں خوش آمدید" },
  { lang: "Tamil", text: "Frontier Tower-க்கு வரவேற்கிறோம்" },
  { lang: "Telugu", text: "Frontier Tower కు స్వాగతం" },
  { lang: "Marathi", text: "Frontier Tower मध्ये आपले स्वागत आहे" },
  { lang: "Gujarati", text: "Frontier Tower માં સ્વાગત છે" },
  { lang: "Kannada", text: "Frontier Tower ಗೆ ಸ್ವಾಗತ" },
  { lang: "Malayalam", text: "Frontier Tower-ലേക്ക് സ്വാഗതം" },
  { lang: "Punjabi", text: "Frontier Tower ਵਿੱਚ ਸਵਾਗਤ ਹੈ" },
  { lang: "Sinhala", text: "Frontier Tower වෙත ආයුබෝවන්" },
  { lang: "Khmer", text: "សូមស្វាគមន៍មកកាន់ Frontier Tower" },
  { lang: "Lao", text: "ຍິນດີຕ້ອນຮັບສູ່ Frontier Tower" },
  { lang: "Burmese", text: "Frontier Tower သို့ကြိုဆိုပါတယ်" },
  { lang: "Mongolian", text: "Frontier Tower-д тавтай морилно уу" },
  { lang: "Nepali", text: "Frontier Tower मा स्वागत छ" },
  { lang: "Albanian", text: "Mirë se vini në Frontier Tower" },
  { lang: "Serbian", text: "Добродошли у Frontier Tower" },
  { lang: "Croatian", text: "Dobrodošli u Frontier Tower" },
  { lang: "Bosnian", text: "Dobrodošli u Frontier Tower" },
  { lang: "Slovenian", text: "Dobrodošli v Frontier Tower" },
  { lang: "Slovak", text: "Vitajte vo Frontier Tower" },
  { lang: "Bulgarian", text: "Добре дошли в Frontier Tower" },
  { lang: "Macedonian", text: "Добредојдовте во Frontier Tower" },
  { lang: "Estonian", text: "Tere tulemast Frontier Towerisse" },
  { lang: "Latvian", text: "Laipni lūdzam Frontier Tower" },
  { lang: "Lithuanian", text: "Sveiki atvykę į Frontier Tower" },
  { lang: "Icelandic", text: "Velkomin í Frontier Tower" },
  { lang: "Irish", text: "Fáilte go Frontier Tower" },
  { lang: "Welsh", text: "Croeso i Frontier Tower" },
  { lang: "Scottish", text: "Fàilte gu Frontier Tower" },
  { lang: "Basque", text: "Ongi etorri Frontier Tower-era" },
  { lang: "Catalan", text: "Benvingut a Frontier Tower" },
  { lang: "Galician", text: "Benvido a Frontier Tower" },
  { lang: "Maltese", text: "Merħba għal Frontier Tower" },
  { lang: "Georgian", text: "კეთილი იყოს თქვენი მობრძანება Frontier Tower-ში" },
  { lang: "Armenian", text: "Բարի գալուստ Frontier Tower" },
  { lang: "Kazakh", text: "Frontier Tower-ге қош келдіңіз" },
  { lang: "Uzbek", text: "Frontier Tower-ga xush kelibsiz" },
  { lang: "Azerbaijani", text: "Frontier Tower-ə xoş gəlmisiniz" },
  { lang: "Tajik", text: "Хуш омадед ба Frontier Tower" },
  { lang: "Turkmen", text: "Frontier Tower-a hoş geldiňiz" },
  { lang: "Kyrgyz", text: "Frontier Tower-ге кош келиңиз" },
  { lang: "Amharic", text: "ወደ Frontier Tower እንኳን ደህና መጡ" },
  { lang: "Somali", text: "Soo dhawow Frontier Tower" },
  { lang: "Hausa", text: "Barka da zuwa Frontier Tower" },
  { lang: "Yoruba", text: "Ẹ káàbọ̀ sí Frontier Tower" },
  { lang: "Igbo", text: "Nnọọ na Frontier Tower" },
  { lang: "Zulu", text: "Siyakwamukela e-Frontier Tower" },
  { lang: "Xhosa", text: "Wamkelekile e-Frontier Tower" },
  { lang: "Afrikaans", text: "Welkom by Frontier Tower" },
  { lang: "Malagasy", text: "Tonga soa eto amin'ny Frontier Tower" },
  { lang: "Sesotho", text: "Rea u amohela ho Frontier Tower" },
  { lang: "Shona", text: "Mauya ku Frontier Tower" },
  { lang: "Kinyarwanda", text: "Murakaza neza muri Frontier Tower" },
  { lang: "Esperanto", text: "Bonvenon al Frontier Tower" },
  { lang: "Latin", text: "Salve ad Frontier Tower" },
  { lang: "Hawaiian", text: "Aloha i ka Frontier Tower" },
  { lang: "Maori", text: "Haere mai ki te Frontier Tower" },
  { lang: "Samoan", text: "Afio mai i le Frontier Tower" },
  { lang: "Tongan", text: "Talitali fiefia ki he Frontier Tower" },
  { lang: "Fijian", text: "Bula vinaka mai Frontier Tower" },
  { lang: "Cherokee", text: "ᎣᏏᏲ ᎠᏂᎦᎸᏥ Frontier Tower" },
  { lang: "Navajo", text: "Yá'át'ééh, Frontier Tower-góó" },
  { lang: "Inuktitut", text: "Frontier Tower-ᒧᑦ ᐊᐃᑦᑐᑦ" },
  { lang: "Yiddish", text: "ברוכים הבאים צו Frontier Tower" },
  { lang: "Luxembourgish", text: "Wëllkomm bei Frontier Tower" },
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
