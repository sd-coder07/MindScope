'use client';

import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import { AnimatePresence, motion, useMotionValueEvent, useSpring, useTransform } from 'framer-motion';
import { Activity, Camera, Play, Square } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

/* ---------- Local helper type: do NOT augment lib.dom ---------- */
type VideoFrameRequestCallbackLike = (now: number, metadata: any) => void;
type RVFCVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: VideoFrameRequestCallback | VideoFrameRequestCallbackLike) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

/* ---------- Types ---------- */
interface EmotionData { emotion: string; value: number; color: string; barColor: string; }
interface PersonProfile { id: string; emotionHistory: any[]; lastCalibration: Date; }
interface EmotionAnalysisWidgetProps {
  onEmotionDetected?: (profile: PersonProfile) => void;
  onQuestionTriggered?: (questions: string[]) => void;
}

/* ---------- Model paths ---------- */
const MODEL_URL  = '/models/emotion_model/model.json';
const LABELS_URL = '/models/emotion_model/labels.json';

/* ---------- Label mapping ---------- */
const MODEL_TO_UI: Record<string,'happiness'|'sadness'|'anger'|'fear'|'surprise'|'disgust'|'neutral'> = {
  angry: 'anger',
  disgust: 'disgust',
  fear: 'fear',
  happy: 'happiness',
  sad: 'sadness',
  surprise: 'surprise',
  neutral: 'neutral',
};

const UI_ORDER: Array<'happiness'|'sadness'|'anger'|'fear'|'surprise'|'disgust'|'neutral'> =
  ['happiness','sadness','anger','fear','surprise','disgust','neutral'];

const EMOTION_COLORS: Record<string,{color:string;barColor:string}> = {
  happiness: { color:'#FFD700', barColor:'#FFA500' },
  sadness:   { color:'#4A90E2', barColor:'#6BB6FF' },
  anger:     { color:'#FF6B6B', barColor:'#FF9999' },
  fear:      { color:'#9B59B6', barColor:'#C39BD3' },
  surprise:  { color:'#F39C12', barColor:'#F7DC6F' },
  disgust:   { color:'#27AE60', barColor:'#58D68D' },
  neutral:   { color:'#95A5A6', barColor:'#BDC3C7' },
};

/* ---------- Tunables ---------- */
const IMG = 224;
const EMA_ALPHA = 0.35;
const BOX_MARGIN = 0.35;
const TARGET_FPS = 30;

/* Throttles (adaptive) */
const UI_UPDATE_HZ = 10;
const UI_UPDATE_MS = Math.round(1000 / UI_UPDATE_HZ);
const INFER_HZ_FAST = 18;
const INFER_HZ_SLOW = 10;
const EPS = 1e-9;

/* Calibration */
const CALIBRATION_MS = 3500;
const CALIBRATION_BETA = 0.35;
const CALIBRATION_MAX_FRACTION = 0.50;
const CALIBRATION_MIN_QUALITY = 70;

/* Temperature softening */
const TEMP = 1.25;

/* UI-only gains */
const CLASS_GAIN: Record<string, number> = {
  happiness: 1.08,
  sadness:   1.06,
  anger:     1.00,
  fear:      1.00,
  surprise:  1.00,
  disgust:   1.00,
  neutral:   1.00,
};

/* ---------- TFJS engine ---------- */
class TfjsEmotionEngine {
  private clf: tf.GraphModel | null = null;
  private layers: tf.LayersModel | null = null;
  private labels: string[] = [];
  private faceModel: blazeface.BlazeFaceModel | null = null;
  private workCanvas: HTMLCanvasElement | null = null;
  private ema: Float32Array | null = null;

  private inName: string | null = null;
  private outName: string | null = null;
  private expectsUnitRange = false; // your SavedModel does preprocessing internally

