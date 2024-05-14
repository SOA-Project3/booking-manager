const nodemailer = require('nodemailer');

  const sendEmail = (subject, message, recipientEmail) => {
    // Create a Nodemailer transporter
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Your SMTP server host
      port: 587, // Your SMTP server port (typically 587 for TLS)
      secure: false, // Set to true if your SMTP server requires TLS
      auth: {
        user: 'soagrupo6@gmail.com', // Your email address
        pass: 'lumo ovap ebck qrnv' // Your email password or application-specific password
      }
    });
  
    // Send email
    transporter.sendMail({
      from: 'soagrupo6@gmail.com',
      to: recipientEmail,
      subject: subject,
      text: message,
    }, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        // Handle error, maybe return an error response
      } else {
        console.log("Email sent:", info.response);
        // Email sent successfully, maybe log success or return a success response
      }
    });
  };


module.exports = {
    sendEmail
}