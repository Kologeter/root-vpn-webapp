import { useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {

    useEffect(() => {
        // Инициализация Telegram WebApp
        const tg = window.Telegram.WebApp;

        tg.MainButton.setText("Подключиться");
        tg.MainButton.show();

        tg.MainButton.onClick(() => {
            // Добавьте логику подключения VPN здесь
            console.log("Подключение к VPN");
            getLinkRedirect('https://test.root-vpn.ru/connect/run');
        });

        tg.ready();
    }, []);

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

    const sendUserData = () => {
        const telegram = window.Telegram.WebApp;
        const user = telegram.initDataUnsafe?.user;

        if (user) {
            telegram.sendData(JSON.stringify(user)); // Отправка данных в чат
        } else {
            telegram.sendData("User data is not available.");
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Telegram WebApp</h1>
                <button onClick={sendUserData}>
                    Send User Data
                </button>
                <button onClick={() => getLinkRedirect('https://test.root-vpn.ru/connect/run')}>
                    Redirect Link
                </button>
            </header>
        </div>
    );
}

export default App;
