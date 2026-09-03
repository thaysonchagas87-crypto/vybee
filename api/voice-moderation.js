/**
 * VYBEE — /api/voice-moderation.js
 *
 * Coloque este arquivo em:
 * /api/voice-moderation.js
 *
 * Variáveis de ambiente esperadas na Vercel:
 * LIVEKIT_URL
 * LIVEKIT_API_KEY
 * LIVEKIT_API_SECRET
 * SUPABASE_URL
 * SUPABASE_SERVICE_ROLE_KEY
 *
 * Dependências:
 * @livekit/server-sdk
 * @supabase/supabase-js
 *
 * ATENÇÃO:
 * SUPABASE_SERVICE_ROLE_KEY e LIVEKIT_API_SECRET são SEGREDOS.
 * Nunca coloque essas chaves no index.html ou no navegador.
 */

const {
  RoomServiceClient
} = require("@livekit/server-sdk");

const {
  createClient
} = require("@supabase/supabase-js");

function json(res, status, body) {
  return res
    .status(status)
    .setHeader("Content-Type", "application/json")
    .json(body);
}

function getBearer(req) {
  const header =
    req.headers?.authorization || "";

  if (
    !header
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    return null;
  }

  return header
    .slice(7)
    .trim();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Método não permitido."
    });
  }

  try {
    const accessToken =
      getBearer(req);

    if (!accessToken) {
      return json(res, 401, {
        error: "Sessão não encontrada."
      });
    }

    const {
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    } = process.env;

    if (
      !LIVEKIT_URL ||
      !LIVEKIT_API_KEY ||
      !LIVEKIT_API_SECRET ||
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      return json(res, 500, {
        error:
          "Variáveis de ambiente da moderação não configuradas."
      });
    }

    const supabase =
      createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

    const {
      data: userData,
      error: userError
    } =
      await supabase.auth.getUser(
        accessToken
      );

    if (
      userError ||
      !userData?.user
    ) {
      return json(res, 401, {
        error:
          "Sessão inválida ou expirada."
      });
    }

    const {
      action,
      community_id,
      room_name,
      target_identity,
      track_sid
    } = req.body || {};

    if (
      !action ||
      !community_id ||
      !room_name ||
      !target_identity
    ) {
      return json(res, 400, {
        error:
          "Dados de moderação incompletos."
      });
    }

    const {
      data: membership,
      error: membershipError
    } =
      await supabase
        .from("community_members")
        .select("role")
        .eq(
          "community_id",
          community_id
        )
        .eq(
          "user_id",
          userData.user.id
        )
        .maybeSingle();

    if (
      membershipError ||
      !membership
    ) {
      return json(res, 403, {
        error:
          "Você não possui acesso de moderação nesta comunidade."
      });
    }

    const role =
      String(
        membership.role || ""
      ).toLowerCase();

    if (
      ![
        "owner",
        "admin",
        "moderator"
      ].includes(role)
    ) {
      return json(res, 403, {
        error:
          "Ação permitida somente para equipe da comunidade."
      });
    }

    const livekitHost =
      String(
        LIVEKIT_URL
      ).replace(/\/+$/, "");

    const roomService =
      new RoomServiceClient(
        livekitHost,
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET
      );

    if (
      action ===
      "remove_participant"
    ) {
      await roomService
        .removeParticipant(
          room_name,
          target_identity
        );

      return json(res, 200, {
        ok: true,
        action
      });
    }

    if (
      action ===
        "mute_microphone" ||
      action ===
        "stop_screen"
    ) {
      if (!track_sid) {
        return json(res, 400, {
          error:
            "Track da publicação não informado."
        });
      }

      await roomService
        .mutePublishedTrack(
          room_name,
          target_identity,
          track_sid,
          true
        );

      return json(res, 200, {
        ok: true,
        action
      });
    }

    return json(res, 400, {
      error:
        "Ação de moderação desconhecida."
    });

  } catch (error) {
    console.error(
      "VYBEE moderation:",
      error
    );

    return json(res, 500, {
      error:
        error?.message ||
        "Erro interno na moderação."
    });
  }
};
