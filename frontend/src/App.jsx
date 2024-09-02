import {useEffect, useState} from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import duckAnimation from './assets/AnimatedSticker.json';
import axios from 'axios';
import './App.css';

function App() {

    const [userName, setUserName] = useState(''); // Состояние для хранения имени пользователя
    const [subscriptionInfo, setSubscriptionInfo] = useState(''); // Состояние для хранения информации о подписке
    const [hasSubscription, setHasSubscription] = useState(false); // Состояние для отслеживания наличия подписки
    const site = 'https://test.root-vpn.ru'

    useEffect(() => {
        // Инициализация Telegram WebApp
        const tg = window.Telegram.WebApp;

        const user = tg.initDataUnsafe?.user;

        // Установка имени пользователя
        if (user) {
            setUserName(user.first_name);
        }

        axios.post(`${site}/check/subscription`, {'user_id': user.id.toString()})
            .then((response) => {
                const { status, subscription } = response.data;
                if (status === 'success') {
                    setSubscriptionInfo(`Ваша подписка активна до ${subscription}`);
                    setHasSubscription(true); // Устанавливаем, что подписка есть
                } else if (response.data.error === 'error') {
                    setSubscriptionInfo('Скорее подключайтесь!');
                    setHasSubscription(false); // Устанавливаем, что подписки нет
                }
                else {
                    setSubscriptionInfo('У вас нет активных подписок');
                    setHasSubscription(false); // Устанавливаем, что подписки нет
                }
            })
            .catch((error) => {
                console.error('Ошибка при получении информации о подписке:', error);
                setSubscriptionInfo('У вас нет активных подписок');
                setHasSubscription(false); // Устанавливаем, что подписка есть
            });

        tg.MainButton.setText("Подключиться");
        tg.MainButton.show();

        tg.MainButton.onClick(() => {
            // Добавьте логику подключения VPN здесь
            console.log("Подключение к VPN");
            getLinkRedirect(`${site}/connect/run`);
        });

        tg.ready();
    }, []);

    const download_app = () => {
        const tg = window.Telegram.WebApp;

        // tg.showAlert('Ваша платформа ' + tg.platform);

        switch (tg.platform) {
            case 'ios':
                // console.log('Плафторма: ios');
                tg.openLink('https://apps.apple.com/us/app/outline-app/id1356177741');
                return;
            case 'android':
                // console.log('Платформа: android');
                tg.openLink('https://play.google.com/store/apps/details?id=org.outline.android.client');
                return;
            case 'web':
                // console.log('Платформа: web');
                tg.openLink('https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe');
                return;
            case 'macos':
                // console.log("Платформа: macos");
                tg.openLink('https://itunes.apple.com/us/app/outline-app/id1356178125');
                return;
            case 'tdesktop':
                tg.openLink('https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe');
                return;
            default:
                // console.log('Дефолт устройство');
                tg.openLink('https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe');
                return;
        }

        // if (tg.platform === 'ios') {
        //
        // }
    }

    const getLinkRedirect = (url) => {
        const telegram = window.Telegram.WebApp;
        const user = telegram.initDataUnsafe?.user;

        if (!user || !user.id) {
            console.error('User or user ID is not available.');
            return;
        }

        // Подготовка hex_id
        const hex_id = "0x" + user.id.toString(16);

        const url_get = `${url}${hex_id}`;

        console.log('Платформа: ', telegram.platform);

        axios.get(url_get)
            .then((response) => {
                const redirectUrl = response.data?.redirectUrl;
                console.log('redirectUrl', redirectUrl);
                if (redirectUrl) {
                    // Выполняем редирект на полученную ссылку
                    telegram.openLink(redirectUrl);
                } else {
                    console.error('Redirect URL is not available.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const getTechSupport = () => {
        const tg = window.Telegram.WebApp;
        const urlRedirect = 'https://t.me/Kologeter';
        tg.openTelegramLink(urlRedirect);
    }

    const stopSubscription = () => {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;

        if (!user || !user.id) {
            console.error('User or user ID is not available.');
            return;
        }

        axios.post(`${site}/stop/subscription`, { 'user_id': user.id.toString() })
            .then((response) => {
                if (response.data?.status === 'success') {
                    tg.showAlert('Подписка успешно остановлена');
                    setSubscriptionInfo('Ваша подписка успешно остановлена.');
                    setHasSubscription(false); // Обновляем состояние подписки
                } else {
                    tg.showAlert('Не удалось остановить подписку');
                    setSubscriptionInfo('Не удалось остановить подписку.');
                }
            })
            .catch((error) => {
                console.error('Ошибка при попытке остановить подписку:', error);
                setSubscriptionInfo('Ошибка при остановке подписки.');
            });
    }

    const buySubscription = () => {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;
        console.log('buySub')
        axios.post(`${site}/createpayment`, { 'user_id': user.id, 'username': user.username.toString()})
            .then((response) => {
                console.log(response)
                if (response.data?.status === 'success') {
                    tg.openLink(response.data?.payment_link);
                } else {
                    tg.showAlert('Не удалось создать платеж.');
                }
            });
    }

    // const sendUserData = () => {
    //     const telegram = window.Telegram.WebApp;
    //     const user = telegram.initDataUnsafe?.user;
    //
    //     if (user) {
    //         telegram.sendData(JSON.stringify(user)); // Отправка данных в чат
    //     } else {
    //         telegram.sendData("User data is not available.");
    //     }
    // };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Привет, {userName}!</h1>
                {/*<img src="assets/AnimatedSticker.tgs" alt="AnimatedSticker" className="sticker"/>*/}
                <Player
                    autoplay
                    loop
                    src={duckAnimation}
                    style={{ height: '150px', width: '150px', marginTop: '10px' }}
                />
                {/*<button onClick={sendUserData}>*/}
                {/*    Send User Data*/}
                {/*</button>*/}
                <p>{subscriptionInfo}</p>
            </header>
            <main className="App">
                <button onClick={() => getLinkRedirect(`${site}/connect/run`)}>
                    Подключиться
                </button>
                {!hasSubscription &&
                    (<button onClick={() => buySubscription()}>
                    Купить подписку
                    </button>)
                }
                <button onClick={() => download_app()}>
                    Скачать приложение
                </button>
                <button onClick={() => getTechSupport()}>
                    Техподдержка
                </button>
                {hasSubscription && (
                    <button onClick={() => stopSubscription()}>
                        Остановить подписку
                    </button>
                )}
            </main>
        </div>
    );
}

export default App;
