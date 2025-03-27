const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const QRCode = require('qrcode');

// Configuración de transporte usando tus variables de entorno existentes
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // true para puerto 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
  }
});

// Función para cargar y compilar plantillas
const loadTemplate = (templateName) => {
  const filePath = path.join(__dirname, 'templates', `${templateName}.html`);
  const template = fs.readFileSync(filePath, 'utf8');
  return Handlebars.compile(template);
};

// Función para formatear la fecha en español
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('es-ES', options);
};

// Función mejorada para generar código QR como imagen base64
const generateQRCode = async (data) => {
  try {
    // Asegurarse de que los datos no son demasiado grandes
    const qrData = typeof data === 'string' ? data : JSON.stringify(data);
    
    // Generar el código QR con parámetros optimizados para emails
    const qrCodeBase64 = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H', // Mayor nivel de corrección de errores
      color: {
        dark: '#000000',   // Color de los puntos
        light: '#ffffff'   // Color de fondo
      }
    });
    
    // Verificar que la cadena base64 comienza correctamente
    if (!qrCodeBase64.startsWith('data:image/png;base64,')) {
      console.warn('La cadena base64 del QR no tiene el formato esperado');
    }
    
    return qrCodeBase64;
  } catch (error) {
    console.error('Error generando código QR:', error);
    // Proporcionar una imagen de respaldo en caso de error
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAABmJLR0QA/wD/AP+gvaeTAAAEAklEQVR4nO3UQQ0AIRAEwcMJiEACSvh3UAk8NFmB9JiZOwDg1Bs9AAD+ZVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGg8QGdlgQAXf6fxQAAAABJRU5ErkJggg==';
  }
};

/**
 * Enviar email de confirmación de compra de tickets
 * @param {Object} data - Datos para la plantilla
 * @returns {Promise<Object>} Resultado del envío
 */
const sendTicketConfirmation = async (data) => {
  try {
    const { customerInfo, tickets, screening } = data;

    // Calcular precio total
    const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.pricePaid, 0);

    // Extraer el código base del ticket (sin el sufijo del asiento)
    const masterTicketCode = tickets[0].ticketCode.split('-').slice(0, -1).join('-');

    // Crear datos para el QR (simplificar los datos para evitar QR muy densos)
    const qrData = JSON.stringify({
      code: masterTicketCode,
      movie: screening.movie.title,
      date: formatDate(screening.date),
      time: screening.startTime,
      seats: tickets.map(t => `${t.seats.row}${t.seats.number}`).join(', ')
    });

    // Generar código QR como imagen base64
    let qrCodeImage;
    try {
      qrCodeImage = await generateQRCode(qrData);
      // Verificar la longitud de la cadena base64 (debug)
      console.log(`QR generado: ${qrCodeImage.substring(0, 50)}... (longitud: ${qrCodeImage.length})`);
    } catch (qrError) {
      console.error('Error al generar QR, usando URL alternativa:', qrError);
      // URL alternativa en caso de fallo (enlace a verificación de ticket)
      qrCodeImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAABmJLR0QA/wD/AP+gvaeTAAAEAklEQVR4nO3UQQ0AIRAEwcMJiEACSvh3UAk8NFmB9JiZOwDg1Bs9AAD+ZVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGgYVgAaBgWABqGBYCGYQGg8QGdlgQAXf6fxQAAAABJRU5ErkJggg==`;
    }

    // Preparar datos para la plantilla
    const templateData = {
      customerName: customerInfo.name,
      movieTitle: screening.movie.title,
      roomName: screening.room.name,
      screeningDate: formatDate(screening.date),
      screeningTime: screening.startTime,
      tickets: tickets,
      totalPrice: totalPrice.toFixed(2),
      ticketUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/mi-cuenta/tickets`,
      cinemaName: 'CinemaBar',
      qrCodeImage: qrCodeImage,
      masterTicketCode: masterTicketCode
    };

    // Compilar plantilla
    const template = loadTemplate('confirmationEmail');
    const htmlContent = template(templateData);

    // Enviar email
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME || 'CinemaBar'}" <${process.env.EMAIL_USER}>`,
      to: customerInfo.email,
      subject: '✅ Confirmación de compra de entradas - CinemaBar',
      html: htmlContent,
      // Configuración adicional para clientes de correo que pueden bloquear imágenes incrustadas
      attachDataUrls: true,
      attachments: [{
        filename: 'ticket-qr.png',
        path: qrCodeImage,
        cid: 'ticket-qr-code' // ID de contenido para referenciar desde el HTML
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error al enviar email de confirmación:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Enviar email de cancelación de tickets
 * @param {Object} data - Datos para la plantilla
 * @returns {Promise<Object>} Resultado del envío
 */
const sendTicketCancellationEmail = async (data) => {
  try {
    const { customerInfo, ticket, screening } = data;

    // Determinar si es cancelación individual o múltiple
    const tickets = Array.isArray(ticket) ? ticket : [ticket];

    // Calcular precio total
    const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.pricePaid, 0);

    // Preparar datos para la plantilla
    const templateData = {
      customerName: customerInfo.name,
      movieTitle: screening.movie.title,
      roomName: screening.room.name,
      screeningDate: formatDate(screening.date),
      screeningTime: screening.startTime,
      totalPrice: totalPrice.toFixed(2),
      carteleraUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/peliculas`,
      isCustomerCancellation: true,
      cinemaName: 'CinemaBar'
    };

    // Compilar plantilla
    const template = loadTemplate('cancellationEmail');
    const htmlContent = template(templateData);

    // Enviar email
    const mailOptions = {
      from: `"${process.env.EMAIL_SENDER_NAME || 'CinemaBar'}" <${process.env.EMAIL_USER}>`,
      to: customerInfo.email,
      subject: '❌ Cancelación de entradas - CinemaBar',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error al enviar email de cancelación:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendTicketConfirmation,
  sendTicketCancellationEmail
};