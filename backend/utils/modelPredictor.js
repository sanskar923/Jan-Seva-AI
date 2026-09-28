/**
 * Model Predictor Helper
 * Predicts category and root_cause from backend/model.pkl using child_process.
 * Non-destructive overlay with automatic fallback.
 */

import { spawn, execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { detectCategory } from "./aiEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pythonScriptPath = path.join(__dirname, "predict_model.py");

const ROOT_CAUSES = {
  Water: "Drinking water pipeline leakage and municipal supply contamination",
  Electricity: "Distribution transformer overloading and overhead cable fault",
  Road: "Bitumen wearing, surface potholes, and waterlogging erosion",
  Sanitation: "Municipal solid waste accumulation and choked storm drain",
  Health: "Public health clinic inventory and sanitation compliance deficit",
  Police: "Community safety surveillance and neighborhood beat patrol deficit",
  Billing: "Smart meter calibration variance and tariff slab discrepancy",
  Government: "Administrative document processing delay and citizen desk queue",
  General: "Civic infrastructure maintenance and repair"
};

function getRuleBasedFallback(text) {
  const category = detectCategory(text);
  const root_cause = ROOT_CAUSES[category] || "Civic infrastructure maintenance and repair";
  return {
    category,
    root_cause,
    confidence: category === "General" ? 0.45 : 0.88,
    source: "rule-based-fallback"
  };
}

/**
 * Predicts category and root_cause asynchronously for a given complaint text.
 * @param {string} text - Complaint description or title.
 * @returns {Promise<{category: string, root_cause: string, confidence: number, source: string}>}
 */
export async function predictCategoryAndRootCause(text) {
  if (!text || !String(text).trim()) {
    return {
      category: "General",
      root_cause: "Unspecified civic issue",
      confidence: 0.0,
      source: "fallback"
    };
  }

  return new Promise((resolve) => {
    try {
      const py = spawn("python", [pythonScriptPath], {
        stdio: ["pipe", "pipe", "pipe"]
      });

      let stdoutData = "";
      let stderrData = "";
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          try { py.kill(); } catch { /* ignore */ }
          console.warn("[ModelPredictor] Python process timed out after 3500ms, using rule-based fallback");
          resolve(getRuleBasedFallback(text));
        }
      }, 3500);

      py.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      py.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      py.on("close", (code) => {
        clearTimeout(timer);
        if (settled) return;
        settled = true;

        if (code === 0 && stdoutData.trim()) {
          try {
            const parsed = JSON.parse(stdoutData.trim());
            return resolve({
              category: parsed.category || "General",
              root_cause: parsed.root_cause || "Civic infrastructure issue",
              confidence: parsed.confidence ?? 1.0,
              source: "model.pkl"
            });
          } catch (parseErr) {
            console.warn("[ModelPredictor] JSON parse error, using fallback:", parseErr.message);
          }
        }

        if (stderrData) {
          console.warn("[ModelPredictor] Python stderr:", stderrData.trim());
        }

        resolve(getRuleBasedFallback(text));
      });

      py.on("error", (err) => {
        clearTimeout(timer);
        if (settled) return;
        settled = true;
        console.warn("[ModelPredictor] Failed to spawn python:", err.message);
        resolve(getRuleBasedFallback(text));
      });

      // Write text to stdin and close stream
      py.stdin.write(String(text));
      py.stdin.end();
    } catch (e) {
      console.warn("[ModelPredictor] Execution exception:", e.message);
      resolve(getRuleBasedFallback(text));
    }
  });
}

/**
 * Predicts category and root_cause synchronously.
 * @param {string} text - Complaint description or title.
 * @returns {{category: string, root_cause: string, confidence: number, source: string}}
 */
export function predictCategoryAndRootCauseSync(text) {
  if (!text || !String(text).trim()) {
    return {
      category: "General",
      root_cause: "Unspecified civic issue",
      confidence: 0.0,
      source: "fallback"
    };
  }

  try {
    const stdout = execFileSync("python", [pythonScriptPath], {
      input: String(text),
      encoding: "utf-8",
      timeout: 5000
    });

    const parsed = JSON.parse(stdout.trim());
    return {
      category: parsed.category || "General",
      root_cause: parsed.root_cause || "Civic infrastructure issue",
      confidence: parsed.confidence ?? 1.0,
      source: "model.pkl"
    };
  } catch (err) {
    console.warn("[ModelPredictorSync] Failed:", err.message);
    return getRuleBasedFallback(text);
  }
}

// Default export for convenient single-function import
export default predictCategoryAndRootCause;
