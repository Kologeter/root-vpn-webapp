import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import axios from "axios";
import {Box, Container, Typography} from "@mui/material";


export default function ProtocolPage() {
    const site = import.meta.env.VITE_SITE || '';
    const navigate = useNavigate();

    console.log('site', site)


    useEffect(() => {
        const tg = window.Telegram.WebApp;

        // const user = tg.initDataUnsafe?.user;

        tg.MainButton.setText("Outline");
        tg.MainButton.show();

        tg.SecondaryButton.setText('VLESS');
        tg.SecondaryButton.show();

        tg.MainButton.onClick(() => {
            console.log("Подключение к Outline VPN");
            // navigate('/outline')
            getLinkRedirectOutline(`${site}/connect/run`);
        });

        tg.SecondaryButton.onClick(() =>{
            console.log('Подключение к VLESS')
            navigate('/vless');

        });

        tg.BackButton.show();
        tg.BackButton.onClick(() =>{
           navigate('/');
        });

        tg.ready();

    }, [site, navigate]);


    const getLinkRedirectOutline = (url) => {
        const telegram = window.Telegram.WebApp;
        const user = telegram.initDataUnsafe?.user;

        if (!user || !user.id) {
            console.error('User or user ID is not available.');
            return;
        }

        // Подготовка hex_id
        const hex_id = "0x" + user.id.toString(16);

        const url_get = `${url}${hex_id}`;

        console.log('Платформа: ', telegram.platform);

        axios.get(url_get)
            .then((response) => {
                const redirectUrl = response.data?.redirectUrl;
                console.log('redirectUrl', redirectUrl);
                if (redirectUrl) {
                    // Выполняем редирект на полученную ссылку
                    telegram.openLink(redirectUrl);
                } else {
                    console.error('Redirect URL is not available.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', marginTop: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Выберите протокол VPN
                </Typography>
                <Typography variant="body1" component="p" paragraph>
                    <strong>Outline.</strong> Прост и легок в подключении. Однако расходует аккумулятор и легче заблокировать со стороны провайдера.
                </Typography>
                <Typography variant="body1" component="p" paragraph>
                    <strong>VLESS.</strong> Есть возможность добавлять сайты, домены в исключения VPN. Есть роутинг. Сложнее заблокировать операторами связи.
                    Стоит использовать, если Outline не устраивает или не работает.
                </Typography>
            </Box>
        </Container>);
}