import { useState } from "react";
import axios from "axios";
import { CopyToClipboard } from "react-copy-to-clipboard";

const CodeVerificationForm = () => {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [verificationData, setVerificationData] = useState(null);
    const site = import.meta.env.VITE_SITE || '';


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (code.length !== 9 || !/^[0-9]{9}$/.test(code)) {
            setError("Введите корректный шестизначный код.");
            return;
        }

        try {
            const response = await axios.post(`${site}/code`, { code });

            if (response.data.success) {
                setIsVerified(true);
                setVerificationData(response.data); // Получаем данные для ключ-ссылки
            } else {
                setError("Неверный код. Попробуйте снова.");
            }
        } catch {
            setError("Произошла ошибка при проверке кода. Попробуйте позже.");
        }
    };

    const handleChange = (e) => {
        setCode(e.target.value);
        setError("");
    };

    return (
        <div className="code-verification-form">
            {!isVerified ? (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="code">Введите шестизначный код:</label>
                    <input
                        type="text"
                        id="code"
                        value={code}
                        onChange={handleChange}
                        maxLength={9}
                        placeholder="123456789"
                    />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit">Проверить</button>
                </form>
            ) : (
                <div>
                    <h3>Код подтверждён! Теперь вы можете:</h3>
                    <button onClick={() => window.location.href = "https://github.com/2dust/v2rayNG/releases/download/1.9.28/v2rayNG_1.9.28_universal.apk"}>Скачать приложение</button>
                    {verificationData?.link && (
                        <CopyToClipboard
                            text={verificationData.link}
                            onCopy={() => alert("Ссылка скопирована!")}
                        >
                            <button>Копировать ключ-ссылку</button>
                        </CopyToClipboard>
                    )}
                </div>
            )}
        </div>
    );
};

export default CodeVerificationForm;
