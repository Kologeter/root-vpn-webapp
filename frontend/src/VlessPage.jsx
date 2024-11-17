import { useEffect, useState } from 'react';
import './App.css';
import androidInstr from './assets/images/androidInstr.jpg';
import iphoneGif from './assets/images/iphone.gif';
import hiddfyMp4 from './assets/images/hiddfy.mp4';
import { Box, Typography, TextField, Button, InputAdornment, IconButton, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function VlessSettings() {
    const [copiedIndex, setCopiedIndex] = useState(null); // Включено состояние
    const [Video, setVideo] = useState(false);
    const [Platform, setPlatform] = useState('');
    const [key, setKey] = useState('');

    // Обеспечить, чтобы значение site корректно передавалось:
    const site = import.meta.env.VITE_SITE || '';

    console.log('site', site)

    const handleCopy = (link, index) => {
        navigator.clipboard.writeText(link);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const getVlessApp = () => {
        const tg = window.Telegram.WebApp;

        switch (tg.platform) {
            case 'ios':
                tg.openLink('https://apps.apple.com/ru/app/v2raytun/id6476628951');
                return;
            case 'android':
                tg.openLink('https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=ru&gl=US');
                return;
            case 'web':
                tg.openLink('https://github.com/hiddify/hiddify-next/releases/latest/download/Hiddify-Windows-Setup-x64.exe');
                return;
            case 'macos':
                tg.openLink('https://apps.apple.com/ru/app/v2raytun/id6476628951');
                return;
            case 'tdesktop':
                tg.openLink('https://github.com/hiddify/hiddify-next/releases/latest/download/Hiddify-Windows-Setup-x64.exe');
                return;
            default:
                tg.openLink('https://s3.amazonaws.com/outline-releases/client/windows/stable/Outline-Client.exe');
                return;
        }
    };

    useEffect(() => {
        const tg = window.Telegram.WebApp;
        switch (tg.platform) {
            case 'android':
                setPlatform(androidInstr);
                break;
            case 'ios':
                setPlatform(iphoneGif);
                break;
            case 'tdesktop':
            case 'macos':
                setVideo(true);
                setPlatform(hiddfyMp4);
                break;
            default:
                setPlatform('');
        }
    }, []);

    useEffect(() => {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;
        setKey(user?.id || '');
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Шаг 1 */}
            <Typography variant="subtitle1" fontWeight="bold">
                Шаг 1. Скопируйте ваш ключ
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    value={key}
                    placeholder={`${site}/vless/${key}`}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleCopyClick} edge="end">
                                    <ContentCopyIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" onClick={handleCopyClick}>
                    Копировать
                </Button>
            </Box>
            {copiedIndex !== null && (
                <Typography variant="body2" color="success.main">
                    Скопировано!
                </Typography>
            )}

            {/* Шаг 2 */}
            <Typography variant="subtitle1" fontWeight="bold">
                Шаг 2. Установите приложение
            </Typography>
            <Button variant="contained" color="primary" onClick={getVlessApp}>
                Установить приложение
            </Button>

            {/* Шаг 3 */}
            <Typography variant="subtitle1" fontWeight="bold">
                Шаг 3. Подключитесь
            </Typography>
            {Platform && (
                <Box
                    component="img"
                    src={Platform}
                    alt="инструкция"
                    sx={{ width: '100%', objectFit: 'contain' }}
                />
            )}
            {Video && (
                <Box sx={{ position: 'relative', width: '100%', height: 0, paddingTop: '56.25%' }}>
                    <Box
                        component="video"
                        src={Video}
                        controls
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    >
                        Ваш браузер не поддерживает видео.
                    </Box>
                </Box>
            )}

            {/* Snackbar для уведомления о копировании */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message="Ключ скопирован!"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
}

