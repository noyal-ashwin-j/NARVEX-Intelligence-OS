import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASETS_DIR = path.resolve(__dirname, '../../data/datasets');
const MODEL_DIR = path.resolve(__dirname, './models');

if (!fs.existsSync(MODEL_DIR)) {
  fs.mkdirSync(MODEL_DIR, { recursive: true });
}

// Sigmoid function
function sigmoid(z) {
  return 1.0 / (1.0 + Math.exp(-Math.max(-20, Math.min(20, z))));
}

export async function trainModel() {
  console.log('========================================================');
  console.log('🧠 NARVEX AI PREDICTIVE FORECAST MODEL TRAINING PIPELINE');
  console.log(`📁 Source Training Dataset: ${path.join(DATASETS_DIR, '16_forecast_training_data.csv')}`);
  console.log('========================================================\n');

  const csvContent = fs.readFileSync(path.join(DATASETS_DIR, '16_forecast_training_data.csv'), 'utf8');
  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const rawRows = parsed.data;

  console.log(`1. Loaded ${rawRows.length} longitudinal training records.`);

  // Feature Matrix X and Target y
  // Target: 1 = HIGH_PREVENTIVE_ATTENTION_SURGE, 0 = STABLE/WATCH
  const X = [];
  const y = [];

  rawRows.forEach((r) => {
    const vel7d = parseFloat(r.velocity_7d) || 1.0;
    const vel30d = parseFloat(r.velocity_30d) || 1.0;
    const vol90d = parseFloat(r.volume_90d) || 10.0;
    const cpAnomalies = parseFloat(r.checkpost_anomalies_count) || 0.0;
    const label = parseInt(r.target_risk_elevation_label, 10) || 0;

    // Derived features
    const accel = vel30d > 0 ? vel7d / vel30d : 1.0;
    const logVol = Math.log(vol90d + 1);

    X.push([vel7d, vel30d, accel, logVol, cpAnomalies]);
    y.push(label);
  });

  const numSamples = X.length;
  const numFeatures = X[0].length;
  const featureNames = ['velocity_7d', 'velocity_30d', 'acceleration', 'log_volume_90d', 'checkpost_anomalies'];

  console.log(`2. Constructed feature matrix: ${numSamples} samples × ${numFeatures} features.`);

  // Train / Validation / Test Split (70% / 15% / 15%)
  const indices = [...Array(numSamples).keys()];
  // Deterministic shuffle
  let seed = 12345;
  function rand() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const trainSize = Math.floor(numSamples * 0.70);
  const valSize = Math.floor(numSamples * 0.15);

  const trainIdx = indices.slice(0, trainSize);
  const valIdx = indices.slice(trainSize, trainSize + valSize);
  const testIdx = indices.slice(trainSize + valSize);

  console.log(`3. Split: Train=${trainIdx.length} | Validation=${valIdx.length} | Test=${testIdx.length}`);

  // Standard Scaler (Compute mean & std on Train set)
  const means = Array(numFeatures).fill(0);
  const stds = Array(numFeatures).fill(0);

  trainIdx.forEach((idx) => {
    for (let f = 0; f < numFeatures; f++) {
      means[f] += X[idx][f];
    }
  });
  for (let f = 0; f < numFeatures; f++) {
    means[f] /= trainIdx.length;
  }

  trainIdx.forEach((idx) => {
    for (let f = 0; f < numFeatures; f++) {
      stds[f] += Math.pow(X[idx][f] - means[f], 2);
    }
  });
  for (let f = 0; f < numFeatures; f++) {
    stds[f] = Math.sqrt(stds[f] / trainIdx.length) || 1.0;
  }

  // Normalize function
  function scale(vec) {
    return vec.map((val, f) => (val - means[f]) / stds[f]);
  }

  // Model Parameters: Weights and Bias
  let weights = Array(numFeatures).fill(0).map(() => (rand() - 0.5) * 0.1);
  let bias = 0.0;

  // Training Hyperparameters
  const epochs = 250;
  const learningRate = 0.08;
  const lambdaL2 = 0.005;

  console.log(`4. Fitting regularized logistic regression (Epochs=${epochs}, LR=${learningRate}, L2=${lambdaL2})...`);

  for (let epoch = 1; epoch <= epochs; epoch++) {
    let gradW = Array(numFeatures).fill(0);
    let gradB = 0.0;

    trainIdx.forEach((idx) => {
      const xNorm = scale(X[idx]);
      const target = y[idx];
      let z = bias;
      for (let f = 0; f < numFeatures; f++) {
        z += weights[f] * xNorm[f];
      }
      const pred = sigmoid(z);
      const error = pred - target;

      for (let f = 0; f < numFeatures; f++) {
        gradW[f] += error * xNorm[f];
      }
      gradB += error;
    });

    for (let f = 0; f < numFeatures; f++) {
      weights[f] -= learningRate * ((gradW[f] / trainIdx.length) + lambdaL2 * weights[f]);
    }
    bias -= learningRate * (gradB / trainIdx.length);
  }

  console.log('5. Training converged. Evaluating on Test Set...');

  // Evaluation on Test Set
  let tp = 0, fp = 0, tn = 0, fn = 0;
  let brierSum = 0;

  testIdx.forEach((idx) => {
    const xNorm = scale(X[idx]);
    const target = y[idx];
    let z = bias;
    for (let f = 0; f < numFeatures; f++) {
      z += weights[f] * xNorm[f];
    }
    const prob = sigmoid(z);
    const predBinary = prob >= 0.5 ? 1 : 0;

    brierSum += Math.pow(prob - target, 2);

    if (predBinary === 1 && target === 1) tp++;
    else if (predBinary === 1 && target === 0) fp++;
    else if (predBinary === 0 && target === 0) tn++;
    else if (predBinary === 0 && target === 1) fn++;
  });

  const accuracy = (tp + tn) / testIdx.length;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const brierScore = brierSum / testIdx.length;

  console.log(`   ✓ Accuracy:    ${(accuracy * 100).toFixed(2)}%`);
  console.log(`   ✓ Precision:   ${(precision * 100).toFixed(2)}%`);
  console.log(`   ✓ Recall:      ${(recall * 100).toFixed(2)}%`);
  console.log(`   ✓ F1 Score:    ${(f1Score * 100).toFixed(2)}%`);
  console.log(`   ✓ Brier Score: ${brierScore.toFixed(4)}`);

  // Model Artifact
  const modelArtifact = {
    modelType: 'REGULARIZED_LOGISTIC_REGRESSION',
    modelVersion: 'NARVEX_TEMPORAL_BAYES_V2.1',
    trainedAt: new Date().toISOString(),
    featureNames,
    scaler: {
      means,
      stds
    },
    parameters: {
      weights,
      bias
    },
    metrics: {
      accuracy: parseFloat(accuracy.toFixed(4)),
      precision: parseFloat(precision.toFixed(4)),
      recall: parseFloat(recall.toFixed(4)),
      f1Score: parseFloat(f1Score.toFixed(4)),
      brierScore: parseFloat(brierScore.toFixed(4)),
      confusionMatrix: { tp, fp, tn, fn }
    },
    trainingMetadata: {
      datasetFile: '16_forecast_training_data.csv',
      totalSamples: numSamples,
      trainSplit: trainIdx.length,
      valSplit: valIdx.length,
      testSplit: testIdx.length
    }
  };

  const artifactPath = path.join(MODEL_DIR, 'narvex_forecast_model.json');
  fs.writeFileSync(artifactPath, JSON.stringify(modelArtifact, null, 2), 'utf8');

  console.log(`\n💾 Saved trained model artifact to: ${artifactPath}`);
  return modelArtifact;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  trainModel().then(() => process.exit(0));
}

export default { trainModel };
