import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import WebApp from '@twa-dev/sdk';



export default function ProtocolPage() {
    const site = import.meta.env.VITE_SITE || "";
    const navigate = useNavigate();
    const themeParams = WebApp?.themeParams || {
        bg_color: '#ffffff',
        text_color: '#000000',
    };

    console.log("site", site);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;

        if (!tg) {
            console.error("Telegram WebApp API is not available.");
            return;
        }

        // Колбэки сохраняем в переменные, чтобы снять их в cleanup (offClick),
        // иначе при каждом заходе на /protocol на кнопки навешиваются новые обработчики.
        const onMain = () => {
            console.log("Подключение к VLESS");
            navigate("/vless");
        };
        const onSecondary = () => {
            console.log("Подключение к Outline VPN");
            navigate("/outline");
        };
        const onBack = () => {
            tg.MainButton.setText("Подключиться");
            navigate("/");
        };

        // Настраиваем MainButton
        tg.MainButton.setText("VLESS");
        tg.MainButton.show();
        tg.MainButton.onClick(onMain);

        tg.SecondaryButton.setText('Outline');
        tg.SecondaryButton.show();
        tg.SecondaryButton.onClick(onSecondary);

        // Настраиваем BackButton
        tg.BackButton.show();
        tg.BackButton.onClick(onBack);

        tg.ready();
        WebApp.ready();

        return () => {
            tg.MainButton.offClick(onMain);
            tg.SecondaryButton.offClick(onSecondary);
            tg.BackButton.offClick(onBack);
        };
    }, [site, navigate]);

    // const getLinkRedirectOutline = (url) => {
    //     const telegram = window.Telegram?.WebApp;
    //     const user = telegram?.initDataUnsafe?.user;
    //
    //     if (!user || !user.id) {
    //         console.error("User or user ID is not available.");
    //         return;
    //     }
    //
    //     // Подготовка hex_id
    //     const hex_id = "0x" + user.id.toString(16);
    //
    //     const url_get = `${url}${hex_id}`;
    //
    //     console.log("Платформа: ", telegram.platform);
    //
    //     axios
    //         .get(url_get)
    //         .then((response) => {
    //             const redirectUrl = response.data?.redirectUrl;
    //             console.log("redirectUrl", redirectUrl);
    //             if (redirectUrl) {
    //                 // Выполняем редирект на полученную ссылку
    //                 telegram.openLink(redirectUrl);
    //             } else {
    //                 console.error("Redirect URL is not available.");
    //             }
    //         })
    //         .catch((error) => {
    //             console.error("Error:", error);
    //         });
    // };

    return (
        <div
            style={{
                backgroundColor: themeParams.bg_color || '#ffffff',
                color: themeParams.text_color || '#000000',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                padding: '16px',
                minHeight: '100vh',
            }}
        >
            <h1
                style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '16px',
                }}
            >
                Выберите протокол VPN
            </h1>
            <div style={{ display: 'grid', gap: '16px' }}>
                <div
                    style={{
                        backgroundColor: themeParams.bg_color || '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '16px',
                    }}
                >
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                        VLESS reality (tcp)
                    </h2>
                    <p>
                        Это современный протокол, особенностью которого является маскировка под обычный интернет трафик.
                        Из-за данной особенности его сложнее заблокировать.
                    </p>
                    <p>
                        Есть возможность добавлять сайты, домены в исключения VPN. Есть роутинг. Сложнее заблокировать
                        операторами связи.
                    </p>
                    <p style={{ fontWeight: '600' }}>Рекомендуем использовать данный протокол.</p>
                </div>
                <div
                    style={{
                        backgroundColor: themeParams.bg_color || '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        padding: '16px',
                    }}
                >
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                        Outline
                    </h2>
                    <p>
                        Прост и легок в подключении. Однако расходует аккумулятор, легче заблокировать операторами
                        связи.
                    </p>
                    <p>Рекомендуем использовать его как запасной вариант подключения.</p>
                </div>
            </div>
        </div>
    );
}
