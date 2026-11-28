import React from 'react';
import { Download, Share2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './InstallAppBanner.css';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
export default function InstallAppBanner() {
  const { pathname } = useLocation();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const [installed, setInstalled] = React.useState(isStandalone);
  const [dismissed, setDismissed] = React.useState(() => sessionStorage.getItem('dk-app-install-dismissed') === 'yes');
  const [promptEvent, setPromptEvent] = React.useState(null);
  const [instructions, setInstructions] = React.useState(false);
  React.useEffect(() => {
    const onPrompt = event => { event.preventDefault(); setPromptEvent(() => event); };
    const onInstalled = () => { setInstalled(true); setPromptEvent(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  if (pathname !== '/' || installed || dismissed || (!isIOS && !isAndroid)) return null;
  const dismiss = () => { sessionStorage.setItem('dk-app-install-dismissed', 'yes'); setDismissed(true); };
  const install = async () => {
    if (!promptEvent) { setInstructions(v => !v); return; }
    const event=promptEvent;setPromptEvent(null);
    try {
      await event.prompt();
      const choice=await event.userChoice;
      if (choice?.outcome === 'accepted') setInstalled(true);
    } catch { setInstructions(true); }
  };
  return (
    <aside className="dk-install-banner" aria-label="동경바닥재 앱 설치 안내">
      <button className="dk-install-close" type="button" aria-label="설치 안내 닫기" onClick={dismiss}><X size={18} /></button>
      <div className="dk-install-body">
        <img src="/dk-app-icon-192.png" alt="" width="46" height="46" />
        <div className="dk-install-copy">
          <strong>동경바닥재 앱으로 주문하세요</strong>
          <span>상품·장바구니·주문·결제, 사이트와 동일하게</span>
        </div>
      </div>
      <button className="dk-install-action" type="button" onClick={install}>
        {isIOS ? <Share2 size={16} /> : <Download size={16} />}
        {isIOS ? '설치 방법' : '앱 설치'}
      </button>
      {instructions && <p className="dk-install-help">
        {isIOS ? 'Safari 공유 버튼에서 ‘홈 화면에 추가’를 선택하세요.' : 'Chrome 메뉴(⋮)에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택하세요.'}
      </p>}
    </aside>
  );
}
