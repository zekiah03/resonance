# デジタルツイン統合理論

> **このファイルは成長するドキュメントです。**  
> 新しいマッピング・数式・発見はここに随時追記していきます。

---

## 概要

この理論は、人間を「精密な動的システム」として記述し、  
4つのアプリが扱うデータ層を単一のデジタルツインモデルに統合します。

```
┌─────────────────────────────────────────────────────────┐
│                   Human Digital Twin                     │
│                                                         │
│  Layer 1: Hardware    AIrobot       21スペック指標       │
│  Layer 2: Axes        Morpho        12軸プロファイル     │
│  Layer 3: Emotion     how-feelings  27感情 + 状態遷移    │
│  Layer 4: Dynamics    Resonance     20パターン × 9軌道型 │
└─────────────────────────────────────────────────────────┘
```

各レイヤーは下位レイヤーから導出可能であり、  
データは一方向（Hardware → Dynamics）に流れます。

---

## 1. 統合される4システム

### 1.1 AIrobot — ハードウェアレイヤー

人間の能力・特性を21種のマシンスペックとして数値化する診断システム。  
30問の質問（各1〜5点）から算出。

**カテゴリ一覧：**

| グループ | ID | 概念 | 人間的要素 |
|---|---|---|---|
| 演算系 | CPU | 演算ユニット | 論理思考・問題解決速度 |
| 演算系 | GPU | 描画ユニット | 空間認識・映像的想像力 |
| 演算系 | NPU | 推論チップ | 直感・パターン認識 |
| メモリ系 | RAM | 揮発メモリ | 短期記憶・同時処理 |
| メモリ系 | SSD | 高速ストレージ | 長期記憶の引き出し速度 |
| メモリ系 | HDD | 大容量ストレージ | 知識量・経験の蓄積 |
| センサー系 | CAM | 視覚センサー | 観察眼の精度 |
| センサー系 | MIC | 音声センサー | 聴覚・音の識別力 |
| センサー系 | SPK | 音声出力 | 声の明瞭さ・伝達力 |
| センサー系 | TCH | 触覚センサー | 繊細な感触の識別力 |
| センサー系 | GYR | 姿勢センサー | 平衡感覚・身体協調性 |
| 電力系 | PSU | 動力源 | 体力・エネルギー総量 |
| 電力系 | EFF | 稼働効率 | 少ない労力で最大成果 |
| 電力系 | THM | 排熱システム | ストレス発散・感情回復 |
| 電力系 | EXH | 廃棄エンジン | 代謝・不要情報の整理力 |
| 駆動系 | ACT | アクチュエータ | 筋力・身体出力 |
| 駆動系 | SRV | サーボモーター | 手先の細かさ・精度 |
| 駆動系 | FRM | フレーム剛性 | 姿勢・骨格の強さ |
| 通信系 | NET | 通信モジュール | 対人接続・コミュ力 |
| 通信系 | LAT | 応答遅延 | 反射神経・反応速度（逆転指標） |
| 通信系 | FW | 基本制御 | 本能・無意識の反応精度 |

**スコア計算：**
```
rawAnswer ∈ {1, 2, 3, 4, 5}
base = (rawAnswer - 1) / 4  // [0.0, 1.0]
baseScore = base × 100       // [0, 100]  ← 以降の計算に使用

※ LAT は「低いほど良い」指標だが、baseScore は全カテゴリ統一で
  「高いほど良い」方向に正規化済み。displayVal のみ逆転させる。
```

---

### 1.2 Morpho (comparedna) — 軸プロファイルレイヤー

任意の実体（人間・概念・組織）を12の直交する軸で記述するフレームワーク。  
スコアは 0.0〜10.0。

| 軸 | 名称 | 定義 |
|---|---|---|
| A | 構造複雑性 | 認知・情報処理の多層性・入れ子の深さ |
| B | エネルギー代謝 | 活力・効率・持続可能なスループット |
| C | 入出力 | センサー・表現・外界とのインターフェース総量 |
| D | 制御・自律性 | 反射精度・意思決定の速さと精度 |
| E | 健康・耐久 | ストレス耐性・回復速度・恒常性維持 |
| F | 環境依存度 | 外部条件変化への脆弱性（低いほど自律） |
| G | 相互作用（社交性） | 他者との接続・共鳴・関係構築能力 |
| H | 重力（影響力） | 他者を引き付ける存在感・吸引力 |
| I | 排除・免疫 | ノイズ・ストレス・不要情報の除去能力 |
| J | 流動性 | 情報・エネルギーの内部循環速度 |
| K | プライド | 自己イメージ・アイデンティティの強さ |
| L | 死との距離 | 持続性・不滅への近さ（0=今すぐ死ぬ、10=不滅） |