  async initialize() {
    for (const b of ['webgl','cpu'] as const) {
      try { await tf.setBackend(b); await tf.ready(); console.log(`[TFJS] backend: ${b}`); break; }
      catch (e) { console.warn('Backend fail', b, e); }
    }
    const [labels, face] = await Promise.all([
      fetch(LABELS_URL).then(r => r.json()),
      blazeface.load({ maxFaces: 1 })
    ]);
    this.labels = labels as string[];
    this.faceModel = face;

    try {
      this.clf = await tf.loadGraphModel(MODEL_URL);
      this.autodetectIONamesFromSignature();
      await this.warmup();
    } catch (e1) {
      console.warn('GraphModel load failed; trying LayersModel…', e1);
      this.clf = null;
      this.layers = await tf.loadLayersModel(MODEL_URL);
      await this.warmup();
    }
  }

  attachWorkCanvas(node: HTMLCanvasElement) {
    this.workCanvas = node;
    this.workCanvas.width = IMG;
    this.workCanvas.height = IMG;
  }

  private autodetectIONamesFromSignature() {
    if (!this.clf) return;
    const anyM = this.clf as any;
    const sig = anyM?.executor?.graph?.signature;
    if (sig) {
      const firstIn  = Object.values(sig.inputs  ?? {})[0] as any;
      const firstOut = Object.values(sig.outputs ?? {})[0] as any;
      this.inName  = (firstIn?.name  || '').replace(/^serving_default_/, '').replace(/:0$/, '') || null;
      this.outName = (firstOut?.name || '').replace(/:0$/, '') || null;
    }
    this.inName  = this.inName  ?? 'keras_tensor_5';
    this.outName = this.outName ?? 'Identity:0';
  }

  private async warmup() {
    const z = tf.zeros<tf.Rank.R4>([1, IMG, IMG, 3], 'float32');
    if (this.clf) {
      const y = await this.executeGraph(z); y.dispose();
    } else if (this.layers) {
      const y = this.layers.predict(z) as tf.Tensor; await y.data(); y.dispose();
    }
    z.dispose();
  }

  private async executeGraph(input: tf.Tensor) {
    if (!this.clf) throw new Error('Graph model not loaded');
    const IN  = this.inName!;
    const OUT = this.outName!;
    try {
      return await this.clf.executeAsync({ [IN]: input }, OUT) as tf.Tensor;
    } catch {
      const inAlt  = IN.endsWith(':0') ? IN : `${IN}:0`;
      const outAlt = OUT.endsWith(':0') ? OUT : `${OUT}:0`;
      return await this.clf.executeAsync({ [inAlt]: input }, outAlt) as tf.Tensor;
    }
  }

