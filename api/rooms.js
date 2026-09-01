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

    console.log("VYBEE: consultando salas LiveKit");

    const service = new RoomServiceClient(
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );

    const rooms = await service.listRooms();

    console.log(
      `VYBEE: ${rooms.length} sala(s) encontrada(s)`
    );

    const activeRooms = rooms.map(room => ({
      name: String(room.name || ""),
      sid: String(room.sid || ""),
      numParticipants: Number(room.numParticipants || 0),
      maxParticipants: Number(room.maxParticipants || 0),

      // LiveKit pode retornar creationTime como BigInt.
      // String evita erro de serialização JSON.
      creationTime: String(room.creationTime || "0")
    }));

    return res.status(200).json({
      success: true,
      count: activeRooms.length,
      rooms: activeRooms
    });

  } catch (error) {

    console.error(
      "VYBEE: erro ao consultar salas LiveKit:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Erro ao consultar salas LiveKit",
      details: error?.message || String(error)
    });
  }
};
