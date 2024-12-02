import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";



export default function ProtocolPage() {
    const site = import.meta.env.VITE_SITE || "";
    const navigate = useNavigate();

    console.log("site", site);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;

        if (!tg) {
            console.error("Telegram WebApp API is not available.");
            return;
        }

        // Настраиваем MainButton
        tg.MainButton.setText("VLESS");
        // tg.MainButton.position('left')
        tg.MainButton.show();
        // tg.MainButton.hasShineEffect();

        tg.MainButton.onClick(() => {
            console.log("Подключение к VLESS");
            navigate("/vless");
        });

        tg.SecondaryButton.setText('Outline');
        tg.SecondaryButton.show();
        tg.SecondaryButton.onClick(() => {
            console.log("Подключение к Outline VPN");
            getLinkRedirectOutline(`${site}/connect/run`);
        });


        // Настраиваем BackButton
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
            tg.MainButton.setText("Подключиться");
            navigate("/");
        });

        tg.ready();
    }, [site, navigate]);

    const getLinkRedirectOutline = (url) => {
        const telegram = window.Telegram?.WebApp;
        const user = telegram?.initDataUnsafe?.user;

        if (!user || !user.id) {
            console.error("User or user ID is not available.");
            return;
        }

        // Подготовка hex_id
        const hex_id = "0x" + user.id.toString(16);

        const url_get = `${url}${hex_id}`;

        console.log("Платформа: ", telegram.platform);

        axios
            .get(url_get)
            .then((response) => {
                const redirectUrl = response.data?.redirectUrl;
                console.log("redirectUrl", redirectUrl);
                if (redirectUrl) {
                    // Выполняем редирект на полученную ссылку
                    telegram.openLink(redirectUrl);
                } else {
                    console.error("Redirect URL is not available.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    return (
        <div className="container">
            <h1>Выберите протокол VPN</h1>
            <p>
                VLESS reality (tcp). Это современный протокол особенностью которого является маскировка
                под обычный интернет трафик. Из-за данной особенности его сложнее заблокировать.
                Есть возможность добавлять сайты, домены в исключения VPN. Есть роутинг.
                Сложнее заблокировать операторами связи. Рекомендуем использовать данный протокол.
            </p>
            <p>
                {/*VLESS. Есть возможность добавлять сайты, домены в исключения VPN. Есть*/}
                {/*роутинг. Сложнее заблокировать операторами связи. Стоит использовать, если*/}
                {/*Outline не устраивает или не работает*/}
                Outline. Прост и легок в подключении. Однако расходует аккумулятор, легче заблокировать операторами связи.
                Рекомендуем использовать его как запасной вариант подключения
            </p>
        </div>
    );
}
