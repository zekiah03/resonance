// Digital Twin ↔ Resonance Binding
// Takes a digital twin axis/emotion profile and resolves it to Resonance pattern context.
// Theory: see DIGITAL_TWIN_THEORY.md §5

// Emotion → Resonance pattern mapping (Layer 3 → Layer 4)
const EMOTION_TO_PATTERN = {
  joy:         { id: 'laughter',       trajectoryType: 'I',    label: '笑い' },
  excitement:  { id: 'nori',           trajectoryType: 'VII',  label: 'ノリの良さ' },
  pride:       { id: 'catharsis',      trajectoryType: 'IV',   label: 'カタルシス' },
  flow:        { id: 'conv_pleasure',  trajectoryType: 'VII',  label: '会話の気持ちよさ' },
  curiosity:   { id: 'fukusen',        trajectoryType: 'II',   label: '伏線回収の快感' },
  gratitude:   { id: 'kandou',         trajectoryType: 'IV',   label: '感動' },
  awe:         { id: 'odoroki',        trajectoryType: 'III',  label: '驚き' },
  contentment: { id: 'yoi_anshin',     trajectoryType: 'VIII', label: '予想通りの安心感' },
  nostalgia:   { id: 'nakeru',         trajectoryType: 'IV',   label: '泣けるドラマ' },
  loneliness:  { id: 'kimazui',        trajectoryType: 'V',    label: '気まずさ' },
  boredom:     { id: 'taikutsu',       trajectoryType: 'VIII', label: '退屈' },
  sadness:     { id: 'nakeru',         trajectoryType: 'IV',   label: '泣けるドラマ' },
  anxiety:     { id: 'suspense',       trajectoryType: 'V',    label: 'サスペンス' },
  fear:        { id: 'kowai_chinmoku', trajectoryType: 'V',    label: '怖い沈黙' },
  anger:       { id: 'catharsis',      trajectoryType: 'IV',   label: 'カタルシス' },
};

// Resonance S/E/C/B/dS components ↔ twin axes (Layer 4 ↔ Layer 2)
// See DIGITAL_TWIN_THEORY.md §7.5
const COMPONENT_FROM_AXES = {
  S:  (ax) => (10 - ax.D) * 0.5 + ax.F * 0.5,      // 不確実性
  E:  (ax) => ax.A * 0.5 + ax.C * 0.5,              // 予測誤差
  C:  (ax) => ax.J * 0.5 + ax.K * 0.5,              // 収束・統合
  B:  (ax) => ax.E * 0.5 + (10 - ax.F) * 0.5,       // 安心感
  dS: (ax) => ax.D * 0.5 + ax.B * 0.5,              // 変化速度
};

// Recommend Resonance style based on axes + arousal
function recommendStyle(axes, arousal) {
  if (axes.A > 7 && axes.J > 7) return 'novel';
  if (axes.G > 7)               return 'script';
  if (axes.B > 7 && arousal > 1) return 'sns';
  if (axes.E > 7 && axes.B > 5) return 'essay';
  return 'note';
}

// Recommend Resonance length based on arousal
function recommendLength(arousal) {
  if (arousal > 1)   return 'short';
  if (arousal < -0.5) return 'long';
  return 'medium';
}

/**
 * Convert a digital twin profile to a Resonance generation context.
 *
 * @param {{ axes: object, emotionState: { id: string, valence: number, arousal: number } }} twin
 * @returns {{ patternId, trajectoryType, label, style, length, components }}
 */
export function twinToResonanceContext(twin) {
  const { axes, emotionState } = twin;
  const pattern = EMOTION_TO_PATTERN[emotionState.id] ?? EMOTION_TO_PATTERN.nostalgia;

  const components = {};
  for (const [key, fn] of Object.entries(COMPONENT_FROM_AXES)) {
    components[key] = Math.round(fn(axes) * 10) / 10;
  }

  return {
    patternId:      pattern.id,
    trajectoryType: pattern.trajectoryType,
    label:          pattern.label,
    style:          recommendStyle(axes, emotionState.arousal),
    length:         recommendLength(emotionState.arousal),
    components,
  };
}

/**
 * Reverse mapping: given a Resonance pattern ID, return the ideal twin axis targets.
 * Useful for "what kind of person naturally produces this pattern?"
 *
 * @param {string} patternId
 * @returns {{ axes: object, emotionId: string }}
 */
export function patternToIdealAxes(patternId) {
  const PATTERN_TO_EMOTION = Object.fromEntries(
    Object.entries(EMOTION_TO_PATTERN).map(([e, p]) => [p.id, e])
  );

  // Axis targets for each trajectory type (ideal values on 0-10)
  const TRAJECTORY_AXIS_TARGETS = {
    I:    { A:7, B:8, C:7, D:7, E:6, F:3, G:6, H:6, I:6, J:6, K:6, L:7 }, // joy/excitement
    II:   { A:8, B:6, C:6, D:7, E:6, F:4, G:5, H:6, I:5, J:8, K:7, L:6 }, // curiosity
    III:  { A:9, B:6, C:7, D:6, E:5, F:4, G:4, H:7, I:4, J:7, K:6, L:6 }, // awe
    IV:   { A:7, B:6, C:7, D:7, E:6, F:4, G:7, H:7, I:5, J:7, K:8, L:7 }, // pride/gratitude
    V:    { A:7, B:4, C:5, D:4, E:4, F:7, G:4, H:5, I:3, J:5, K:5, L:4 }, // anxiety/fear
    VI:   { A:5, B:7, C:6, D:7, E:8, F:3, G:6, H:5, I:7, J:6, K:6, L:8 }, // contentment（解除後）
    VII:  { A:6, B:8, C:7, D:7, E:7, F:3, G:9, H:7, I:6, J:7, K:6, L:7 }, // flow/social joy
    VIII: { A:4, B:5, C:5, D:6, E:7, F:4, G:5, H:4, I:6, J:5, K:5, L:7 }, // contentment/boredom
    IX:   { A:5, B:4, C:4, D:3, E:5, F:6, G:6, H:4, I:4, J:4, K:5, L:5 }, // dissonance
  };

  const emotionId = PATTERN_TO_EMOTION[patternId];
  const pattern   = EMOTION_TO_PATTERN[emotionId];
  const axes      = TRAJECTORY_AXIS_TARGETS[pattern?.trajectoryType ?? 'VIII'];

  return { axes, emotionId: emotionId ?? 'nostalgia' };
}
