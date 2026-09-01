const { AccessToken } = require("livekit-server-sdk");

module.exports = async (req, res) => {
  try {
    // Aceita somente POST
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Método não permitido"
      });
    }

    // Variáveis configuradas na Vercel
    const {
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    } = process.env;

    // Verifica configuração
    if (
      !LIVEKIT_URL ||
      !LIVEKIT_API_KEY ||
      !LIVEKIT_API_SECRET
    ) {
      console.error("Variáveis LiveKit ausentes");

      return res.status(500).json({
        error: "Variáveis do LiveKit não configuradas na Vercel"
      });
    }

    // Dados enviados pelo aplicativo
    const {
      room,
      identity
    } = req.body || {};

    // Validação
    if (!room || !identity) {
      return res.status(400).json({
        error: "room e identity são obrigatórios"
      });
    }

    console.log("Gerando token LiveKit");
    console.log("Room:", room);
    console.log("Identity:", identity);

    // Cria o token
    const token = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      {
        identity: String(identity),
        ttl: "6h"
      }
    );

    // Permissões completas para transmissão
    token.addGrant({
      roomJoin: true,
      room: String(room),

      // Pode transmitir áudio e vídeo
      canPublish: true,

      // Pode receber áudio e vídeo de outros participantes
      canSubscribe: true,

      // Pode enviar dados
      canPublishData: true
    });

    // Gera JWT
    const jwt = await token.toJwt();

    console.log("Token LiveKit gerado com sucesso");

    return res.status(200).json({
      token: jwt,
      url: LIVEKIT_URL
    });

  } catch (error) {

    console.error(
      "Erro ao gerar token LiveKit:",
      error
    );

    return res.status(500).json({
      error: "Erro ao gerar token LiveKit"
    });
  }
};
