import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { mainButton } from "@telegram-apps/sdk";
import { secondaryButton } from '@telegram-apps/sdk';


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

        // Монтируем mainButton, если доступен
        if (mainButton?.mount?.isAvailable?.()) {
            mainButton.mount();
            console.log("mainButton mounted:", mainButton.isMounted?.());
        }

        // Устанавливаем параметры mainButton, если доступно
        if (mainButton?.setParams?.isAvailable?.()) {
            mainButton.setParams({
                backgroundColor: "#000000",
                hasShineEffect: true,
                isEnabled: true,
                isLoaderVisible: true,
                isVisible: true,
                text: "VLESS",
                textColor: "#ffffff",
            });
            console.log("mainButton state:", mainButton.state?.());
        }

        // mainButton

        // Настраиваем SecondaryButton, если он существует
        if (secondaryButton.mount.isAvailable()) {
            secondaryButton.mount();
            secondaryButton.isMounted(); // true
        }

        if (secondaryButton.setParams.isAvailable()) {
            secondaryButton.setParams({
                backgroundColor: '#000000',
                hasShineEffect: true,
                isEnabled: true,
                isLoaderVisible: true,
                isVisible: true,
                position: 'left',
                text: 'Outline',
                textColor: '#ffffff'
            });

            secondaryButton.onClick(() => {
                console.log("Подключение к Outline VPN");
                getLinkRedirectOutline(`${site}/connect/run`);
            });
        }

        // Настраиваем MainButton
        // tg.MainButton.setText("VLESS");
        // tg.MainButton.show();
        //
        // tg.MainButton.onClick(() => {
        //     console.log("Подключение к VLESS");
        //     navigate("/vless");
        // });

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
                Outline. Прост и легок в подключении. Однако расходует аккумулятор и легче
                заблокировать со стороны провайдера.
            </p>
            <p>
                VLESS. Есть возможность добавлять сайты, домены в исключения VPN. Есть
                роутинг. Сложнее заблокировать операторами связи. Стоит использовать, если
                Outline не устраивает или не работает
            </p>
        </div>
    );
}
