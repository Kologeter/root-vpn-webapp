import { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import './App.css';
import androidInstr from './assets/images/androidInstr.jpg';
import iphoneGif from './assets/images/iphone.gif';
import hiddfyMp4 from './assets/images/hiddfy.mp4';
import axios from "axios";
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
        const fetchData = async () => {
            const telegram = window.Telegram?.WebApp;
            const user = telegram?.initDataUnsafe?.user; // Данные пользователя
            const initData = telegram?.initData;
            const hash = new URLSearchParams(initData).get('hash');

            if (!initData || !hash) {
                console.error('Missing initData or hash.');
                return;
            }

            console.log('initData:', initData);
            console.log('hash:', hash);

            try {
                const response = await axios.get(`${site}/getvless/${user.id}`, {
                    params: {
                        initData,
                        hash,
                    // user_id: user.id,
                    // initData: initData,
                    // hash: hash,

                    },
                });
                console.log('response ', response);
                console.log('response.status ', response.status);

                if (response.status === 200) {
                    const vlessLink = response.data?.vless_link;
                    console.log('VLESS Link:', vlessLink);
                    setLinkVless(vlessLink);
                } else {
                    console.error('Error from server:', response.status, response.data);
                }
            } catch (error) {
                console.error('Request failed:', error.response?.status, error.response?.data || error.message);
            }
        };

        fetchData();
    }, [site]);


    const getVlessApp = () => {
        const tg = window.Telegram.WebApp;

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
        const tg = window.Telegram.WebApp;
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
        const tg = window.Telegram.WebApp;
        // const user = tg.initDataUnsafe?.user;

        tg.BackButton.onClick(() => {
            navigate('/protocol');
        });

        tg.SecondaryButton.hide();
        tg.MainButton.setText('На главную');
        tg.MainButton.onClick(() => {
            tg.MainButton.setText('Подключиться');
            navigate('/');
        });


        // setKey(user?.id || '');
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

