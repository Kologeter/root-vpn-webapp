import './CountryPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import finlandFlag from './assets/images/finland.jpg';
import bulgariaFlag from './assets/images/Flag_of_Bulgaria.svg';
// import PropTypes from 'prop-types';

function CountryPage() {
    const navigate = useNavigate();
    const site = import.meta.env.VITE_SITE || '';
    const [isSuccess, setIsSuccess] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');

    const sendCountry = async (country) => {
        try {
            const telegram = window.Telegram?.WebApp;
            const user = telegram?.initDataUnsafe?.user;

            if (!user || !user.id) {
                console.error('User or user ID is not available.');
                return;
            }

            const response = await axios.post(`${site}/changecountry`, { user_id: user.id, country });
            if (response.status === 200) {
                setIsSuccess(true);
                setShowAlert(true);
                setSelectedCountry(country);
            } else {
                setIsSuccess(false);
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Error sending country change request:', error);
            setIsSuccess(false);
            setShowAlert(true);
        }
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
            console.error('Telegram WebApp is not available.');
            return;
        }

        tg.BackButton.show();
        tg.BackButton.onClick(() => {
            navigate('/');
        });

        return () => {
            tg.BackButton.hide();
            tg.BackButton.offClick(); // Удаление обработчика
        };
    }, [navigate]);

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const countries = [
        { name: 'Финляндия', infoServer: 'Быстрый, с высокой пропускной способностью сервер, расположенный ' +
                'в Хельсинках. Отсутствует реклама на сайтах и приложениях. Рекомендуем', flag: finlandFlag, code: 'fast' },
        { name: 'Болгария', infoServer: 'Сервер, кому важна конфидициальность. Отсутствует реклама на сайтах и приложениях.' +
                ' Невысокая пропускная способность', flag: bulgariaFlag, code: 'no_ads' },
        // { name: 'Финляндия (резерв)', flag: finlandFlag, code: 'no_ads_185' },
    ];

    const CountryCard = ({ country, flag, infoServer, onSelect }) => (
        <div className="country-card">
            <button onClick={onSelect}>
                <div className="country-info">
                    <p>{infoServer}</p>
                </div>
                    <img src={flag} alt={country} className="flag-icon"/>
                    {country}
            </button>
        </div>
);

return (
        <div className="change-country-container">
            <div className="country-cards">
                {countries.map((country) => (
                    <CountryCard
                        key={country.code}
                        country={country.name}
                        infoServer={country.infoServer}
                        flag={country.flag}
                        onSelect={() => sendCountry(country.code)}
                    />
                ))}
            </div>

            {showAlert && (
                <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}>
                    <span>
                        {isSuccess
                            ? `Ваша страна успешно изменена на ${selectedCountry}`
                            : 'Ошибка при смене страны'}
                    </span>
                </div>
            )}
        </div>
    );
}

export default CountryPage;

