const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para aceptar JSON
app.use(express.json());

// Captura todas las peticiones GET que Laravel envíe al proxy
app.get('/', async (req, res) => {
    try {
        // req.query contiene todos los parámetros (?Action=GetOrders&Signature=... etc)
        const params = req.query;

        // El proxy hace la petición real desde su IP limpia
        const response = await axios.get('https://sellercenter-api.falabella.com/', {
            params: params,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'es-PE,es;q=0.9',
                'Connection': 'keep-alive'
            }
        });

        // Retorna la respuesta exacta de Falabella a tu Laravel en Hostgator
        res.status(response.status).json(response.data);

    } catch (error) {
        if (error.response) {
            // Si Falabella responde con un error de negocio (ej: Firma inválida), lo pasamos limpio
            res.status(error.response.status).json(error.response.data);
        } else {
            // Si hay un error de conexión del proxy
            res.status(500).json({ 
                error: 'Error en el servidor Proxy', 
                message: error.message 
            });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Proxy intermedio corriendo en el puerto ${PORT}`);
});