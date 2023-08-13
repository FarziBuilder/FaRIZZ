const { Client } = require('whatsapp-web.js');
const client = new Client();
const qrcode = require('qrcode'); // Import the qrcode library
const fs = require('fs'); // Import the fs module
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: "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",
});

client.on('qr', async (qr) => {
    console.log('QR RECEIVED', qr);

    try {
        // Generate QR code as a data URL
        const qrCodeDataUrl = await qrcode.toDataURL(qr);

        // Remove the data URL header to extract the base64 encoded data
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');

        // Convert base64 data to a Buffer
        const buffer = Buffer.from(base64Data, 'base64');

        // Save the buffer as a PNG file
        const qrImagePath = 'qrcode.png'; // Specify the desired file name and format
        fs.writeFileSync(qrImagePath, buffer);

        console.log(`QR code saved as ${qrImagePath}`);
    } catch (error) {
        console.error('Error generating or saving QR code:', error);
    }
});

client.on('ready', async () => {
    console.log('Client is ready!');

    try {
        // Instantiate OpenAIApi with the provided configuration
        const openai = new OpenAIApi(configuration);

        // Number where you want to send the message.
        const number = "+916394189731";

        // Your message.
        const promptz = "ask about how was your day?"; // Define your prompt
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: promptz,
            temperature: 0.3,
            max_tokens: 512,
            top_p: 0.5,
        });
        const responseText = response.data.choices[0].text.trim();
        console.log({ responseText });

        // Getting chatId from the number.
        // We have to delete "+" from the beginning and add "@c.us" at the end of the number.
        const chatId = number.substring(1) + "@c.us";

        // Sending message.
        await client.sendMessage(chatId, responseText);
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
    }
});

client.initialize();
