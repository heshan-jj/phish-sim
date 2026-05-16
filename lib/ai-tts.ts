/**
 * MiniMax text-to-speech integration (optional).
 * Set MINIMAX_TTS_API_URL and MINIMAX_API_KEY to enable audio playback for vishing.
 */

const TTS_URL =
  process.env.MINIMAX_TTS_API_URL ??
  "https://api.minimaxi.chat/v1/t2a_v2";

export interface TtsResult {
  audioUrl?: string;
  audioBase64?: string;
}

export async function synthesizeVoiceScript(
  text: string,
  voiceId = "English_expressive_narrator",
): Promise<TtsResult | null> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey || process.env.MINIMAX_TTS_ENABLED !== "true") {
    return null;
  }

  try {
    const response = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "speech-02-turbo",
        text: text.slice(0, 5000),
        voice_setting: { voice_id: voiceId },
        audio_setting: { format: "mp3" },
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      data?: { audio?: string };
    };
    const audioBase64 = data.data?.audio;
    if (!audioBase64) return null;

    return { audioBase64 };
  } catch {
    return null;
  }
}
