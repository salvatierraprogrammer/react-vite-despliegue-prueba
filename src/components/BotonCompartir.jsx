import React, { useState } from 'react';
import {
  Modal,
  Box,
  Button,
  Typography,
  IconButton,
  TextareaAutosize,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

const BotonCompartir = ({ publicacion }) => {
  const [open, setOpen] = useState(false);
  const [mensajeFacebook, setMensajeFacebook] = useState('');
  const [indexMensaje, setIndexMensaje] = useState(0);

  // Función para compartir en WhatsApp
  const compartirEnWhatsApp = () => {
    const mensaje = `🔍 *Busco Acompañante Terapéutico:*\n\n📋 *${publicacion.cliente}* \n🚻 *Paciente:* ${publicacion.sexo}\n🎂 *Edad:* ${publicacion.edad}\n📍 *Localidad:* ${publicacion.localidad}\n🗺️ *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n✍️ *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email}`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://api.whatsapp.com/send/?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, '_blank');
  };

  // Función para generar un mensaje de Facebook
  const generarMensajeFacebook = () => {
    const mensajes = [
       `🔍 Busco Acompañante Terapéutico:\n\n📋 * ${publicacion.cliente}* \n👤 *Paciente:* ${publicacion.sexo}\n🎂 *Edad:* ${publicacion.edad} años\n📍 *Localidad:* ${publicacion.localidad}\n🌎 *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n✏️ *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email} `,
       `🔎 Se busca Acompañante Terapéutico:\n\n📋 * ${publicacion.cliente}* \n🧑‍⚕️ *Paciente:* ${publicacion.sexo}\n🗓️ *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n📌 *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n📝 *Descripción:* ${publicacion.descripcion}\n📲 *Teléfono:* ${publicacion.telefono}\n✉️ *Email:* ${publicacion.email} `,
       `📢 Se solicita Acompañante Terapéutico:\n\n📋 * ${publicacion.cliente}*\n👨‍⚕️ *Paciente:* ${publicacion.sexo}\n🎂 *Edad:* ${publicacion.edad} años\n🌆 *Localidad:* ${publicacion.localidad}\n🏙️ *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n🗒️ *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email} `,
       `🚀 Necesitamos Acompañante Terapéutico:\n\n📋 * ${publicacion.cliente}* \n🧑‍⚕️ *Paciente:* ${publicacion.sexo}\n🗓️ *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n🗺️ *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n📝 *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email} `,
       `🆘 Buscamos Acompañante Terapéutico:\n\n📋 * ${publicacion.cliente}* \n👩‍⚕️ *Paciente:* ${publicacion.sexo}\n🎂 *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n🗺️ *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n📝 *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email} `,
       `👀 Se necesita Acompañante Terapéutico:\n\n📋 * ${publicacion.cliente}* \n👨‍⚕️ *Paciente:* ${publicacion.sexo}\n🗓️ *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n📍 *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n🗒️ *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email} `,
       `🔔 Solicito Acompañante Terapéutico:\n\n📋 * ${publicacion.cliente}* \n🧑‍⚕️ *Paciente:* ${publicacion.sexo}\n🗓️ *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n📌 *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n📝 *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email} `,
       `💬 Se busca Acompañante Terapéutico:\n\n📋 * ${publicacion.cliente}* \n👩‍⚕️ *Paciente:* ${publicacion.sexo}\n🗓️ *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n🌍 *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n📝 *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email} `,
       `✨ Buscamos Acompañante Terapéutico:\n\n📋 * ${publicacion.cliente}* \n🧑‍⚕️ *Paciente:* ${publicacion.sexo}\n🗓️ *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n📍 *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n📝 *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email}` ,
       `📢 Urgente: Acompañante Terapéutico necesario:\n\n📋 ${publicacion.cliente} *\n🧑‍⚕️ *Paciente:* ${publicacion.sexo}\n🗓️ *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n🌍 *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n🗒️ *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email} `,
       `🔎 Se solicita Acompañante Terapéutico:\n\n📋 *${publicacion.cliente}* \n🧑‍⚕️ *Paciente:* ${publicacion.sexo}\n🎂 *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n📌 *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n📝 *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email} `,
       `📝 Necesitamos Acompañante Terapéutico:\n\n📋 *${publicacion.cliente}* \n👨‍⚕️ *Paciente:* ${publicacion.sexo}\n🗓️ *Edad:* ${publicacion.edad} años\n🏠 *Localidad:* ${publicacion.localidad}\n🌍 *Zona:* ${publicacion.zona}\n🏥 *Diagnóstico:* ${publicacion.diagnostico}\n🗒️ *Descripción:* ${publicacion.descripcion}\n📞 *Teléfono:* ${publicacion.telefono}\n📧 *Email:* ${publicacion.email }`,
    ];

    // Actualizar el mensaje y el índice
    setMensajeFacebook(mensajes[indexMensaje]);
    setIndexMensaje((prevIndex) => (prevIndex + 1) % mensajes.length);
    setOpen(true);
  };

  return (
    <Box>
      <Box component="li" display="inline">
        <Button
          variant="contained"
          color="success"
          startIcon={<WhatsAppIcon />}
          onClick={compartirEnWhatsApp}
          sx={{ mt: 2, ml: 2 }}
        >
          Compartir
        </Button>
      </Box>
      <Box component="li" display="inline">
        <Button
          variant="contained"
          color="primary"
          startIcon={<FacebookIcon />}
          onClick={generarMensajeFacebook}
          sx={{ mt: 2, ml: 2 }}
        >
          Compartir
        </Button>
      </Box>

      {/* Modal para copiar mensaje de Facebook */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Mensaje para Facebook</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <TextareaAutosize
            value={mensajeFacebook}
            readOnly
            minRows={10}
            style={{
              width: '100%',
              padding: 10,
              background: '#3b5998',
              borderRadius: 10,
              margin: 2,
              color: 'white',
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(mensajeFacebook);
              alert('Mensaje copiado al portapapeles');
            }}
            sx={{ mt: 2, width: '100%' }}
          >
            Copiar al portapapeles
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FacebookIcon />}
            onClick={generarMensajeFacebook}
            sx={{ mt: 2, width: '100%' }}
          >
            Generar
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default BotonCompartir;