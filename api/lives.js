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
        error: "LiveKit não configurado"
      });

    }

    const service = new RoomServiceClient(
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );

    const rooms =
      await service.listRooms();

    const lives = [];

    for (const room of rooms) {

      if (
        room.name.startsWith("vybee-live-")
      ) {

        const participants =
          await service.listParticipants(
            room.name
          );

        const creators =
          participants.filter(
            p =>
              p.identity.startsWith(
                "creator-"
              )
          );

        if (creators.length > 0) {

          lives.push({

            room: room.name,

            creator:
              creators[0].identity,

            participants:
              participants.length,

            createdAt:
              room.creationTime,

            status:
              "live"

          });

        }

      }

    }

    return res.status(200).json({
      lives
    });

  } catch (error) {

    console.error(
      "Erro ao buscar lives:",
      error
    );

    return res.status(500).json({
      error: "Erro ao buscar transmissões"
    });

  }

};