---

### 1.3 how-feelings-work — 感情状態レイヤー

27種の感情を valence × arousal の2次元空間に配置し、  
有向グラフとして状態遷移を定義するシステム。

**感情空間の座標軸：**
```
         arousal (+2)
              ↑
  anger  anxiety  excitement  awe
    fear         joy
                    pride  curiosity
─────────────────────────────────→ valence
(-2)                             (+2)
  sadness        gratitude  contentment
  boredom   nostalgia   flow   serenity
              ↓
         arousal (-2)
```

**デジタルツインで使用する感情とその座標：**

| 感情ID | 日本語 | valence | arousal |
|---|---|---|---|
| joy | 喜び | +1.5 | +1.5 |
| excitement | 高揚 | +1.5 | +2.0 |
| pride | 誇り | +1.5 | +0.5 |
| flow | フロー | +1.5 | +0.5 |
| curiosity | 好奇心 | +1.0 | +1.0 |
| gratitude | 感謝 | +1.5 | 0.0 |
| awe | 畏敬 | +0.5 | +1.5 |
| contentment | 静謐 | +1.0 | -1.5 |
| nostalgia | ノスタルジア | 0.0 | 0.0 |
| loneliness | 寂しさ | -1.0 | -0.5 |
| boredom | 退屈 | -0.5 | -1.5 |
| sadness | 悲しみ | -1.5 | -0.5 |
| anxiety | 不安 | -1.5 | +1.5 |
| fear | 恐怖 | -1.5 | +1.0 |
| anger | 怒り | -1.5 | +1.5 |

**状態遷移グラフ（抜粋）：**
```
joy ──[自己帰属; K>6]──→ pride
    ──[他者帰属; G>6]──→ gratitude
    ──[活動没入; J>6]──→ flow
    ──[強度減衰; B<5]──→ contentment
    ──[次への不安; E<4]→ anxiety

anxiety ──[脅威具体化; D<4]──→ fear
        ──[脅威攻撃; I>6]───→ anger
        ──[探索開始; A>6]───→ curiosity
        ──[脅威解除; E>7]───→ contentment

curiosity ──[規模感拡大; A>7]────→ awe
          ──[完全没入; J>7,D>6]──→ flow
          ──[探索停滞; A<4]─────→ boredom

sadness ──[記憶の美化; J>5]──→ nostalgia
        ──[孤立拡大; G<4]───→ loneliness
        ──[支援認識; G>7]───→ gratitude

pride ──[共有・祝福; G>6]──→ joy
      ──[達成の安定; E>6]──→ contentment
      ──[地位不安; D<4]───→ anxiety

anger ──[消耗・後悔; B<4]──→ sadness
      ──[自己正当化; K>7]──→ pride
      ──[解決・放棄; I>6]──→ contentment
```

---

### 1.4 Resonance — 情動ダイナミクスレイヤー

20種の感情パターンを9軌道型（Orbital Type I〜IX）で分類する。  
各パターンは S/E/C/B/dS の5成分プロファイルを持つ。

**軌道型と人間状態の対応：**

| 軌道型 | 動力学 | 感情パターン例 | 対応する人間状態 |
|---|---|---|---|
| I | 短期上昇→急下降（即時C） | 笑い・ツッコミ | joy, excitement |
| II | 短期上昇→急下降（遅延C） | 伏線回収・予想外 | curiosity, awe |
| III | 上昇→解放欠落 | 意味不明ギャグ・驚き | awe（未解消） |
| IV | 長期蓄積→解放 | 感動・カタルシス・泣けるドラマ | pride, gratitude, sadness |
| V | 長期維持→解放なし | サスペンス・怖い沈黙・気まずさ | anxiety, fear, loneliness |
| VI | 脅威解除 | 安心 | anxiety→contentment |
| VII | 低振幅反復 | 会話の気持ちよさ・ノリ | flow, joy（社会的） |
| VIII | 低S安定 | 退屈・予想通りの安心感・心地よい沈黙 | contentment, boredom |
| IX | リズム破壊 | テンポの悪さ | 不調和状態 |

---

## 2. クロスレイヤーマッピング定義

### 2.1 Layer 1 → Layer 2：スペック → 12軸

各軸は複数のスペックの加重平均から導出される。  
関数 `toAxis(base)` で [0, 100] → [0.0, 10.0] に正規化。

