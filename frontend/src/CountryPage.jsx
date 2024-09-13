// import React from 'react';
import './CountryPage.css';
// import PaymentAlert from "./PaymentAlert.jsx";
import {useEffect} from "react";
import axios from "axios";

function CountryPage() {

    // const [countries, setCountries] = useState([]);

    // Функция для получения данных из POST-запроса
    // const fetchData = async () => {
    //     try {
    //         const response = await fetch('your-api-endpoint', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ /* любые данные, если нужно */ }),
    //         });
    //         const result = await response.json();
    //         // Предполагаем, что результат будет объектом: { 'Finland', 'Bulgaria', 'Finland 2' }
    //         setCountries(result); // Сохраняем страны в состояние
    //     } catch (error) {
    //         console.error('Ошибка при получении данных:', error);
    //     }
    // };

    const site = 'https://test.root-vpn.ru'

    useEffect(() => {

        // const tg = window.Telegram.WebApp;

        // const user = tg.initDataUnsafe?.user;

    });

    const sendCountry = (country) => {
        const telegram = window.Telegram.WebApp;
        const user = telegram.initDataUnsafe?.user;

        if (!user || !user.id) {
            console.error('User or user ID is not available.');
            return;
        }

        axios.get(`${site}/changecountry`, {'user_id': user.id, 'country': country})
            .then((response) => {
                if (response.status === 200) {
                    return <div className="success-container">
                        <h1 className="change-country-succes">Ваша страна успешно изменена на ${country}</h1>
                    </div>
                } else {
                    return <div className="error-container">
                        <h1 className="change-country-error">Ошибка при смене страны</h1>
                    </div>
                }
                // const redirectUrl = response.status;
                // console.log('redirectUrl', redirectUrl);
                // if (redirectUrl) {
                //     // Выполняем редирект на полученную ссылку
                //     telegram.openLink(redirectUrl);
                // } else {
                //     console.error('Redirect URL is not available.');
                // }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    return (
        <div className="change-country-container">
            <main className="Country-change-button">
                <button onClick={() => sendCountry('fast')}>
                    🇫🇮 Финляндия
                </button>
                <button onClick={() => sendCountry('no_ads')}>
                    🇧🇬 Болгария
                </button>
                <button onClick={() => sendCountry('no_ads_185')}>
                    🇫🇮 Финляндия (резерв)
                </button>
            </main>
        </div>
    );
}

export default CountryPage;
