const http = require('http');
const https = require('https');
const cheerio = require('cheerio');

// URL de la Casa del Libro
const url = 'https://www.casadellibro.com/?gad_source=1&gclid=Cj0KCQiA0MG5BhD1ARIsAEcZtwSZZ4rl8gmD92YjqIqMpz_K8U1tWTmI8qN_LhmiqpGQ_RmeOib-m_saAm7WEALw_wcB';

async function obtenerTopLibros() {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const $ = cheerio.load(data);

                const nuevosLibros = [];
                
                // Buscar el div que tiene los libros más vendidos y guardar el top 10
                $('div.compact-product').each((i, element) => {
                    if (i < 10) { 
                        const titulo = $(element).find('a.product-title').text().trim();
                        if (titulo) {
                            nuevosLibros.push(titulo); 
                        }
                    }
                });

                resolve(nuevosLibros);
            });
        });
    });
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        const libros = await obtenerTopLibros();
        
        if (libros && libros.length > 0) {
            res.writeHead(200, { 
                'Content-Type': 'text/html; charset=utf-8' 
            });
            res.end(`
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Top 10 Libros - Casa del Libro</title>
                    <script>
                        setInterval(async function() {
                            const response = await fetch('/');
                            const html = await response.text();
                            document.body.innerHTML = html;
                        }, 10000);
                    </script>
                </head>
                <body>
                    <h1>Top 10 Libros más vendidos en Casa del Libro:</h1>
                    <ul>
                        ${libros.map(libro => `<li>${libro}</li>`).join('')}
                    </ul>
                    <p><em>Última actualización: ${new Date().toLocaleTimeString()}</em></p>
                </body>
                </html>
            `);
        }
    }
});

setInterval(async () => {
    const libros = await obtenerTopLibros();
    console.log("Libros encontrados:");
    libros.forEach(libro => console.log(libro));
}, 10000); // Cada 10 segundos

server.listen(3000, () => {
    console.log("http://localhost:3000");
});
