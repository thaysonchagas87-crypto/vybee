/**
 * VYBEE — /api/voice-moderation.js
 *
 * Vercel env:
 * URL_LIVEKIT
 * LIVEKIT_API_KEY
 * LIVEKIT_API_SECRET
 * SUPABASE_URL
 * SUPABASE_SERVICE_ROLE_KEY
 */

const {
  RoomServiceClient
} = require("@livekit/server-sdk");

const {
  createClient
} = require("@supabase/supabase-js");

function reply(
  res,
  status,
  body
) {
  return res
    .status(status)
    .setHeader(
      "Content-Type",
      "application/json"
    )
    .json(body);
}

function bearer(req) {
  const header =
    req.headers?.authorization ||
    "";

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

module.exports = async (
  req,
  res
) => {
  if (
    req.method !==
    "POST"
  ) {
    return reply(
      res,
      405,
      {
        error:
          "Método não permitido."
      }
    );
  }

  try {
    const accessToken =
      bearer(req);

    if (!accessToken) {
      return reply(
        res,
        401,
        {
          error:
            "Sessão não encontrada."
        }
      );
    }

    const {
      URL_LIVEKIT,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    } = process.env;

    if (
      !URL_LIVEKIT ||
      !LIVEKIT_API_KEY ||
      !LIVEKIT_API_SECRET ||
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY
    ) {
      return reply(
        res,
        500,
        {
          error:
            "Configuração da moderação incompleta na Vercel."
        }
      );
    }

    const supabase =
      createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken:
              false,
            persistSession:
              false
          }
        }
      );

    const {
      data: authData,
      error: authError
    } =
      await supabase.auth
        .getUser(
          accessToken
        );

    if (
      authError ||
      !authData?.user
    ) {
      return reply(
        res,
        401,
        {
          error:
            "Sessão inválida ou expirada."
        }
      );
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
      return reply(
        res,
        400,
        {
          error:
            "Dados de moderação incompletos."
        }
      );
    }

    const {
      data: membership,
      error: membershipError
    } =
      await supabase
        .from(
          "community_members"
        )
        .select("role")
        .eq(
          "community_id",
          community_id
        )
        .eq(
          "user_id",
          authData.user.id
        )
        .maybeSingle();

    if (
      membershipError ||
      !membership
    ) {
      return reply(
        res,
        403,
        {
          error:
            "Você não participa desta comunidade."
        }
      );
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
      return reply(
        res,
        403,
        {
          error:
            "Ação permitida somente para equipe."
        }
      );
    }

    const livekit =
      new RoomServiceClient(
        String(
          URL_LIVEKIT
        ).replace(
          /\/+$/,
          ""
        ),
        LIVEKIT_API_KEY,
        LIVEKIT_API_SECRET
      );

    if (
      action ===
      "remove_participant"
    ) {
      await livekit
        .removeParticipant(
          room_name,
          target_identity
        );

      return reply(
        res,
        200,
        {
          ok: true,
          action
        }
      );
    }

    if (
      action ===
        "mute_microphone" ||
      action ===
        "stop_screen"
    ) {
      if (!track_sid) {
        return reply(
          res,
          400,
          {
            error:
              "Track SID não informado."
          }
        );
      }

      await livekit
        .mutePublishedTrack(
          room_name,
          target_identity,
          track_sid,
          true
        );

      return reply(
        res,
        200,
        {
          ok: true,
          action
        }
      );
    }

    return reply(
      res,
      400,
      {
        error:
          "Ação de moderação desconhecida."
      }
    );

  } catch (error) {
    console.error(
      "VYBEE voice moderation:",
      error
    );

    return reply(
      res,
      500,
      {
        error:
          error?.message ||
          "Erro interno na moderação."
      }
    );
  }
};
