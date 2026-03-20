/**
 * Static print labels for all supported print languages.
 * These are bundled (not loaded via HTTP) so they work offline in print views.
 */
export interface PrintLabels {
  networkName: string;
  password: string;
  security: string;
  scanToConnect: string;
  hiddenNetwork: string;
  noPassword: string;
  enterpriseAuth: string;
}

export const printLabels: Record<string, PrintLabels> = {
  en: {
    networkName: 'Network Name',
    password: 'Password',
    security: 'Security',
    scanToConnect: 'Scan the QR code with your smartphone camera to connect automatically.',
    hiddenNetwork: 'This is a hidden network. You may need to enter the network name manually.',
    noPassword: 'No password required',
    enterpriseAuth: 'Enterprise authentication — contact your IT administrator for credentials.',
  },
  de: {
    networkName: 'Netzwerkname',
    password: 'Passwort',
    security: 'Sicherheit',
    scanToConnect: 'Scannen Sie den QR-Code mit Ihrer Smartphone-Kamera, um sich automatisch zu verbinden.',
    hiddenNetwork: 'Dies ist ein verstecktes Netzwerk. Möglicherweise müssen Sie den Netzwerknamen manuell eingeben.',
    noPassword: 'Kein Passwort erforderlich',
    enterpriseAuth: 'Enterprise-Authentifizierung — wenden Sie sich an Ihren IT-Administrator.',
  },
  fr: {
    networkName: 'Nom du réseau',
    password: 'Mot de passe',
    security: 'Sécurité',
    scanToConnect: 'Scannez le code QR avec l\'appareil photo de votre smartphone pour vous connecter automatiquement.',
    hiddenNetwork: 'Ceci est un réseau masqué. Vous devrez peut-être saisir le nom du réseau manuellement.',
    noPassword: 'Aucun mot de passe requis',
    enterpriseAuth: 'Authentification entreprise — contactez votre administrateur IT.',
  },
  es: {
    networkName: 'Nombre de red',
    password: 'Contraseña',
    security: 'Seguridad',
    scanToConnect: 'Escanea el código QR con la cámara de tu smartphone para conectarte automáticamente.',
    hiddenNetwork: 'Esta es una red oculta. Es posible que necesites ingresar el nombre de la red manualmente.',
    noPassword: 'No se requiere contraseña',
    enterpriseAuth: 'Autenticación empresarial — contacte a su administrador de TI.',
  },
  it: {
    networkName: 'Nome della rete',
    password: 'Password',
    security: 'Sicurezza',
    scanToConnect: 'Scansiona il codice QR con la fotocamera del tuo smartphone per connetterti automaticamente.',
    hiddenNetwork: 'Questa è una rete nascosta. Potrebbe essere necessario inserire il nome della rete manualmente.',
    noPassword: 'Nessuna password richiesta',
    enterpriseAuth: 'Autenticazione aziendale — contattare l\'amministratore IT.',
  },
  pt: {
    networkName: 'Nome da rede',
    password: 'Senha',
    security: 'Segurança',
    scanToConnect: 'Escaneie o código QR com a câmera do seu smartphone para se conectar automaticamente.',
    hiddenNetwork: 'Esta é uma rede oculta. Talvez seja necessário inserir o nome da rede manualmente.',
    noPassword: 'Nenhuma senha necessária',
    enterpriseAuth: 'Autenticação empresarial — entre em contato com o administrador de TI.',
  },
  tr: {
    networkName: 'Ağ Adı',
    password: 'Şifre',
    security: 'Güvenlik',
    scanToConnect: 'Otomatik bağlanmak için QR kodu akıllı telefonunuzun kamerası ile tarayın.',
    hiddenNetwork: 'Bu gizli bir ağdır. Ağ adını manuel olarak girmeniz gerekebilir.',
    noPassword: 'Şifre gerekli değil',
    enterpriseAuth: 'Kurumsal kimlik doğrulama — IT yöneticinize başvurun.',
  },
  ar: {
    networkName: 'اسم الشبكة',
    password: 'كلمة المرور',
    security: 'الأمان',
    scanToConnect: 'امسح رمز QR بكاميرا هاتفك الذكي للاتصال تلقائياً.',
    hiddenNetwork: 'هذه شبكة مخفية. قد تحتاج إلى إدخال اسم الشبكة يدوياً.',
    noPassword: 'لا تحتاج كلمة مرور',
    enterpriseAuth: 'مصادقة المؤسسات — اتصل بمسؤول تكنولوجيا المعلومات.',
  },
  zh: {
    networkName: '网络名称',
    password: '密码',
    security: '安全性',
    scanToConnect: '用智能手机摄像头扫描二维码即可自动连接。',
    hiddenNetwork: '这是一个隐藏网络。您可能需要手动输入网络名称。',
    noPassword: '无需密码',
    enterpriseAuth: '企业认证 — 请联系您的IT管理员获取凭据。',
  },
  ja: {
    networkName: 'ネットワーク名',
    password: 'パスワード',
    security: 'セキュリティ',
    scanToConnect: 'スマートフォンのカメラでQRコードをスキャンすると自動的に接続されます。',
    hiddenNetwork: 'これは非公開ネットワークです。ネットワーク名を手動で入力する必要がある場合があります。',
    noPassword: 'パスワード不要',
    enterpriseAuth: 'エンタープライズ認証 — IT管理者にお問い合わせください。',
  },
  ko: {
    networkName: '네트워크 이름',
    password: '비밀번호',
    security: '보안',
    scanToConnect: '스마트폰 카메라로 QR 코드를 스캔하면 자동으로 연결됩니다.',
    hiddenNetwork: '이 네트워크는 숨겨져 있습니다. 네트워크 이름을 수동으로 입력해야 할 수 있습니다.',
    noPassword: '비밀번호 불필요',
    enterpriseAuth: '기업 인증 — IT 관리자에게 문의하세요.',
  },
  pl: {
    networkName: 'Nazwa sieci',
    password: 'Hasło',
    security: 'Zabezpieczenia',
    scanToConnect: 'Zeskanuj kod QR aparatem smartfona, aby połączyć się automatycznie.',
    hiddenNetwork: 'To jest ukryta sieć. Może być konieczne ręczne wprowadzenie nazwy sieci.',
    noPassword: 'Hasło nie jest wymagane',
    enterpriseAuth: 'Uwierzytelnianie korporacyjne — skontaktuj się z administratorem IT.',
  },
  ru: {
    networkName: 'Имя сети',
    password: 'Пароль',
    security: 'Безопасность',
    scanToConnect: 'Отсканируйте QR-код камерой смартфона для автоматического подключения.',
    hiddenNetwork: 'Это скрытая сеть. Возможно, потребуется ввести имя сети вручную.',
    noPassword: 'Пароль не требуется',
    enterpriseAuth: 'Корпоративная аутентификация — обратитесь к IT-администратору.',
  },
  ka: {
    networkName: 'ქსელის სახელი',
    password: 'პაროლი',
    security: 'უსაფრთხოება',
    scanToConnect: 'ავტომატური დაკავშირებისთვის დაასკანერეთ QR კოდი სმარტფონის კამერით.',
    hiddenNetwork: 'ეს არის დამალული ქსელი. შეიძლება საჭირო გახდეს ქსელის სახელის ხელით შეყვანა.',
    noPassword: 'პაროლი არ არის საჭირო',
    enterpriseAuth: 'კორპორატიული ავთენტიფიკაცია — დაუკავშირდით IT ადმინისტრატორს.',
  },
  th: {
    networkName: 'ชื่อเครือข่าย',
    password: 'รหัสผ่าน',
    security: 'ความปลอดภัย',
    scanToConnect: 'สแกน QR โค้ดด้วยกล้องสมาร์ทโฟนเพื่อเชื่อมต่ออัตโนมัติ',
    hiddenNetwork: 'นี่คือเครือข่ายที่ซ่อนอยู่ คุณอาจต้องป้อนชื่อเครือข่ายด้วยตนเอง',
    noPassword: 'ไม่ต้องใช้รหัสผ่าน',
    enterpriseAuth: 'การยืนยันตัวตนระดับองค์กร — ติดต่อผู้ดูแลระบบ IT',
  },
  vi: {
    networkName: 'Tên mạng',
    password: 'Mật khẩu',
    security: 'Bảo mật',
    scanToConnect: 'Quét mã QR bằng camera điện thoại để kết nối tự động.',
    hiddenNetwork: 'Đây là mạng ẩn. Bạn có thể cần nhập tên mạng thủ công.',
    noPassword: 'Không cần mật khẩu',
    enterpriseAuth: 'Xác thực doanh nghiệp — liên hệ quản trị viên CNTT.',
  },
};

export function getPrintLabels(lang: string): PrintLabels {
  return printLabels[lang] || printLabels['en'];
}