  async detectAndClassify(video: HTMLVideoElement) {
    if (!(this.clf || this.layers) || !this.faceModel || !this.workCanvas) {
      return { scores: this.emptyScores(), conf: 0, faceQuality: 0, box: null as any, angle: 0 };
    }
    if (!video.videoWidth || !video.videoHeight || video.readyState < 2) {
      return { scores: this.emptyScores(), conf: 0, faceQuality: 0, box: null as any, angle: 0 };
    }

    // ---- Face detect
    let faces;
    try { faces = await this.faceModel.estimateFaces(video, false); }
    catch (e) { console.error('Face detection failed:', e); return { scores: this.emptyScores(), conf: 0, faceQuality: 0, box: null as any, angle: 0 }; }

    if (!faces.length) {
      this.ema = this.ema ?? new Float32Array(this.labels.length).fill(0);
      for (let i=0;i<this.ema.length;i++) this.ema[i] *= (1-EMA_ALPHA);
      return { scores: this.mapToUi(this.ema), conf: 0, faceQuality: 0, box: null as any, angle: 0 };
    }

    // Largest face
    const face = faces.reduce((a:any,b:any)=>{
      const areaA=(a.bottomRight[0]-a.topLeft[0])*(a.bottomRight[1]-a.topLeft[1]);
      const areaB=(b.bottomRight[0]-b.topLeft[0])*(b.bottomRight[1]-b.topLeft[1]);
      return areaB>areaA?b:a;
    });

    // Align & crop; bias downwards to include mouth
    const [re, le] = face.landmarks as [number,number][];
    const angle = Math.atan2(re[1]-le[1], re[0]-le[0]);
    const [x1,y1] = face.topLeft as [number,number];
    const [x2,y2] = face.bottomRight as [number,number];
    const w = Math.max(1, x2-x1), h = Math.max(1, y2-y1);
    const cx = x1 + w/2;
    const cy = y1 + h/2 + 0.06 * h; // +6% down to include mouth
    const side = Math.max(w,h) * (1 + BOX_MARGIN);
    const sx = Math.max(0, Math.min(video.videoWidth  - 1, cx - side/2));
    const sy = Math.max(0, Math.min(video.videoHeight - 1, cy - side/2));
    const s  = Math.max(1, Math.min(side, video.videoWidth - sx, video.videoHeight - sy));

    // Draw into 224×224; subtle enhancement
    const ctx = this.workCanvas.getContext('2d')!;
    ctx.save();
    ctx.clearRect(0,0,IMG,IMG);
    ctx.translate(IMG/2, IMG/2);
    ctx.rotate(-angle);
    const detConf = Array.isArray(face.probability) ? (face.probability[0] ?? 0.9)
                  : (typeof face.probability === 'number' ? face.probability : 0.9);
    if (detConf > 0.7) (ctx as any).filter = 'contrast(1.08) brightness(1.05)';
    ctx.drawImage(video, sx, sy, s, s, -IMG/2, -IMG/2, IMG, IMG);
    (ctx as any).filter = 'none';
    ctx.restore();

    // ---- Inference (stay 0..255; model preprocesses internally)
    let probs: Float32Array | undefined;
    let out: tf.Tensor | undefined;
    let input: tf.Tensor | undefined;
    const t0 = performance.now();
    try {
      input = tf.tidy(() => {
        let t = tf.browser.fromPixels(this.workCanvas!).toFloat().expandDims(0); // [1,224,224,3]
        if (this.expectsUnitRange) t = (t as tf.Tensor).div(255);
        return t as tf.Tensor;
      });
      out = this.clf ? await this.executeGraph(input) : (this.layers!.predict(input) as tf.Tensor);
      probs = (await out.data()) as Float32Array;
    } catch (e) {
      console.error('Inference error:', e);
      return { scores: this.emptyScores(), conf: 0, faceQuality: 0, box: null as any, angle: 0, inferMs: 0 };
    } finally {
      input?.dispose(); out?.dispose();
    }
    const inferMs = performance.now() - t0;

    if (!probs || probs.length !== this.labels.length) {
      console.warn('Unexpected output length:', probs?.length);
      return { scores: this.emptyScores(), conf: 0, faceQuality: 0, box: null as any, angle: 0, inferMs };
    }

    // Temperature soften
    const temped = new Float32Array(probs.length);
    let z = 0;
    for (let i=0;i<probs.length;i++){ const t = Math.pow(Math.max(probs[i], 1e-8), 1/TEMP); temped[i]=t; z+=t; }
    for (let i=0;i<temped.length;i++) temped[i] /= z;

    // EMA smoothing
    if (!this.ema) this.ema = new Float32Array(temped.length).fill(0);
    for (let i=0;i<temped.length;i++) this.ema[i] = this.ema[i]*(1-EMA_ALPHA) + temped[i]*EMA_ALPHA;

    // Confidence
    let maxP = 0; for (let i=0;i<this.ema.length;i++) if (this.ema[i]>maxP) maxP=this.ema[i];

    const faceQuality = Math.round(Math.max(0, Math.min(1, detConf))*100);

    return {
      scores: this.mapToUi(this.ema),
      conf: maxP,
      faceQuality,
      box: { x: x1, y: y1, w, h },
      angle,
      inferMs
    };
  }

  private emptyScores() {
    return { happiness:0,sadness:0,anger:0,fear:0,surprise:0,disgust:0,neutral:1 };
  }
  private mapToUi(vec: Float32Array|number[]) {
    const ui: Record<string, number> = { happiness:0,sadness:0,anger:0,fear:0,surprise:0,disgust:0,neutral:0 };
    for (let i=0;i<this.labels.length;i++) {
      const uiKey = MODEL_TO_UI[this.labels[i]];
      if (uiKey) ui[uiKey] = (vec as any)[i] ?? 0;
    }
    return ui;
  }
}

