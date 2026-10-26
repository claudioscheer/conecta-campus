# Rodar no Aparelho Físico (Android Dev Build)

Guia para executar o aplicativo Conecta Campus em um dispositivo físico com login Google nativo (@react-native-google-signin/google-signin).

## 1. Configurar o IP da API Local

Quando a API estiver rodando no seu computador (`http://localhost:3000`), o aparelho físico conectado na mesma rede Wi-Fi precisa apontar para o IP local da máquina na rede:

1. Descubra o IP local da máquina (ex.: `192.168.1.4` via `ipconfig` ou `ifconfig`).
2. Edite `app/app.json` na seção `extra.apiBaseUrl`:
   ```json
   "extra": {
     "apiBaseUrl": "http://SEU_IP_LOCAL:3000/v1"
   }
   ```
3. Certifique-se de que o firewall da máquina permite conexões na porta 3000 para a rede local.

## 2. Google OAuth & SHA-1

O Google Sign-In nativo no Android exige que o hash SHA-1 do keystore esteja cadastrado no Google Cloud Console.

### Obter o SHA-1 do Keystore de Debug

No Windows (PowerShell):
```bash
keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
```

No macOS/Linux:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Copie a linha com `SHA1: XX:XX:XX:...`.

### Configuração no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) no projeto do Conecta Campus.
2. Em **APIs e Serviços > Credenciais**:
   - Crie uma credencial **ID do cliente OAuth**:
     - Tipo: **Aplicativo Android**
     - Nome do pacote: `br.com.setrem.conectacampus` (conforme `android.package` em `app/app.json`)
     - Impressão digital do certificado SHA-1: cole o SHA-1 obtido acima.
   - Guarde também o **ID do cliente Web** (usado como audience pelo servidor e `googleWebClientId`).
3. Atualize os Client IDs em `app/app.json`:
   ```json
   "extra": {
     "googleWebClientId": "SEU_WEB_CLIENT_ID.apps.googleusercontent.com",
     "googleAndroidClientId": "SEU_ANDROID_CLIENT_ID.apps.googleusercontent.com"
   }
   ```

## 3. Gerar e Executar o Dev Build

Com o aparelho conectado via USB e com **Depuração USB** ativada:

```bash
cd app
npx expo run:android
```

O Expo gerará o build de desenvolvimento local instalando o APK diretamente no aparelho físico.
