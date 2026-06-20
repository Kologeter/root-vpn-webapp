import { useNavigate } from "react-router-dom";
import { useEffect } from "react";


export default function ProtocolPage() {
    const navigate = useNavigate();
    const themeParams = window.Telegram?.WebApp?.themeParams || {
        bg_color: '#ffffff',
        text_color: '#000000',
        button_color: '#2ea6ff',
    };

    useEffect(() => {
        const tg = window.Telegram?.WebApp;

        if (!tg) {
            console.error("Telegram WebApp API is not available.");
            return;
        }

        // Протоколов теперь три, а нативных нижних кнопки только две (Main/Secondary).
        // Поэтому выбор — через кликабельные карточки ниже, а нативные кнопки прячем,
        // чтобы на них не висели обработчики с прошлых версий страницы.
        tg.MainButton?.hide();
        tg.SecondaryButton?.hide();

        const onBack = () => navigate("/");
        tg.BackButton.show();
        tg.BackButton.onClick(onBack);

        tg.ready();

        return () => {
            tg.BackButton.offClick(onBack);
        };
    }, [navigate]);

    const cardStyle = {
        backgroundColor: themeParams.bg_color || '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        cursor: 'pointer',
    };
    const pickStyle = {
        fontWeight: 600,
        marginTop: '10px',
        color: themeParams.button_color || '#2ea6ff',
    };

    const go = (path) => () => navigate(path);
    const onKey = (path) => (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(path);
        }
    };

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
                <div style={cardStyle} role="button" tabIndex={0} onClick={go('/vless')} onKeyDown={onKey('/vless')}>
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
                    <p style={pickStyle}>Подключить VLESS →</p>
                </div>
                <div style={cardStyle} role="button" tabIndex={0} onClick={go('/amnezia')} onKeyDown={onKey('/amnezia')}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                        AmneziaWG 2.0
                    </h2>
                    <p>
                        Обфусцированный UDP-протокол на базе WireGuard. Бьёт в другой вектор, чем VLESS/Outline:
                        там, где давят TLS/HTTP-маскировку, AmneziaWG часто продолжает работать.
                    </p>
                    <p>Высокая скорость, низкий расход батареи. Подключение по QR-коду.</p>
                    <p style={{ fontWeight: '600' }}>Рекомендуем как независимый запасной канал.</p>
                    <p style={pickStyle}>Подключить AmneziaWG →</p>
                </div>
                <div style={cardStyle} role="button" tabIndex={0} onClick={go('/outline')} onKeyDown={onKey('/outline')}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                        Outline
                    </h2>
                    <p>
                        Прост и легок в подключении. Однако расходует аккумулятор, легче заблокировать операторами
                        связи.
                    </p>
                    <p>Рекомендуем использовать его как запасной вариант подключения.</p>
                    <p style={pickStyle}>Подключить Outline →</p>
                </div>
            </div>
        </div>
    );
}