/* ---------- UI piece ---------- */
const EmotionBar: React.FC<{ label: string; value: number; barColor: string; textColor: string; }> = ({ label, value, barColor, textColor }) => {
  const target = Math.max(0, Math.min(100, Math.round(value * 100)));
  const progress = useSpring(target, { stiffness: 220, damping: 28, mass: 0.6 });
  const [pct, setPct] = useState(target);
  useEffect(() => { progress.set(target); }, [target]);
  useMotionValueEvent(progress, 'change', (v: number) => setPct(Math.round(v)));
  const scaleX = useTransform(progress, (v: number) => v / 100);

  return (
    <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="mb-1">
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full origin-left" style={{ backgroundColor: barColor, scaleX }} />
        </div>
      </div>
      <div className="text-xs text-gray-300 mb-1 leading-tight">{label}</div>
      <div className="text-sm font-bold" style={{ color: textColor }}>{pct}%</div>
    </motion.div>
  );
};

/* ---------- Main component ---------- */
const EmotionAnalysisWidget: React.FC<EmotionAnalysisWidgetProps> = ({ onEmotionDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const workCropRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TfjsEmotionEngine | null>(null);

  const rafRef = useRef<number>();
  const rvfcIdRef = useRef<number | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [faceQuality, setFaceQuality] = useState(0);
  const [currentDominantEmotion, setCurrentDominantEmotion] = useState('neutral');
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelLoadError, setModelLoadError] = useState<string|null>(null);
  const [cameraStatus, setCameraStatus] = useState<'disconnected'|'connecting'|'connected'|'error'>('disconnected');
  const [analysisMetrics, setAnalysisMetrics] = useState({ totalFramesAnalyzed: 0, averageConfidence: 0 });

  // Calibration
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const baselineRef = useRef<Record<string, number> | null>(null);
  const baselineSumRef = useRef<Record<string, number>>({happiness:0,sadness:0,anger:0,fear:0,surprise:0,disgust:0,neutral:0});
  const baselineCountRef = useRef(0);
  const calibrationStartRef = useRef(0);

  // Throttles
  const lastUiUpdateRef = useRef(0);
  const lastInferRef = useRef(0);
  const targetInferMsRef = useRef<number>(Math.round(1000 / INFER_HZ_FAST));
  const inferAvgMsRef = useRef<number>(0);

  const lastResultsRef = useRef<{
    scores: Record<string, number>, conf: number, faceQuality: number, box: any, angle: number
  }>({ scores:{happiness:0,sadness:0,anger:0,fear:0,surprise:0,disgust:0,neutral:1}, conf:0, faceQuality:0, box:null, angle:0 });

  /* Load engine once */
  useEffect(() => {
    (async () => {
      setIsModelLoading(true);
      try {
        const engine = new TfjsEmotionEngine();
        await engine.initialize();
        engineRef.current = engine;
        if (workCropRef.current) engine.attachWorkCanvas(workCropRef.current);
      } catch (e:any) {
        console.error(e);
        setModelLoadError(e?.message ?? String(e));
      } finally {
        setIsModelLoading(false);
      }
    })();
  }, []);

  /* If ref attaches later */
  useEffect(() => {
    if (engineRef.current && workCropRef.current) engineRef.current.attachWorkCanvas(workCropRef.current);
  }, [workCropRef.current]);

  const stopLoops = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = undefined;
    const v = videoRef.current as RVFCVideo | null;
    if (v && rvfcIdRef.current != null && v.cancelVideoFrameCallback) {
      v.cancelVideoFrameCallback(rvfcIdRef.current);
    }
    rvfcIdRef.current = null;
  }, []);

  const stopCamera = useCallback(async () => {
    stopLoops();
    const v = videoRef.current;
    try { v?.pause(); } catch {}
    if (v?.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      v.srcObject = null;
    }
    await tf.nextFrame();
  }, [stopLoops]);

  const initializeCamera = useCallback(async () => {
    setCameraStatus('connecting');
    try {
      await stopCamera();
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API not supported');

      const prefs: MediaStreamConstraints[] = [
        { video: { width:{ideal:640}, height:{ideal:480}, frameRate:{ideal:TARGET_FPS}, facingMode:'user' } },
        { video: { width:320, height:240 } },
        { video: true }
      ];
      let stream: MediaStream | null = null;
      for (const cfg of prefs) {
        try { stream = await navigator.mediaDevices.getUserMedia(cfg); if (stream) break; } catch {}
      }
      if (!stream) throw new Error('All camera configurations failed');

      const video = videoRef.current!;
      video.srcObject = stream;

      await new Promise<void>((resolve, reject) => {
        const ok = () => { clean(); video.play().then(()=>resolve()).catch(()=>resolve()); };
        const err = () => { clean(); reject(new Error('Video error')); };
        const clean = () => { video.removeEventListener('canplay', ok); video.removeEventListener('error', err); };
        video.addEventListener('canplay', ok);
        video.addEventListener('error', err);
        setTimeout(() => { if (video.readyState >= 2) ok(); }, 800);
      });

      setCameraStatus('connected');
      return true;
    } catch (e:any) {
      console.error(e);
      setCameraStatus('error');
      setModelLoadError(`Camera: ${e?.message ?? 'Unknown error'}`);
      return false;
    }
  }, [stopCamera]);

  /* Overlay: face guide + live box + hints */
  const drawOverlay = useCallback((box: any, angle: number) => {
    const ov = overlayRef.current, v = videoRef.current;
    if (!ov || !v || !v.videoWidth || !v.videoHeight) return;
    if (ov.width !== v.videoWidth || ov.height !== v.videoHeight) {
      ov.width = v.videoWidth; ov.height = v.videoHeight;
    }
    const ctx = ov.getContext('2d')!;
    ctx.clearRect(0,0,ov.width,ov.height);

    // center ellipse guide for user placement
    const cx = ov.width/2, cy = ov.height/2;
    const rx = Math.min(ov.width, ov.height) * 0.23;
    const ry = rx * 1.25;
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 255, 120, 0.35)';
    ctx.setLineDash([6,6]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // live face box (if any)
    if (box) {
      const { x, y, w, h } = box;
      const fitX = Math.abs(x + w/2 - cx) / rx;
      const fitY = Math.abs(y + h/2 - cy) / ry;
      const sizeRatio = Math.min(w / (rx*2), h / (ry*2));
      const aligned = fitX < 0.8 && fitY < 0.8 && sizeRatio > 0.75 && sizeRatio < 1.35 && Math.abs(angle) < 0.2;

      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = aligned ? 'rgba(0,255,120,0.9)' : 'rgba(255,200,0,0.9)';
      ctx.strokeRect(x, y, w, h);
      ctx.restore();

      // hint
      let hint = '';
      if (sizeRatio <= 0.75) hint = 'Move closer';
      else if (sizeRatio >= 1.35) hint = 'Move back a bit';
      else if (Math.abs(angle) >= 0.2) hint = 'Hold your head level';
      else if (fitX >= 0.8 || fitY >= 0.8) hint = 'Center your face';
      if (hint) {
        ctx.save();
        ctx.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto';
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        const textW = ctx.measureText(hint).width + 12;
        ctx.fillRect(x, Math.max(0, y - 26), textW, 22);
        ctx.fillStyle = '#fff';
        ctx.fillText(hint, x + 6, Math.max(14, y - 10));
        ctx.restore();
      }
    }
  }, []);

  /* Main analyze loop */
  const analyzeLoop = useCallback(() => {
    if (!isActive) return;
    const video = videoRef.current as RVFCVideo;
    const engine = engineRef.current!;

    const scheduleNext = () => {
      if (typeof video.requestVideoFrameCallback === 'function') {
        rvfcIdRef.current = video.requestVideoFrameCallback(() => step());
      } else {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    const step = async () => {
      try {
        if (!video.videoWidth || !video.videoHeight || video.readyState < 2) {
          scheduleNext(); return;
        }

        // Inference throttle (adaptive)
        const now = performance.now();
        if (now - lastInferRef.current >= targetInferMsRef.current) {
          const res: any = await engine.detectAndClassify(video);
          lastInferRef.current = now;
          lastResultsRef.current = res;

          // adapt cadence
          const ms = Math.max(1, res.inferMs ?? targetInferMsRef.current);
          const alpha = 0.2;
          const prev = inferAvgMsRef.current || ms;
          inferAvgMsRef.current = prev*(1-alpha) + ms*alpha;
          if (inferAvgMsRef.current > 90) {
            targetInferMsRef.current = Math.round(1000 / INFER_HZ_SLOW);
          } else if (inferAvgMsRef.current < 55) {
            targetInferMsRef.current = Math.round(1000 / INFER_HZ_FAST);
          }
        }

        const { scores, conf, faceQuality, box, angle } = lastResultsRef.current;

        // Calibration collection
        if (isCalibrating) {
          if (faceQuality >= CALIBRATION_MIN_QUALITY) {
            for (const k of UI_ORDER) baselineSumRef.current[k] += (scores as any)[k] ?? 0;
            baselineCountRef.current += 1;
          }
          const elapsed = performance.now() - calibrationStartRef.current;
          setCalibrationProgress(Math.min(1, elapsed / CALIBRATION_MS));
          if (elapsed >= CALIBRATION_MS && baselineCountRef.current >= 10) {
            const avg: Record<string, number> = {happiness:0,sadness:0,anger:0,fear:0,surprise:0,disgust:0,neutral:0};
            for (const k of UI_ORDER) avg[k] = baselineSumRef.current[k] / Math.max(1, baselineCountRef.current);
            baselineRef.current = avg;
            setIsCalibrating(false);
          }
        }

        // Apply calibration gently (only when quality is OK)
        let adjScores: Record<string, number> = { ...scores } as any;
        if (baselineRef.current && faceQuality >= CALIBRATION_MIN_QUALITY) {
          const out: Record<string, number> = {happiness:0,sadness:0,anger:0,fear:0,surprise:0,disgust:0,neutral:0};
          let sum = 0;
          for (const k of UI_ORDER) {
            const base = baselineRef.current[k] || 0;
            const sub  = Math.min(CALIBRATION_BETA * base, CALIBRATION_MAX_FRACTION * ((scores as any)[k] || 0));
            const v    = Math.max(0, (scores as any)[k] - sub);
            out[k] = v; sum += v;
          }
          if (sum > EPS) for (const k of UI_ORDER) out[k] /= sum;
          adjScores = out;
        }

        // Visual-only gain
        {
          const out: Record<string, number> = {} as any;
          let sum = 0;
          for (const k of UI_ORDER) { const v = (adjScores as any)[k] * (CLASS_GAIN[k] || 1); out[k] = v; sum += v; }
          if (sum > EPS) for (const k of UI_ORDER) out[k] /= sum;
          adjScores = out;
        }

        // UI throttle
        const nowUi = performance.now();
        if (nowUi - lastUiUpdateRef.current >= UI_UPDATE_MS) {
          lastUiUpdateRef.current = nowUi;

          drawOverlay(box, angle);

          const data: EmotionData[] = UI_ORDER.map(k => ({
            emotion: k[0].toUpperCase() + k.slice(1),
            value: adjScores[k] ?? 0,
            color: EMOTION_COLORS[k].color,
            barColor: EMOTION_COLORS[k].barColor
          }));
          setEmotionData(data);

          const dom = data.reduce((m, cur) => (cur.value > m.value ? cur : m));
          setCurrentDominantEmotion(dom.emotion.toLowerCase());

          const maxAdj = Math.max(...UI_ORDER.map(k => adjScores[k] ?? 0));
          setConfidence(maxAdj);
          setFaceQuality(faceQuality);

          setAnalysisMetrics(prev => {
            const n = prev.totalFramesAnalyzed + 1;
            const avg = (prev.averageConfidence * prev.totalFramesAnalyzed + maxAdj) / n;
            return { totalFramesAnalyzed: n, averageConfidence: avg };
          });

          if (onEmotionDetected && maxAdj > 0.7 && !isCalibrating) {
            onEmotionDetected({
              id: 'current_user',
              emotionHistory: [{ scores: adjScores, conf: maxAdj, ts: Date.now() }],
              lastCalibration: new Date()
            });
          }
        }
      } catch (e) {
        console.error('analysis error', e);
      } finally {
        scheduleNext();
      }
    };

    scheduleNext();
  }, [isActive, onEmotionDetected, isCalibrating, drawOverlay]);

  useEffect(() => {
    if (!isActive) return;
    analyzeLoop();
    return stopLoops;
  }, [isActive, analyzeLoop, stopLoops]);

  const toggleAnalysis = useCallback(async () => {
    if (!isActive) {
      setModelLoadError(null);
      setIsModelLoading(true);
      const ok = await initializeCamera();
      setIsModelLoading(false);
      if (ok && engineRef.current) {
        // reset calibration
        baselineRef.current = null;
        baselineCountRef.current = 0;
        baselineSumRef.current = {happiness:0,sadness:0,anger:0,fear:0,surprise:0,disgust:0,neutral:0};
        calibrationStartRef.current = performance.now();
        setCalibrationProgress(0);
        setIsCalibrating(true);
        lastUiUpdateRef.current = 0;
        lastInferRef.current = 0;
        targetInferMsRef.current = Math.round(1000 / INFER_HZ_FAST);
        inferAvgMsRef.current = 0;
        setIsActive(true);
      }
    } else {
      setIsActive(false);
      setIsCalibrating(false);
      setCameraStatus('disconnected');
      await stopCamera();
    }
  }, [isActive, initializeCamera, stopCamera]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* hidden 224×224 crop canvas (what the model sees) */}
      <canvas ref={workCropRef} className="hidden" width={IMG} height={IMG} />

      {/* Video + overlay */}
      <div className="absolute inset-0">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
        <canvas ref={overlayRef} className="absolute inset-0 pointer-events-none" />
      </div>

      {/* Camera status badge - moved to avoid overlap */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 z-10">
        <div className={`w-3 h-3 rounded-full ${
          cameraStatus === 'connected' ? 'bg-green-400 animate-pulse' :
          cameraStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
          cameraStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
        }`} />
        <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
          {cameraStatus.toUpperCase()}
        </span>
      </div>

      {/* Control panel - Simplified */}
      <motion.div
        className="absolute top-6 left-6 bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-blue-500/30 z-10 w-56"
        initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
      >
        <button
          onClick={toggleAnalysis}
          disabled={isModelLoading}
          className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm
            ${isActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isModelLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Loading AI…</span>
            </div>
          ) : isActive ? (
            <div className="flex items-center justify-center space-x-2">
              <Square size={14} /><span>STOP ANALYSIS</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Play size={14} /><span>START ANALYSIS</span>
            </div>
          )}
        </button>

        {modelLoadError && (
          <motion.div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-red-300 text-xs mb-1">{modelLoadError}</p>
            <button
              onClick={toggleAnalysis}
              className="w-full px-2 py-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 text-xs rounded transition-colors"
            >
              🔄 Retry
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Metrics - Moved to far right corner */}
      <motion.div
        className="absolute top-4 right-4 bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-green-500/30 z-10 w-52"
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
      >
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="text-green-400" size={16} />
          <h4 className="text-white font-semibold text-sm">Live Metrics</h4>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Confidence:</span>
            <span className={`font-bold ${confidence > 0.8 ? 'text-green-400' : confidence > 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>
              {(confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Face Quality:</span>
            <span className={`font-bold ${faceQuality > 80 ? 'text-green-400' : faceQuality > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {faceQuality}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Frames:</span>
            <span className="text-blue-400 font-bold">{analysisMetrics.totalFramesAnalyzed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Dominant:</span>
            <span className="text-purple-400 font-bold capitalize text-xs">{currentDominantEmotion}</span>
          </div>
        </div>
      </motion.div>

      {/* Emotion Probabilities - Moved further down */}
      <AnimatePresence>
        {isActive && emotionData.length > 0 && (
          <motion.div
            className="absolute bottom-2 left-6 right-6 bg-black/80 backdrop-blur-lg rounded-2xl p-4 border border-purple-500/30 z-10"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Camera className="text-purple-400" size={20} />
              <h3 className="text-white font-bold">Emotion Probabilities</h3>
            </div>

            <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
              {emotionData.map((e, idx) => (
                <EmotionBar
                  key={idx}
                  label={e.emotion}
                  value={e.value}
                  barColor={e.barColor}
                  textColor={EMOTION_COLORS[e.emotion.toLowerCase()].color}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {isModelLoading && (
        <motion.div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-center">
            <motion.div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            <h3 className="text-white text-xl font-bold mb-2">Loading model…</h3>
            <p className="text-gray-300">Warming up TensorFlow.js</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EmotionAnalysisWidget;