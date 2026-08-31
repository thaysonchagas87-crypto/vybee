const { AccessToken } = require('livekit-server-sdk');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    const {
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    } = process.env;

    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return res.status(500).json({
        error: 'Variáveis do LiveKit não configuradas na Vercel'
      });
    }

    const { room, identity } = req.body || {};

    if (!room || !identity) {
      return res.status(400).json({
        error: 'room e identity são obrigatórios'
      });
    }

    const token = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      {
        identity: String(identity),
        ttl: '6h'
      }
    );

    token.addGrant({
      roomJoin: true,
      room: String(room),
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    const jwt = await token.toJwt();

    return res.status(200).json({
      token: jwt,
      url: LIVEKIT_URL
    });

  } catch (error) {
    console.error('Erro ao gerar token:', error);

    return res.status(500).json({
      error: 'Erro ao gerar token LiveKit'
    });
  }
};
