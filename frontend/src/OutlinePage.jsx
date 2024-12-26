import { useEffect, useState } from 'react';
import {useNavigate} from "react-router-dom";
import './App.css';
import axios from "axios";

export default function OutlineSettings() {
    const navigate = useNavigate();
    const [copiedIndex, setCopiedIndex] = useState(null); // Включено состояние
    const [OutlineLink, setOutlineLink] = useState('');

    // Обеспечить, чтобы значение site корректно передавалось:
    const site = import.meta.env.VITE_SITE || '';

    console.log('site', site)

    const handleCopy = (link, index) => {
        navigator.clipboard.writeText(link);
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
                const response = await axios.get(`${site}/outlinelink${user.id}`, {
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
                    const outlineLink = response.data?.outline_link;
                    console.log('outlineLink:', outlineLink);
                    setOutlineLink(outlineLink);
                } else {
                    console.error('Error from server:', response.status, response.data);
                }
            } catch (error) {
                console.error('Request failed:', error.response?.status, error.response?.data || error.message);
            }
        };

        fetchData();
    }, [site]);


    const getOutlineApp = () => {
        const tg = window.Telegram.WebApp;

        switch (tg.platform) {
            case 'ios':
                tg.openLink('https://apps.apple.com/us/app/outline-app/id1356177741');
                return;
            case 'android':
                tg.openLink('https://play.google.com/store/apps/details?id=org.outline.android.client');
                return;
            case 'web':
                tg.openLink('https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe');
                return;
            case 'macos':
                tg.openLink('https://itunes.apple.com/us/app/outline-app/id1356178125');
                return;
            case 'tdesktop':
                tg.openLink('https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe');
                return;
            default:
                tg.openLink('https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe');
                return;
        }
    };


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



    return (
        <div className="steps-container">
            <p className="step-title">Шаг 1. Скопируйте ваш ключ</p>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Outline Link"
                    readOnly
                    value={OutlineLink} // Используем состояние как значение
                    onChange={(e) => setOutlineLink(e.target.value)} // Это не обязательно для readOnly
                    className="input-field"
                />
                <button onClick={() => handleCopy(OutlineLink, 0)} className="btn-primary">
                    Копировать ключ
                </button>
            </div>
            {copiedIndex !== null && <p className="success-message">Скопировано!</p>}
            <p className="step-title">Шаг 2. Установите приложение</p>
            <button onClick={getOutlineApp} className="btn-primary">
                Установить приложение
            </button>
            <p className="step-title">Шаг 3. Подключитесь</p>
            <div>
                <p>Скачайте приложение Outline и вставьте скопированный ключ</p>
            </div>
        </div>
    );
}