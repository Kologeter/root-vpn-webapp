import { useEffect, useState } from 'react';
import './App.css';
import androidInstr from './assets/images/androidInstr.jpg';
import iphoneGif from './assets/images/iphone.gif';
import hiddfyMp4 from './assets/images/hiddfy.mp4';

export default function VlessSettings() {
    const [copiedIndex, setCopiedIndex] = useState(null); // Включено состояние
    const [Video, setVideo] = useState(false);
    const [Platform, setPlatform] = useState('');
    const [key, setKey] = useState('');

    // Обеспечить, чтобы значение site корректно передавалось:
    const site = process.env.REACT_APP_SITE || ''; // В случае использования Vite

    const handleCopy = (link, index) => {
        navigator.clipboard.writeText(link);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

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
        const user = tg.initDataUnsafe?.user;
        setKey(user?.id || '');
    }, []);

    return (
        <div className="space-y-2">
            <p className="font-semibold">Шаг 1. Скопируйте ваш ключ</p>
            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder={`${site}/vless/${key}`}
                    readOnly
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="flex-grow"
                />
                <button onClick={() => handleCopy(`${site}/vless/${key}`, 0)} className="shrink-0">
                    Копировать
                </button>
            </div>
            {copiedIndex !== null && <p className="text-green-500">Скопировано!</p>}
            <p className="font-semibold">Шаг 2. Установите приложение</p>
            <button onClick={getVlessApp} className="btn-primary">
                Установить приложение
            </button>
            <p className="font-semibold">Шаг 3. Подключитесь</p>
            {Platform &&
                (<img src={Platform} alt="инструкция" className="w-full object-contain"/>)}
            {Video && (
                <video src={Platform} controls className="absolute top-0 left-0 w-full h-full object-contain">
                    Ваш браузер не поддерживает видео.
                </video>
            )}
        </div>
    );
}

