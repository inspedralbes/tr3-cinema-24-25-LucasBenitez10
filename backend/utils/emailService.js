// utils/emailService.js
const nodemailer = require('nodemailer');

/**
 * Servicio para envío de emails desde el backend
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Envía un email de confirmación de compra de tickets
   * @param {Object} options - Datos necesarios para el email
   * @param {Object} options.customerInfo - Información del cliente
   * @param {Array} options.tickets - Array de tickets comprados
   * @param {Object} options.screening - Información de la proyección
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendTicketConfirmation({ customerInfo, tickets, screening }) {
    try {
      if (!customerInfo || !customerInfo.email) {
        throw new Error('Email del cliente no proporcionado');
      }

      // Preparar datos para el email
      const movieTitle = screening.movie.title;
      const roomName = screening.room.name;
      const screeningDate = new Date(screening.date);
      const formattedDate = screeningDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Preparar información de asientos
      const seatsList = tickets.map(ticket => 
        `Fila ${ticket.seats.row}, Asiento ${ticket.seats.number}: ${ticket.ticketCode}`
      ).join('\n');
      
      // Calcular precio total
      const totalPrice = tickets.reduce((sum, ticket) => sum + ticket.pricePaid, 0);

      // Contenido del email en texto plano (para clientes sin HTML)
      const textContent = `
¡Gracias por tu compra en CinemaBar!

INFORMACIÓN DE TU COMPRA
Película: ${movieTitle}
Sala: ${roomName}
Fecha: ${formattedDate}
Hora: ${screening.startTime}

TUS ENTRADAS:
${seatsList}

Total pagado: €${totalPrice.toFixed(2)}

Presenta estos códigos en la entrada del cine para acceder a la sala.
      `;

      // Configuración del email
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: customerInfo.email,
        subject: `Confirmación de entradas - ${movieTitle}`,
        text: textContent,
        attachments: []  // No enviamos adjuntos en esta versión
      };

      // Enviar el email
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email enviado a ${customerInfo.email}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía un email de cancelación de tickets
   * @param {Object} options - Datos necesarios para el email
   * @param {Object} options.customerInfo - Información del cliente
   * @param {Object} options.ticket - Ticket cancelado (o array de tickets)
   * @param {Object} options.screening - Información de la proyección
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendTicketCancellationEmail({ customerInfo, ticket, screening }) {
    try {
      if (!customerInfo || !customerInfo.email) {
        throw new Error('Email del cliente no proporcionado');
      }

      // Determinar si es un ticket único o varios
      const tickets = Array.isArray(ticket) ? ticket : [ticket];
      const ticketCodes = tickets.map(t => t.ticketCode).join(', ');
      
      // Contenido del email en texto plano
      const textContent = `
CONFIRMACIÓN DE CANCELACIÓN

Hola ${customerInfo.name || customerInfo.email},

Te confirmamos que ${tickets.length > 1 ? 'tus entradas han' : 'tu entrada ha'} sido cancelada exitosamente.

Película: ${screening.movie.title}
Sala: ${screening.room.name}
Código(s): ${ticketCodes}

El reembolso será procesado en los próximos 5-7 días hábiles.
      `;

      // Configuración del email
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: customerInfo.email,
        subject: `Cancelación de ${tickets.length > 1 ? 'entradas' : 'entrada'} - ${screening.movie.title}`,
        text: textContent
      };

      // Enviar el email
      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error al enviar email de cancelación:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();