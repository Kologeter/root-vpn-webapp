import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';
import './AmneziaPage.css';

export default function AmneziaPage() {
    const navigate = useNavigate();
    const [conf, setConf] = useState('');
    const [filename, setFilename] = useState('root-vpn-awg.conf');
    const [copyMsg, setCopyMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [width, setWidth] = useState(window.innerWidth);

    const site = import.meta.env.VITE_SITE || '';

    // Получаем .conf с бэкенда. Подпись Telegram (initData+hash) — как на страницах VLESS/Outline.
    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            const telegram = window.Telegram?.WebApp;
            const user = telegram?.initDataUnsafe?.user;
            const initData = telegram?.initData;
            const hash = new URLSearchParams(initData).get('hash');

            if (!initData || !hash || !user?.id) {
                console.error('Missing initData/hash/user.');
                return;
            }

            try {
                const params = new URLSearchParams({ initData, hash });
                const response = await fetch(`${site}/getamneziawg/${user.id}?${params}`);
                if (cancelled) return;

                if (response.ok) {
                    const data = await response.json();
                    if (!cancelled) {
                        if (data?.amnezia_conf) {
                            setConf(data.amnezia_conf);
                            if (data?.filename) setFilename(data.filename);
                        } else if (data?.error === 'Subscription required') {
                            setErrorMsg('Подписка не активна. Оформите подписку, чтобы подключить AmneziaWG.');
                        } else {
                            setErrorMsg('Не удалось получить конфигурацию.');
                        }
                    }
                } else {
                    if (!cancelled) setErrorMsg('Не удалось получить конфигурацию. Попробуйте позже.');
                    console.error('Error from server:', response.status, await response.text());
                }
            } catch (e) {
                if (!cancelled) setErrorMsg('Не удалось получить конфигурацию. Попробуйте позже.');
                console.error('Request failed:', e.message);
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, [site]);

    // У Telegram НЕТ метода записи в буфер (только чтение readTextFromClipboard).
    // Поэтому копируем стандартным navigator.clipboard.writeText, с фоллбэком на execCommand.
    const doCopy = async () => {
        if (!conf) return;
        let ok = false;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(conf);
                ok = true;
            }
        } catch (e) {
            ok = false;
        }
        if (!ok) {
            try {
                const ta = document.createElement('textarea');
                ta.value = conf;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                ok = document.execCommand('copy');
                document.body.removeChild(ta);
            } catch (e) {
                ok = false;
            }
        }
        setCopyMsg(ok ? 'Скопировано!' : 'Не удалось — выделите текст вручную');
        setTimeout(() => setCopyMsg(''), 2000);
    };

    // Скачивание .conf. В мобильном Telegram Blob не работает. Порядок надёжности:
    //  1) нативный WebApp.downloadFile (Bot API 8.0+) — качает внутри Telegram;
    //  2) tg.openLink(file-url) — внешний браузер скачает по Content-Disposition (работает и без downloadFile);
    //  3) Blob — для обычного веба/десктопа вне Telegram.
    const handleDownload = () => {
        if (!conf) return;
        const tg = window.Telegram?.WebApp;
        const user = tg?.initDataUnsafe?.user;
        const initData = tg?.initData;
        const hash = new URLSearchParams(initData || '').get('hash');
        const fileUrl = (user?.id && initData && hash)
            ? `${site}/getamneziawg/file/${user.id}?${new URLSearchParams({ initData, hash })}`
            : null;

        if (tg && typeof tg.downloadFile === 'function' && fileUrl) {
            try {
                tg.downloadFile({ url: fileUrl, file_name: filename || 'root-vpn-awg.conf' });
                return;
            } catch (e) { /* падаем в следующий способ */ }
        }
        if (tg && typeof tg.openLink === 'function' && fileUrl) {
            tg.openLink(fileUrl);   // браузер скачает файл по Content-Disposition
            return;
        }

        // Десктоп/веб без Telegram: Blob + <a download>
        const blob = new Blob([conf], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'root-vpn-awg.conf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getAmneziaApp = () => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;
        switch (tg.platform) {
            case 'ios':
                tg.openLink('https://apps.apple.com/us/app/amneziawg/id6478942365');
                return;
            case 'android':
                tg.openLink('https://play.google.com/store/apps/details?id=org.amnezia.awg');
                return;
            case 'macos':
            case 'web':
            case 'tdesktop':
            default:
                tg.openLink('https://amnezia.org/downloads');
                return;
        }
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        const onBack = () => navigate('/protocol');
        const onMain = () => {
            tg.MainButton.setText('Подключиться');
            navigate('/');
        };

        tg.BackButton.show();
        tg.BackButton.onClick(onBack);
        tg.SecondaryButton.hide();
        tg.MainButton.setText('На главную');
        tg.MainButton.show();
        tg.MainButton.onClick(onMain);

        return () => {
            tg.BackButton.offClick(onBack);
            tg.MainButton.offClick(onMain);
        };
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const qrSize = width > 768 ? 260 : 220;

    return (
        <div className="steps-container">
            <p className="step-title">Шаг 1. Отсканируйте QR-код</p>
            <p className="awg-hint">Откройте приложение AmneziaWG → «+» → «Сканировать QR-код».</p>
            <div className="awg-qr">
                {conf ? (
                    <QRCodeCanvas value={conf} size={qrSize} marginSize={3} level="M" />
                ) : (
                    <p>{errorMsg || 'Готовим конфигурацию…'}</p>
                )}
            </div>

            <p className="step-title">Шаг 2. Или импортируйте конфигурацию вручную</p>
            <div className="input-group">
                <textarea
                    className="awg-conf"
                    readOnly
                    value={conf}
                    rows={6}
                    placeholder="AmneziaWG config"
                />
            </div>
            <div className="awg-actions">
                <button className="btn-primary" onClick={doCopy} disabled={!conf}>Копировать конфиг</button>
                <button className="btn-primary" onClick={handleDownload} disabled={!conf}>
                    Скачать .conf
                </button>
            </div>
            {copyMsg && <p className="success-message">{copyMsg}</p>}

            <p className="step-title">Шаг 3. Установите приложение</p>
            <button onClick={getAmneziaApp} className="btn-primary">
                Установить приложение
            </button>
            <p className="awg-hint">
                AmneziaWG — обфусцированный UDP-протокол, устойчивый к блокировкам TLS/HTTP.
                Обычное приложение WireGuard не подойдёт — нужен клиент AmneziaWG/AmneziaVPN.
            </p>
        </div>
    );
}
