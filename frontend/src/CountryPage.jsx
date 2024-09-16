// import React from 'react';
import './CountryPage.css';
// import PaymentAlert from "./PaymentAlert.jsx";
import axios from "axios";
import {useState} from "react";
import finlandFlag from './assets/images/finland.jpg';
import bulgariaFlag from './assets/images/Flag_of_Bulgaria.svg';

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

    const [isSuccess, setIsSuccess] = useState(null);
    const [hasError, setHasError] = useState(false);  // Для отслеживания ошибок
    const [selectedCountry, setSelectedCountry] = useState(''); // Сохраняем выбранную страну

    const sendCountry = (country) => {
        const telegram = window.Telegram.WebApp;
        const user = telegram.initDataUnsafe?.user;

        if (!user || !user.id) {
            console.error('User or user ID is not available.');
            return;
        }

        axios.post(`${site}/changecountry`, { 'user_id': user.id, 'country': country })
            .then((response) => {
                console.log('response ', response)
                setIsSuccess(null);
                setHasError(false);
                if (response.status === 200) {
                    setIsSuccess(true);
                    setHasError(false);
                    setSelectedCountry(country);
                } else {
                    setIsSuccess(false);
                    setHasError(true);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setIsSuccess(false);
                setHasError(true);
            });

        // return (
        //     <div>
        //         {isSuccess ? (
        //             <div className="success-container">
        //                 <h1 className="change-country-succes">Ваша страна успешно изменена на {country}</h1>
        //             </div>
        //         ) : (
        //             <div className="error-container">
        //                 <h1 className="change-country-error">Ошибка при смене страны</h1>
        //             </div>
        //         )}
        //     </div>
        // );
    }

    return (
        <div className="change-country-container">
            <main className="Country-change-button">
                <button onClick={() => sendCountry('fast')}>
                    <img src={finlandFlag} alt="Финляндия" className="flag-icon"/>
                    Финляндия
                </button>
                <button onClick={() => sendCountry('no_ads')}>
                    <img src={bulgariaFlag} alt="Болгария" className="flag-icon"/>
                    Болгария
                </button>
                <button onClick={() => sendCountry('no_ads_185')}>
                    <img src={finlandFlag} alt="Финляндия" className="flag-icon"/>
                    Финляндия (резерв)
                </button>
            </main>
            {/* Рендеринг сообщения в зависимости от успешности запроса */}
            {isSuccess && (
                <div className="alert alert-success">
                    <span>Ваша страна успешно изменена на {selectedCountry}</span>
                </div>
            )}

            {/* Всплывающее окно об ошибке */}
            {hasError && (
                <div className="alert alert-error">
                    <span>Ошибка при смене страны</span>
                </div>
            )}
        </div>
    );
}

export default CountryPage;
