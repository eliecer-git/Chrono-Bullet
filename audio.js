/**
 * CHRONO BULLET - SYNTHESIZED AUDIO ENGINE (Web Audio API)
 * All sound effects and ambient drones generated 100% procedurally.
 * No external .mp3 or .wav dependencies.
 */

class ChronoAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;
    this.isDronePlaying = false;
    this.initialized = false;
  }

  // Inicializa o resume el AudioContext con la primera interacción del usuario
  init() {
    if (this.initialized && this.ctx && this.ctx.state === 'running') return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.initialized = true;
    } catch (e) {
      console.warn("AudioContext no pudo iniciarse de inmediato:", e);
    }
  }

  // Generador de buffer de ruido blanco reutilizable
  createNoiseBuffer(duration = 0.5) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * 1. Disparo de pistola:
   * Punch de tono decreciente + ráfaga de ruido blanco con filtro paso-banda.
   */
  playPistol() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Oscilador de impacto (Punch)
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    oscGain.gain.setValueAtTime(0.6, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);

    // Ruido blanco filtrado (Disparo cinético)
    const noiseBuffer = this.createNoiseBuffer(0.18);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.frequency.exponentialRampToValueAtTime(600, t + 0.16);
      filter.Q.value = 1.8;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.18);
    }
  }

  /**
   * 2. Disparo de escopeta:
   * Grave de choque profundo + explosión sónica de ruido disperso.
   */
  playShotgun() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Golpe grave profundo (Sub-kick)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(220, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.28);

    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.28);

    // Explosión de ruido de alta dispersión
    const noiseBuffer = this.createNoiseBuffer(0.35);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.32);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.35);
    }
  }

  /**
   * 3. Cristal quebrándose (Enemigos eliminados):
   * Campanadas metálicas y armónicos agudos que representan esquirlas cayendo.
   */
  playCrystalShatter() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Polifonía de cristales (3 frecuencias agudas inarmónicas)
    const freqs = [1850, 2450, 3200, 4100];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() * 200 - 100), t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.35);

      const startGain = 0.25 / (idx + 1);
      gain.gain.setValueAtTime(startGain, t + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35 + idx * 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.02);
      osc.stop(t + 0.45);
    });

    // Pequeño crujido de impacto de cristal
    const noiseBuffer = this.createNoiseBuffer(0.12);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3500;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(t);
      noise.stop(t + 0.12);
    }
  }

  /**
   * 4. Lanzamiento de arma:
   * Whoosh de barrido por filtro resonante.
   */
  playThrow() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const noiseBuffer = this.createNoiseBuffer(0.25);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3.5;
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.1);
      filter.frequency.exponentialRampToValueAtTime(250, t + 0.22);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.25);
    }
  }

  /**
   * 5. Clic seco al intentar disparar sin balas:
   * Golpe de percutor mecánico metálico.
   */
  playEmptyClick() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.035);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * 6. Melodía de victoria en arpegio mayor:
   * C5 - E5 - G5 - C6 triunfal con envolvente brillante.
   */
  playVictory() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const noteTime = t + i * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.35, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + (i === 3 ? 0.7 : 0.28));

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(noteTime);
      osc.stop(noteTime + (i === 3 ? 0.75 : 0.3));
    });
  }

  /**
   * Efectos adicionales: Golpe cuerpo a cuerpo (Melee)
   */
  playMelee() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.14);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Recogida de arma (Metallic equip)
   */
  playPickup() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.07);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Disparo de Rifle de Asalto / SMG (Láser verde ultrarrápido)
   */
  playRifle() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);

    gain.gain.setValueAtTime(0.42, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.085);
  }

  /**
   * Disparo de Francotirador / Cañón de Riel (Railgun penetrante de alta potencia)
   */
  playSniper() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Onda sónica grave profunda
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(180, t);
    subOsc.frequency.exponentialRampToValueAtTime(25, t + 0.4);
    subGain.gain.setValueAtTime(0.85, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.4);

    // Chispazo eléctrico / railgun beam
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2800, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.22);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Disparo de Cañón de Plasma (Orbe de energía expansiva)
   */
  playPlasma() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Golpe sónico grave con modulación en frecuencia
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.32);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(160, t + 0.32);

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  /**
   * Carga de Cofre mientras se mantiene presionada la tecla E
   */
  playChestCharging(progress = 0.5) {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = 220 + progress * 550;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.linearRampToValueAtTime(baseFreq + 60, t + 0.06);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  /**
   * Apertura exitosa de Cofre (Fanfarria electrónica futurista)
   */
  playChestUnlock() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0.28, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.28);
    });
  }

  /**
   * Impacto de daño recibido por el Jugador
   */
  playPlayerHurt() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Impacto de daño en Enemigo (agrietamiento parcial antes de destruirse)
   */
  playEnemyHurt() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200 + Math.random() * 300, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Uso de Botiquín médico (Restauración de vida / Pulso vital)
   */
  playHeal() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.35, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.38);
    });
  }

  /**
   * Muerte del jugador (Glitch temporal / Ruptura de línea de tiempo)
   */
  playPlayerDeath() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(25, t + 0.6);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.65);
  }

  /**
   * 7. Zumbido grave continuo (Drone de dilatación temporal):
   * Se activa cuando el tiempo está ralentizado. Se modula dinámicamente según timeScale.
   */
  startDrone() {
    this.init();
    if (!this.ctx || this.isDronePlaying) return;

    try {
      const t = this.ctx.currentTime;
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneGain = this.ctx.createGain();

      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, t); // A1

      this.droneOsc2.type = 'sawtooth';
      this.droneOsc2.frequency.setValueAtTime(55.6, t); // Detuned for rich phasing

      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(180, t);
      this.droneFilter.Q.value = 3.0;

      this.droneGain.gain.setValueAtTime(0.001, t);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
      this.isDronePlaying = true;
    } catch (e) {
      console.warn("Error iniciando drone:", e);
    }
  }

  stopDrone() {
    if (!this.isDronePlaying) return;
    this.isDronePlaying = false;
    try {
      if (this.droneGain && this.ctx) {
        this.droneGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      }
      const osc1 = this.droneOsc1;
      const osc2 = this.droneOsc2;
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      setTimeout(() => {
        try {
          if (osc1) { osc1.stop(); osc1.disconnect(); }
          if (osc2) { osc2.stop(); osc2.disconnect(); }
        } catch (err) {}
      }, 70);
    } catch (e) {
      this.isDronePlaying = false;
    }
  }

  /**
   * Modula el drone en tiempo real según el factor de tiempo actual:
   * timeScale cercano a 0.04 (quieto) -> drone audible, profundo y misterioso.
   * timeScale cercano a 1.0 (moviéndose) -> drone se atenúa significativamente.
   */
  updateDrone(timeScale) {
    if (!this.ctx || !this.isDronePlaying || !this.droneGain || !this.droneFilter) return;
    try {
      const t = this.ctx.currentTime;
      // Invertir: tiempo lento = volumen más alto de drone
      const slowFactor = Math.max(0, Math.min(1, (1.0 - timeScale) / 0.96));
      const targetVolume = 0.05 + slowFactor * 0.22;
      const targetFreq = 120 + slowFactor * 100;

      this.droneGain.gain.setTargetAtTime(targetVolume, t, 0.08);
      this.droneFilter.frequency.setTargetAtTime(targetFreq, t, 0.08);
    } catch (e) {
      // Ignorar errores transitorios de audio
    }
  }

  /**
   * 15. Sonido de Monedas (Recolección / Victoria)
   * Timbre metálico brillante con doble armónico
   */
  playCoin() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [987.77, 1318.51]; // B5 -> E6 arpegio brillante
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);

        gain.gain.setValueAtTime(0.001, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.35, t + idx * 0.06 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.36);
      });
    } catch (e) {}
  }

  /**
   * 16. Sonido de Compra Exitosa en Tienda
   * Acorde cibernético de transacción digital
   */
  playBuy() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const chords = [523.25, 659.25, 783.99, 1046.50]; // Acorde C Mayor brillante
      chords.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);

        gain.gain.setValueAtTime(0.001, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.28, t + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.42);
      });
    } catch (e) {}
  }

  /**
   * 17. Sonido de Equipar Ítem / Skin
   * Clic mecánico táctico de cerrojo
   */
  playEquip() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }
}

// Instancia global
window.chronoAudio = new ChronoAudioEngine();

