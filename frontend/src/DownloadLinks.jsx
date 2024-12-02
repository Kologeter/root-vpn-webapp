import {useEffect} from "react";
import {useNavigate} from "react-router-dom";


function DownloadLinks() {

    const navigate = useNavigate();

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




    const downloadOutline = () => {
        const tg = window.Telegram.WebApp;
        const platformLinks = {
            ios: 'https://apps.apple.com/us/app/outline-app/id1356177741',
            android: 'https://play.google.com/store/apps/details?id=org.outline.android.client',
            web: 'https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe',
            macos: 'https://itunes.apple.com/us/app/outline-app/id1356178125',
            tdesktop: 'https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe',
            default: 'https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe'
        };
        const link = platformLinks[tg.platform] || platformLinks.default;
        tg.openLink(link);
    };


    const downloadVless = () => {
        const tg = window.Telegram.WebApp;
        const platformLinks = {
            ios: 'https://apps.apple.com/ru/app/v2raytun/id6476628951',
            android: 'https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=ru&gl=US',
            web: 'https://github.com/hiddify/hiddify-next/releases/latest/download/Hiddify-Windows-Setup-x64.exe',
            macos: 'https://apps.apple.com/ru/app/v2raytun/id6476628951',
            tdesktop: 'https://github.com/hiddify/hiddify-next/releases/latest/download/Hiddify-Windows-Setup-x64.exe',
            default: 'https://github.com/hiddify/hiddify-next/releases/latest/download/Hiddify-Windows-Setup-x64.exe'
        };
        const link = platformLinks[tg.platform] || platformLinks.default;
        tg.openLink(link);
    };

    return (
        <div className="App">
            <button onClick={downloadVless}>VLESS</button>
            <button onClick={downloadOutline}>Outline</button>
        </div>
    )
}

export default DownloadLinks;
