import { Cache } from "./cache";
import { Hash } from "./hash";
import { TTS } from "./tts";

export class Player {
  private audio = new Audio();
  cache: Cache;
  tts: TTS;

  constructor(tts: TTS, cache: Cache) {
    this.cache = cache;
    this.tts = tts;
  }

  async play(source: string, text: string, playbackRate = 1) {
    const key = await Hash.sha256(`${source}:${text}`);

    const existAudioUrl = await this.cache.get(key);

    let audioUrl: string | null = null;

    if (existAudioUrl) {
      audioUrl = existAudioUrl;
    } else {
      audioUrl = await this.tts.tts(source, text);

      if (!audioUrl) {
        return;
      }

      await this.cache.add(key, audioUrl);
    }

    if (!audioUrl) {
      return;
    }

    this.audio.volume = 0;
    this.audio.src = `data:audio/wav;base64,${audioUrl}`;
    await this.audio.play();
    this.audio.volume = 1;

    // Speed
    this.audio.playbackRate = playbackRate;

    // Waiting for playback to finish
    await new Promise<void>((resolve) => {
      this.audio.addEventListener("ended", () => resolve(), { once: true });
    });
  }
}
