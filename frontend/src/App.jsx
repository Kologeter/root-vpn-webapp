import { useEffect, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import duckAnimation from './assets/AnimatedSticker.json';
// import { Route, Routes } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import { useNavigate } from 'react-router-dom';
// import PaymentAlert from "./PaymentAlert.jsx";

// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
    const [userName, setUserName] = useState(''); // Хранение имени пользователя
    const [subscriptionInfo, setSubscriptionInfo] = useState(''); // Информация о подписке
    const [hasSubscription, setHasSubscription] = useState(false); // Отслеживание наличия подписки
    // const [showAlert, setShowAlert] = useState(false); // Состояние уведомления
    // const [alertMessage, setAlertMessage] = useState(''); // Сообщение для уведомления
    const site = import.meta.env.VITE_SITE || ''; // URL сайта из переменных окружения
    // const websocket = import.meta.env.VITE_WEBSOCKET || '';
    const navigate = useNavigate();

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        console.log("Telegram WebApp API Version:", window.Telegram?.WebApp?.version);
        if (!tg) {
            console.error("Telegram WebApp не найден");
            return;
        }

        const user = tg.initDataUnsafe?.user;
        if (user) {
            setUserName(user.first_name);
        }

        // const socket = new WebSocket(`${websocket}/ws`);
        // socket.onmessage = function (event) {
        //     const message = event.data;
        //     console.log("Message from server:", message);
        //
        //     if (message === "Payment received!") {
        //         setAlertMessage("Платеж успешно выполнен!");
        //         setShowAlert(true);
        //         setHasSubscription(true);
        //     }
        // };
        //
        // socket.onclose = function () {
        //     console.log("WebSocket connection closed");
        // };
        //
        // socket.onerror = function (error) {
        //     console.error("Ошибка WebSocket:", error);
        // };

        axios.post(`${site}/check/subscription`, {
            user_id: user?.id?.toString(),
            username: user?.username.toString() ?? null,
            first_name: user?.first_name
        })
            .then((response) => {
                const { status, subscription } = response.data;
                if (status === 'success') {
                    setSubscriptionInfo(`Ваша подписка активна до ${subscription}`);
                    setHasSubscription(true);
                } else {
                    handleSubscriptionError(response.data.error);
                }
            })
            .catch((error) => {
                console.error("Ошибка при получении информации о подписке:", error);
                setSubscriptionInfo("У вас нет активных подписок");
                setHasSubscription(false);
            });

        tg.BackButton?.hide();

        tg.SecondaryButton?.hide();

        tg.MainButton.setText("Подключиться");
        tg.MainButton.show();
        tg.MainButton.onClick(() => {
            console.log("Подключение к VPN");
            navigate("/protocol");
        });

        tg.ready();

        // return () => {
        //     socket.close();
        // };
    }, [navigate]);


    const handleSubscriptionError = (error) => {
        if (error === 'User is inactive') {
            setSubscriptionInfo('Скорее подключайтесь!');
        } else if (error === 'Subscription not started yet') {
            setSubscriptionInfo('Подписка еще не началась');
        } else {
            setSubscriptionInfo('У вас нет активных подписок');
        }
        setHasSubscription(false);
    };

    // const download_app = () => {
    //     const tg = window.Telegram.WebApp;
    //     const platformLinks = {
    //         ios: 'https://apps.apple.com/us/app/outline-app/id1356177741',
    //         android: 'https://play.google.com/store/apps/details?id=org.outline.android.client',
    //         web: 'https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe',
    //         macos: 'https://itunes.apple.com/us/app/outline-app/id1356178125',
    //         tdesktop: 'https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe',
    //         default: 'https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe'
    //     };
    //     const link = platformLinks[tg.platform] || platformLinks.default;
    //     tg.openLink(link);
    // };

    const goChooseProtcol = () => {
        navigate('/protocol');
    };

    const goToDownloadApp = () => {
        navigate('/downloadapp');
    };

    const getTechSupport = () => {
        const tg = window.Telegram.WebApp;
        tg.openTelegramLink('https://t.me/Kologeter');
    };

    const stopSubscription = () => {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;

        if (!user?.id) {
            console.error('User or user ID is not available.');
            return;
        }

        axios.post(`${site}/stop/subscription`, {
            user_id: user.id.toString(),
            username: user.username,
            first_name: user.first_name
        })
            .then((response) => {
                if (response.data?.status === 'success') {
                    tg.showAlert('Подписка успешно остановлена');
                    setSubscriptionInfo('Ваша подписка успешно остановлена.');
                    setHasSubscription(false);
                } else {
                    tg.showAlert('Не удалось остановить подписку');
                }
            })
            .catch((error) => {
                console.error('Ошибка при попытке остановить подписку:', error);
            });
    };

    const buySubscription = () => {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;

        axios.post(`${site}/createpayment`, { user_id: user?.id?.toString() })
            .then((response) => {
                if (response.data?.status === 'success') {
                    tg.openLink(response.data?.payment_link);
                } else {
                    tg.showAlert('Не удалось создать платеж.');
                }
            })
            .catch((error) => {
                console.error('Ошибка при создании платежа:', error);
            });
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Привет, {userName}!</h1>
                <Player autoplay loop src={duckAnimation} style={{ height: '150px', width: '150px', marginTop: '10px' }} />
                <p>{subscriptionInfo}</p>
            </header>
            <button onClick={() => goChooseProtcol()}>Подключиться</button>
            {!hasSubscription && <button onClick={buySubscription}>Купить подписку</button>}
            {/*<button onClick={goToCountryPage}>Сменить страну</button>*/}
            <button onClick={goToDownloadApp}>Скачать приложение</button>
            <button onClick={getTechSupport}>Техподдержка</button>
            {hasSubscription && <button onClick={stopSubscription}>Остановить подписку</button>}
            {/*<PaymentAlert message={alertMessage} show={showAlert} onClose={() => setShowAlert(false)} />*/}
        </div>
    );
}

export default App;
