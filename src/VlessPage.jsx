import { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import './App.css';
import androidInstr from './assets/images/androidInstr.jpg';
import iphoneGif from './assets/images/iphone.gif';
import hiddfyMp4 from './assets/images/hiddfy.mp4';
import chalk from "chalk";
import { CopyToClipboard } from 'react-copy-to-clipboard';


export default function VlessSettings() {
    const navigate = useNavigate();
    const [copiedIndex, setCopiedIndex] = useState(null); // Включено состояние
    const [Video, setVideo] = useState(false);
    const [Platform, setPlatform] = useState('');
    const [width, setWidth] = useState(window.innerWidth);
    const [LinkVless, setLinkVless] = useState('');

    // Обеспечить, чтобы значение site корректно передавалось:
    const site = import.meta.env.VITE_SITE || '';

    console.log('site', site);
    console.log(chalk.green("site", site));

    const handleCopy = (link, index) => {

        if (!link) {
            console.error(chalk.red("Link is empty or undefined."));
            return;
        }

        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);

    };


    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            const telegram = window.Telegram?.WebApp;
            const user = telegram?.initDataUnsafe?.user; // Данные пользователя
            const initData = telegram?.initData;
            const hash = new URLSearchParams(initData).get('hash');

            if (!initData || !hash || !user?.id) {
                console.error('Missing initData/hash/user.');
                return;
            }

            console.log('initData:', initData);
            console.log('hash:', hash);

            try {
                const params = new URLSearchParams({ initData, hash });
                const response = await fetch(`${site}/getvless/${user.id}?${params}`);
                if (cancelled) return;
                console.log('response.status ', response.status);

                if (response.ok) {
                    const data = await response.json();
                    if (!cancelled) setLinkVless(data?.vless_link);
                } else {
                    console.error('Error from server:', response.status, await response.text());
                }
            } catch (error) {
                console.error('Request failed:', error.message);
            }
        };

        fetchData();
        return () => { cancelled = true; };  // не вызывать setState после ухода со страницы
    }, [site]);


    const getVlessApp = () => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        switch (tg.platform) {
            case 'ios':
                tg.openLink('https://apps.apple.com/ru/app/v2raytun/id6476628951');
                return;
            case 'android':
                tg.openLink('https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=ru&gl=US');
                return;
            case 'web':
                tg.openLink('https://github.com/hiddify/hiddify-next/releases/latest/download/Hiddify-Windows-Setup-x64.exe');
                return;
            case 'macos':
                tg.openLink('https://apps.apple.com/ru/app/v2raytun/id6476628951');
                return;
            case 'tdesktop':
                tg.openLink('https://github.com/hiddify/hiddify-next/releases/latest/download/Hiddify-Windows-Setup-x64.exe');
                return;
            default:
                tg.openLink('https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe');
                return;
        }
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;
        switch (tg.platform) {
            case 'android':
                setPlatform(androidInstr);
                break;
            case 'ios':
                setPlatform(iphoneGif);
                // setPlatform(androidInstr);
                break;
            case 'tdesktop':
            case 'macos':
                setVideo(true);
                setPlatform(hiddfyMp4);
                break;
            default:
                setPlatform('');
        }
    }, []);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        // Сохраняем ссылки на колбэки, чтобы снять их в cleanup (иначе обработчики
        // накапливаются на одной нативной кнопке → двойные/чужие навигации).
        const onBack = () => navigate('/protocol');
        const onMain = () => {
            tg.MainButton.setText('Подключиться');
            navigate('/');
        };

        tg.BackButton.onClick(onBack);
        tg.SecondaryButton.hide();
        tg.MainButton.setText('На главную');
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

    const maxWidth = width > 1024 ? 600 : width > 768 ? 400 : 300;

    return (
        <div className="steps-container">
            <p className="step-title">Шаг 1. Скопируйте вашу ключ-ссылку</p>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="VLESS Link"
                    readOnly
                    value={LinkVless} // Используем состояние как значение
                    onChange={(e) => setLinkVless(e.target.value)} // Это не обязательно для readOnly
                    className="input-field"
                />
                {/*<button onClick={() => handleCopy(LinkVless, 0)} className="btn-primary">*/}
                {/*    Копировать ключ-ссылку*/}
                {/*</button>*/}
                <CopyToClipboard text={LinkVless} onCopy={() => handleCopy(LinkVless, 0)}>
                    <button>Копировать ключ-ссылку</button>
                </CopyToClipboard>
            </div>
            {copiedIndex !== null && <p className="success-message">Скопировано!</p>}
            <p className="step-title">Шаг 2. Установите приложение</p>
            <button onClick={getVlessApp} className="btn-primary">
                Установить приложение
            </button>
            <p className="step-title">Шаг 3. Подключитесь</p>
            <div style={{ maxWidth: `${maxWidth}px`, margin: '0 auto' }}>
                {!Video ? (
                    <img
                        src={Platform}
                        alt="инструкция"
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                    />
                ) : (
                    <video
                        src={Platform}
                        controls
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                    >
                        Ваш браузер не поддерживает видео.
                    </video>
                )}
            </div>
        </div>
    );
}

