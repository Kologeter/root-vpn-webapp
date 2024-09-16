// import React from 'react';
import './CountryPage.css';
// import PaymentAlert from "./PaymentAlert.jsx";
import axios from "axios";
import {useEffect, useState} from "react";
import finlandFlag from './assets/images/finland.jpg';
import bulgariaFlag from './assets/images/Flag_of_Bulgaria.svg';

function CountryPage() {
    const site = 'https://test.root-vpn.ru';
    const [isSuccess, setIsSuccess] = useState(null);
    // const [hasError, setHasError] = useState(false);
    const [showAlert, setShowAlert] = useState(false);  // Для управления показом алерта
    const [selectedCountry, setSelectedCountry] = useState('');

    const sendCountry = (country) => {
        const telegram = window.Telegram.WebApp;
        const user = telegram.initDataUnsafe?.user;

        if (!user || !user.id) {
            console.error('User or user ID is not available.');
            return;
        }

        axios.post(`${site}/changecountry`, { 'user_id': user.id, 'country': country })
            .then((response) => {
                if (response.status === 200) {
                    setIsSuccess(true);
                    setShowAlert(true);  // Показать алерт
                    setSelectedCountry(country);
                } else {
                    setIsSuccess(false);
                    setShowAlert(true);  // Показать алерт
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setIsSuccess(false);
                setShowAlert(true);  // Показать алерт
            });
    };

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 4000); // Длительность анимации 4 секунды
            return () => clearTimeout(timer);  // Очистка таймера при размонтировании компонента
        }
    }, [showAlert]);

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
            {isSuccess === true && (
                <div className="alert alert-success">
                    <span>Ваша страна успешно изменена на {selectedCountry}</span>
                </div>
            )}

            {isSuccess === false && (
                <div className="alert alert-error">
                    <span>Ошибка при смене страны</span>
                </div>
            )}
        </div>
    );
}

export default CountryPage;