```
toAxis(b) = clamp(b / 10, 0, 10)

A（構造複雑性）= toAxis( mean(CPU, GPU, NPU) )
B（エネルギー代謝）= toAxis( mean(PSU, EFF) )
C（入出力）= toAxis( mean(CAM, MIC, SPK, TCH) )
D（制御・自律性）= toAxis( mean(FW, LAT_base) )  ※LAT_base は正規化済
E（健康・耐久）= toAxis( mean(PSU, EFF, THM) )
F（環境依存度）= toAxis( 100 - mean(EFF, FW) )  ※逆転：効率高=依存低
G（社交性）= toAxis( mean(NET, SPK) )
H（重力・影響力）= toAxis( mean(NET, SPK, GPU) )
I（排除・免疫）= toAxis( mean(THM, EXH) )
J（流動性）= toAxis( mean(RAM, SSD, HDD) )
K（プライド）= toAxis( mean(CPU, HDD, NPU) )
L（生命力）= toAxis( mean(PSU, EFF, FRM) )
```

**設計根拠：**

| 軸 | 選択スペック | 根拠 |
|---|---|---|
| A | CPU, GPU, NPU | 演算・映像・推論の複合が「思考の複雑さ」を構成する |
| B | PSU, EFF | 体力と効率の積が代謝スループットを決める |
| C | CAM, MIC, SPK, TCH | 感覚入力（CAM,MIC,TCH）+ 表現出力（SPK）の総体 |
| D | FW, LAT | 無意識の精度（FW）× 反応速度（LAT）が制御の基盤 |
| E | PSU, EFF, THM | 持続力・効率・回復の三要素が耐久性を決める |
| F | EFF, FW（逆転） | 自律効率が高いほど環境変化に依存しない |
| G | NET, SPK | 接続帯域（NET）× 表現明瞭さ（SPK）が社交性の質 |
| H | NET, SPK, GPU | 影響力=接続×表現×ビジュアル思考の三積 |
| I | THM, EXH | 排熱（感情回復）× 代謝廃棄（不要情報排除）が免疫力 |
| J | RAM, SSD, HDD | 作業記憶・速度・容量の三層が情報流動を規定 |
| K | CPU, HDD, NPU | 論理・知識・直感の統合が自己評価の根拠 |
| L | PSU, EFF, FRM | 体力×効率×骨格が物理的な持続性 |

---

### 2.2 Layer 2 → Layer 3：12軸 → 感情座標

12軸プロファイルから valence と arousal を計算する。  
各軸は 0〜10 のスケールであり、感情座標は [-2, +2] に写像する。

**Valence（快不快）の計算：**

```
valence_raw =
    B × 0.25   // 高エネルギー → ポジティブ体験
  + G × 0.20   // 社会的つながり → ポジティブ
  + E × 0.20   // 健康・耐久 → ポジティブ
  + L × 0.15   // 生命力 → ポジティブ
  + J × 0.10   // 情報流動 → 好奇心・ポジティブ
  + (10 - F) × 0.10  // 低依存 = 自律性 → ポジティブ

valence = valence_raw / 10 × 4 - 2  // [0, 10] → [-2, +2]
```

**Arousal（覚醒度）の計算：**

```
arousal_raw =
    A × 0.25   // 認知複雑性 → 高覚醒
  + C × 0.20   // I/O強度 → 覚醒
  + D × 0.20   // 制御・反射 → 覚醒
  + H × 0.20   // 影響力・存在感 → 覚醒
  + I × 0.15   // 排除・免疫（能動的） → 覚醒

arousal = arousal_raw / 10 × 4 - 2  // [0, 10] → [-2, +2]
```

**設計根拠：**

- valence は「リソースの充足度」を反映する軸（B, G, E, L, J）が主要因。  
  環境依存度 F は逆転（10-F）して寄与：自律性の高さがポジティブ感情の基盤になる。
- arousal は「システムの活性度・緊張度」を反映する軸（A, C, D, H）が主要因。  
  免疫 I も含める：排除反応（怒り・回避）は高覚醒状態。

**感情ID選択：最近傍法**

```
closetEmotion = argmin_{e ∈ EMOTIONS} dist(e, (valence, arousal))

dist(e, (v, a)) = √( (e.valence - v)² + (e.arousal - a)² )
```

---

### 2.3 Layer 3 → Layer 4：感情 → Resonance パターン

感情IDから対応する Resonance パターンと軌道型を決定する。

