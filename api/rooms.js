const {
  RoomServiceClient
} = require("livekit-server-sdk");

module.exports = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        error: "Método não permitido"
      });
    }

    const {
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    } = process.env;

    if (
      !LIVEKIT_URL ||
      !LIVEKIT_API_KEY ||
      !LIVEKIT_API_SECRET
    ) {
      return res.status(500).json({
        error: "Variáveis do LiveKit não configuradas"
      });
    }

    const service = new RoomServiceClient(
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );

    const rooms = await service.listRooms();

    const activeRooms = rooms.map(room => ({
      name: room.name,
      sid: room.sid,
      numParticipants: room.numParticipants,
      maxParticipants: room.maxParticipants,
      creationTime: room.creationTime
    }));

    return res.status(200).json({
      rooms: activeRooms
    });

  } catch (error) {

    console.error(
      "Erro ao listar salas LiveKit:",
      error
    );

    return res.status(500).json({
      error: "Erro ao consultar salas LiveKit",
      details: error.message
    });
  }
};
