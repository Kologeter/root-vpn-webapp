import { useEffect } from 'react'
import axios from 'axios';
import './App.css';

function App() {

    useEffect(() => {
        // Инициализация Telegram WebApp
        const telegram = window.Telegram.WebApp;
        telegram.ready();
    }, []);

    const getLinkRedirect = (url) => {
        const telegram = window.Telegram.WebApp;

        const user = telegram.initDataUnsafe?.user;

        // Подготовка hex_id
        const hex_id = user && user.id ? "0x" + user.id.toString(16) : null;

        if (!hex_id) {
            console.error('Hex ID is not available.');
            return;
        }

        const url_get = `${url}${hex_id}`;

        console.log('Ссылка получена: ', url_get)

        axios.get(url_get)
            .then((response) => {
                const redirectUrl = response.data?.redirectUrl;
                if (redirectUrl) {
                    // Выполняем редирект на полученную ссылку
                    window.location.href = redirectUrl;
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