| 感情ID | 感情（日本語） | Resonance パターン | 軌道型 | 軌道の特徴 |
|---|---|---|---|---|
| joy | 喜び | laughter（笑い） | I | 短期上昇→即時解放 |
| excitement | 高揚 | nori（ノリの良さ） | VII | 低振幅高速反復 |
| pride | 誇り | catharsis（カタルシス） | IV | 長期蓄積→爆発的解放 |
| flow | フロー | conv_pleasure（会話の気持ちよさ） | VII | 低振幅反復・連続成功 |
| curiosity | 好奇心 | fukusen（伏線回収） | II | 遅延解放・意味の再統合 |
| gratitude | 感謝 | kandou（感動） | IV | 長期蓄積→静かな解放 |
| awe | 畏敬 | odoroki（驚き） | III | 上昇→解放欠落・余韻 |
| contentment | 静謐 | yoi_anshin（予想通りの安心感） | VIII | 低S安定・変化なし |
| nostalgia | ノスタルジア | nakeru（泣けるドラマ） | IV | 蓄積→甘苦い解放 |
| loneliness | 寂しさ | kimazui（気まずさ） | V | 維持→解放なし |
| boredom | 退屈 | taikutsu（退屈） | VIII | 低S安定・低変化 |
| sadness | 悲しみ | nakeru（泣けるドラマ） | IV | 蓄積→甘苦い解放 |
| anxiety | 不安 | suspense（サスペンス） | V | 長期維持→解放なし |
| fear | 恐怖 | kowai_chinmoku（怖い沈黙） | V | 脅威維持→解放なし |
| anger | 怒り | catharsis（カタルシス） | IV | 蓄積→外向き爆発 |

---

## 3. 完全なデータフロー図

```
【入力】 30問の回答 (Q01〜Q30, 各1〜5点)
    ↓
【Layer 1: Hardware Scores】
  {CPU:82, GPU:67, NPU:71, RAM:88, SSD:74, HDD:60,
   CAM:79, MIC:55, SPK:68, TCH:43, GYR:72,
   PSU:65, EFF:80, THM:58, EXH:50,
   ACT:45, SRV:61, FRM:70,
   NET:84, LAT:78, FW:66}  ← 例
    ↓ specsToAxes()
【Layer 2: 12-Axis Profile】
  {A:7.3, B:7.3, C:6.1, D:7.2, E:6.8, F:2.7,
   G:7.6, H:7.3, I:5.4, J:7.4, K:6.8, L:7.2}
    ↓ axesToEmotionCoords()
【感情座標】
  valence=+1.2, arousal=+0.9
    ↓ coordsToEmotion()  [最近傍法]
【Layer 3: Emotion State】
  id='joy', nameJa='喜び'
  transitions: [
    {to:'pride',   label:'自己帰属',  条件K>6 → 満たす},
    {to:'gratitude',label:'他者帰属', 条件G>6 → 満たす},
    {to:'flow',    label:'活動没入',  条件J>6 → 満たす}
  ]
    ↓ emotionToPattern()
【Layer 4: Affective Pattern】
  patternId='laughter', trajectoryType='I'
  label='笑い', desc='短期上昇→即時解放'
```

---

## 4. デジタルツインの完全型定義

```typescript
interface DigitalTwin {
  // Layer 1: AIrobot スペックスコア
  specs: Record<SpecID, {
    base: number;       // 0〜100（正規化済み）
    displayVal: number; // 表示値（単位付き）
    maxVal: number;
    label: string;
    unit: string;
    inverted?: boolean; // LAT のみ true
  }>;

  // Layer 2: Morpho 12軸プロファイル
  axes: {
    A: number;  // 構造複雑性    [0.0〜10.0]
    B: number;  // エネルギー代謝
    C: number;  // 入出力
    D: number;  // 制御・自律性
    E: number;  // 健康・耐久
    F: number;  // 環境依存度
    G: number;  // 社交性
    H: number;  // 重力・影響力
    I: number;  // 排除・免疫
    J: number;  // 流動性
    K: number;  // プライド
    L: number;  // 生命力（死との距離）
  };

  // Layer 3: 感情状態（how-feelings-work）
  emotionState: {
    id: EmotionID;
    nameJa: string;
    valence: number;  // -2 〜 +2
    arousal: number;  // -2 〜 +2
    transitions: Array<{
      to: EmotionID;
      label: string;
      targetNameJa: string;
    }>;
  };

  // Layer 4: 情動ダイナミクス（Resonance）
  affectivePattern: {
    id: ResonancePatternID;
    trajectoryType: OrbitalType;  // 'I'〜'IX'
    label: string;
  };
}
```

---

## 5. Resonance 側の統合ポイント

### 5.1 デジタルツインプロファイルからのパターン選択

`digitalTwin.js` が提供する `twinToResonanceContext()` 関数により、  
デジタルツインの軸プロファイルと感情状態から、最適な Resonance パターンを選択できる。

```javascript
import { twinToResonanceContext } from './digitalTwin.js';

const context = twinToResonanceContext({
  axes:  { A:7.3, B:7.3, C:6.1, D:7.2, E:6.8, F:2.7,
           G:7.6, H:7.3, I:5.4, J:7.4, K:6.8, L:7.2 },
  emotionState: { id: 'joy', valence: 1.2, arousal: 0.9 },
});

// context.patternId     → 'laughter'
// context.trajectoryType→ 'I'
// context.promptHint    → Resonance の promptHints フィールド
// context.styleHint     → 推奨スタイル（sns / note / novel...）
// context.lengthHint    → 推奨字数
```

### 5.2 軸値によるスタイル・字数の自動提案

```
推奨スタイル:
  A > 7 かつ J > 7  → novel（複雑な内面描写が活きる）
  G > 7              → script（対話が豊か）
  B > 7 かつ arousal > 1 → sns（勢いとテンポ）
  E > 7 かつ valence > 0 → essay（落ち着いた観察）
  その他              → note（汎用）

推奨字数:
  arousal > 1    → short（勢いを短く）
  arousal < -0.5 → long（ゆったりと展開）
  その他          → medium
```

---

## 6. 実装ノート

### 6.1 加重係数の設計方針

現在の係数（0.25, 0.20 など）は直感的な重み付けによる初期値。  
将来的には実測データに基づいた回帰分析で最適化することが望ましい。

**制約：**
```
Σ(valence係数) = 1.0
Σ(arousal係数) = 1.0
各係数 ≥ 0
```

### 6.2 再現性の保証

AIrobot の `seededRandom()` と同様に、同じ回答セットからは  
常に同じデジタルツイン状態が生成される（決定論的）。

### 6.3 既知の限界

- 感情遷移グラフの条件閾値（例：`K > 6`）は仮値。
- 12軸マッピングは線形近似であり、交互作用効果を無視している。
- 環境DNA（comparedna の60要素）はまだ統合されていない（→ §7参照）。

---

## 7. 今後の拡張計画

### 7.1 環境DNAの統合

comparedna の環境DNA（60要素 × 7層）を Layer 2.5 として追加：
```
pressure_axes  (12要素): 外部圧力プロファイル → F軸への補正
origin_layers  (12要素): 由来・経歴 → J, K軸への補正
relationships  (7相手): 対人関係構造 → G, H軸への補正
time_rhythm    (5要素): 時間スケール → L軸への補正
taboo_aspiration(4要素): 禁忌・願望 → I, K軸への補正
internal       (5要素): 内的葛藤 → D, E軸への補正
constraints    (5要素): 物理的限界 → B, C軸への補正
```

### 7.2 動的シミュレーション

時系列でデジタルツインの状態変化をシミュレーション：
```
twin(t+Δt) = f(twin(t), event(t), axes)

状態方程式（暫定）:
d(emotionState)/dt = Σ triggered_transitions × Δ(axis_delta)
```

### 7.3 マルチツイン比較

複数のデジタルツインプロファイルを比較・類似度計算：
```
similarity(twin_a, twin_b) =
  0.4 × axes_cosine_sim(a.axes, b.axes) +
  0.3 × emotion_dist(a.emotion, b.emotion) +
  0.3 × pattern_match(a.pattern, b.pattern)
```

### 7.4 逆方向マッピング（Resonance → Twin）

Resonance で選択したパターンから、それを自然に生成しやすい  
デジタルツイン状態を逆算する：
```
ideal_axes = pattern_to_axes(selected_pattern)
```

### 7.5 感情成分プロファイルとの照合

Resonance の各パターンは S/E/C/B/dS 成分を持つ。  
これをデジタルツイン軸値に逆写像することで双方向マッピングが完成する：

```
S（不確実性） ↔ (10 - D) + F    // 制御が低く依存度が高い → 不確実
E（予測誤差） ↔ A + C          // 複雑で刺激が多い → 予測誤差大
C（収束・統合）↔ J + K          // 流動性と誇りが統合を促す
B（安心感）   ↔ E + (10 - F)   // 耐久×自律性が安心の基盤
dS（変化速度）↔ D + B × 0.5   // 制御×エネルギーが変化速度
```

---

## 変更履歴

| 日付 | 変更内容 |
|---|---|
| 2026-05-01 | 初版作成：4システムの統合理論・全マッピング定義・型定義・Resonance統合ポイント・拡張計画 |
