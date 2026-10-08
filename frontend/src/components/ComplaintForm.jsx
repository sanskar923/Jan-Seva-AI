import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import http from "../api/http.js";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Textarea from "../ui/Textarea.jsx";
import Input from "../ui/Input.jsx";
import { useToast } from "../state/ToastContext.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { useAppTranslation } from "../utils/translations.js";
import { speechRecognitionLang } from "../lib/speechLocale.js";
import { classifyImageFile } from "../utils/mobilenetClassify.js";

function getSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
}

export default function ComplaintForm({ onSubmitted, initialLocation }) {
  const { t, i18n } = useTranslation();
  const { dict } = useAppTranslation();
  const { user } = useAuth() || {};
  const toast = useToast();
  
  // Existing States
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const recRef = useRef(null);
  const fileInputRef = useRef(null);

  // NEW: Live Vision & Geolocation States
  const videoRef = useRef(null);
  const [isLive, setIsLive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(initialLocation);

  // NEW: Citizen Profile States (Pre-filled with logged-in user)
  const [fullname, setFullname] = useState(() => user?.fullName || user?.username || "");
  const [occupation, setOccupation] = useState("");
  const [employmentType, setEmploymentType] = useState("Private Sector");

  useEffect(() => {
    if (!fullname && (user?.fullName || user?.username)) {
      setFullname(user.fullName || user.username);
    }
  }, [user]);

  // SamasyaSetu Citizen Reporting Fields
  const [title, setTitle] = useState("");
  const [peopleAffected, setPeopleAffected] = useState("");
  const [district, setDistrict] = useState("Bhopal Central (Ward 14-22)");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingImage(true);
    try {
      const analysis = await classifyImageFile(file);
      if (!analysis || !analysis.isValid || analysis.rejected) {
        toast.error(
          analysis?.message ||
          "⚠️ Invalid Image: Please upload an authentic photo of the civic issue (road, water pipeline, garbage, or electrical hazard). Screenshots and documents are not accepted."
        );
        setPhotoFile(null);
        setPhotoPreview(null);
        setImageAnalysis(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        e.target.value = "";
        return;
      }

      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setImageAnalysis(analysis);

      if (analysis.needsReview || analysis.confidence < 0.60) {
        toast.info(
          `⚠️ Civic media accepted with low confidence (${Math.round(analysis.confidence * 100)}%). Tagged for Manual Officer Review.`
        );
      } else {
        toast.success(
          `✅ Civic Media Verified: ${analysis.category} • AI ${Math.round(analysis.confidence * 100)}% Match`
        );
      }
    } catch (err) {
      console.error("Image classification error:", err);
      toast.error("Failed to analyze image. Please try another photo.");
      setPhotoFile(null);
      setPhotoPreview(null);
      setImageAnalysis(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setAnalyzingImage(false);
    }
  }

  // Logic: Updated to enforce valid image verification when image is attached
  const canSubmitText = useMemo(() => {
    const hasText = text.trim().length > 0 || title.trim().length > 0;
    const hasName = fullname.trim().length > 0;
    const isImageValid = !photoFile || (imageAnalysis && imageAnalysis.isValid);
    return hasText && hasName && !busy && !analyzingImage && isImageValid;
  }, [text, title, fullname, busy, analyzingImage, photoFile, imageAnalysis]);
  
  const canSubmitImage = useMemo(() => 
    isLive && fullname.trim().length > 0 && !busy && !analyzingImage, 
    [isLive, fullname, busy, analyzingImage]
  );

  const speechSupported = useMemo(() => Boolean(getSpeechRecognition()), []);

  // LIVE GEOLOCATION: Continuous tracking
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({
          address: `📍 Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Bhopal)`,
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        });
      },
      (err) => console.error("Location tracking error:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // LIVE VISION: Toggle Camera
  const toggleLiveVision = async () => {
    if (isLive) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      setIsLive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" }, 
          audio: false 
        });
        videoRef.current.srcObject = stream;
        setIsLive(true);
      } catch (err) {
        toast.error("Camera access denied");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (recRef.current) {
        try { recRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  async function submitText() {
    if (!canSubmitText) return;
    setBusy(true);
    try {
      const finalLocation = `${district} · ${currentLocation?.address || "Bhopal, MP"}`;
      const fullDescription = title ? (text ? `${title} — ${text}` : title) : text;

      if (photoFile) {
        if (!imageAnalysis || !imageAnalysis.isValid) {
          toast.error("Please provide a valid civic photo before submitting.");
          return;
        }

        const fd = new FormData();
        fd.append("image", photoFile, photoFile.name || "photo_evidence.jpg");
        fd.append("fullname", fullname);
        fd.append("occupation", occupation);
        fd.append("employmentType", employmentType);
        fd.append("title", title);
        fd.append("peopleAffected", peopleAffected || "50");
        fd.append("district", district);
        fd.append("location", finalLocation);
        fd.append("caption", title || "Photo Evidence Report");
        fd.append("text", fullDescription);
        fd.append("clientPrediction", JSON.stringify(imageAnalysis));
        fd.append("category", imageAnalysis.category);
        fd.append("confidence", String(imageAnalysis.confidence));

        await http.post("/complaints/image", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await http.post("/complaints/text", { 
          text: fullDescription, 
          title,
          peopleAffected: Number(peopleAffected) || 50,
          district,
          fullname, 
          occupation, 
          employmentType,
          location: finalLocation
        });
      }

      setText("");
      setTitle("");
      setPeopleAffected("");
      setPhotoFile(null);
      setPhotoPreview(null);
      setImageAnalysis(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFullname("");
      setOccupation("");
      toast.success(t("complaint.textSuccess"));
      onSubmitted?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || t("complaint.textError"));
    } finally {
      setBusy(false);
    }
  }

  async function submitImage() {
    if (!canSubmitImage) return;
    setBusy(true);
    setAnalyzingImage(true);
    try {
      // Captured strictly from Live Vision
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg"));

      const analysis = await classifyImageFile(blob);
      if (!analysis || !analysis.isValid || analysis.rejected) {
        toast.error(
          analysis?.message ||
          "⚠️ Invalid Image: Please upload an authentic photo of the civic issue (road, water pipeline, garbage, or electrical hazard). Screenshots and documents are not accepted."
        );
        return;
      }

      setImageAnalysis(analysis);

      const fd = new FormData();
      fd.append("image", blob, "live_capture.jpg");
      fd.append("fullname", fullname);
      fd.append("occupation", occupation);
      fd.append("employmentType", employmentType);
      fd.append("location", currentLocation?.address || "Bhopal, MP");
      fd.append("caption", caption || "Image Report");
      fd.append("clientPrediction", JSON.stringify(analysis));
      fd.append("category", analysis.category);
      fd.append("confidence", String(analysis.confidence));
      
      await http.post("/complaints/image", fd, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });

      if (isLive) toggleLiveVision();
      setCaption("");
      setFullname("");
      setOccupation("");
      setImageAnalysis(null);
      toast.success(t("complaint.imageSuccess"));
      onSubmitted?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || t("complaint.imageError"));
    } finally {
      setBusy(false);
      setAnalyzingImage(false);
    }
  }

  function startVoice(lang) {
    const activeLang = lang || speechRecognitionLang(i18n?.language) || "hi-IN";
    const rec = getSpeechRecognition();
    if (!rec) {
      toast.info(t("complaint.voiceBrowserUnsupported"));
      return;
    }
    if (recRef.current) {
      try { recRef.current.stop(); } catch { /* ignore */ }
    }
    recRef.current = rec;
    rec.lang = activeLang;
    rec.interimResults = true;
    rec.continuous = true;
    
    const initialText = text ? (text.trim() + " ") : "";
    let accumulatedFinal = "";
    setListening(true);

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          accumulatedFinal += `${transcript} `;
        } else {
          interim += transcript;
        }
      }
      setText(`${initialText}${accumulatedFinal}${interim}`.trim());
    };
    rec.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone permission in your browser.");
      } else if (event.error !== "no-speech") {
        toast.error(t("complaint.voiceFailed"));
      }
      setListening(false);
    };
    rec.onend = () => { 
      setListening(false); 
    };
    try { 
      rec.start(); 
    } catch { 
      setListening(false); 
    }
  }

  function stopVoice() {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  }

  return (
    <Card glass className="p-8 border border-slate-800 bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-xl">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <div className="text-2xl font-black tracking-tight text-white">
            {dict.formTitle || t("complaint.title")}
          </div>
          <div className="text-[10px] text-violet-400 font-black uppercase tracking-[0.2em]">
            {dict.formSubtitle || "Governance, Accelerated by AI"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {speechSupported && (
            <Button 
              variant={listening ? "danger" : "secondary"} 
              onClick={listening ? stopVoice : () => startVoice()}
              className="rounded-xl px-4 py-2 text-xs font-bold"
            >
              {listening ? (dict.voiceStopBtn || "🛑 Stop Listening") : (dict.voiceMicBtn || "🎤 Voice Input")}
            </Button>
          )}
        </div>
      </div>

      {/* --- LIVE LOCATION OVERLAY --- */}
      <div className="mb-6 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
        <span className="text-xs font-bold">
          {currentLocation?.address || "Detecting live position..."}
        </span>
      </div>

      {/* --- STEP 1: CITIZEN IDENTIFICATION --- */}
      <div className="bg-slate-950/40 p-6 rounded-2xl mb-8 border border-slate-800/80">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
          {dict.step1TitleCitizen || "Step 1: Citizen Identification"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={dict.fullNameLabel || "Full Name *"}
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder={dict.fullNamePlaceholder || "Type your name to enable submission"}
          />
          <Input
            label={dict.occupationLabel || "Occupation"}
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder={dict.occupationPlaceholder || "e.g. Farmer, Teacher"}
          />
          <div className="md:col-span-2">
            <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">
              {dict.employmentLabel || "Employment Category"}
            </label>
            <select 
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/60 text-white text-sm font-semibold outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            >
              <option value="Farmer">{dict.farmer || "Farmer (Kisan)"}</option>
              <option value="Govt Job">{dict.govtJob || "Government Employee"}</option>
              <option value="Private Sector">{dict.privateSector || "Private Sector"}</option>
              <option value="Student">{dict.student || "Student"}</option>
              <option value="Self-Employed">{dict.selfEmployed || "Self-Employed / Business"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- STEP 2: REPORT DETAILS --- */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {dict.step2TitleIntake || "Step 2: Citizen Grievance Intake"}
          </h4>

          {/* Problem Title Input */}
          <Input
            label={dict.problemTitleLabel || "Problem Title *"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={dict.problemTitlePlaceholder || "e.g. Broken water pipeline causing road flood"}
          />

          {/* District / Ward Zone & People Affected Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">
                {dict.districtLabel || "District / Ward Zone *"}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950/60 text-white text-xs font-semibold outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              >
                <option value="Bhopal Central (Ward 14-22)">Bhopal Central (Ward 14-22)</option>
                <option value="MP Nagar & Commercial Zone">MP Nagar & Commercial Zone</option>
                <option value="Kolar & Southern Suburbs">Kolar & Southern Suburbs</option>
                <option value="BHEL & Govindpura Industrial">BHEL & Govindpura Industrial</option>
                <option value="Old City & Walled Heritage">Old City & Walled Heritage</option>
                <option value="Ranchi Municipal Corporation">Ranchi Municipal Corporation</option>
                <option value="Dumka Civic Division">Dumka Civic Division</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[10px] font-black uppercase text-slate-400">
                {dict.peopleAffectedLabel || "People Affected (Approx.)"}
              </label>
              <input
                type="number"
                min="1"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(e.target.value)}
                placeholder={dict.peopleAffectedPlaceholder || "e.g. 150 citizens"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950/60 text-white placeholder-slate-500 text-xs font-semibold outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {t("complaint.textLabel")}
              </label>
              {speechSupported && (
                <button
                  type="button"
                  onClick={listening ? stopVoice : () => startVoice()}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                    listening
                      ? "bg-red-500 text-white animate-pulse shadow-red-500/30"
                      : "bg-violet-600 hover:bg-violet-500 text-white font-extrabold shadow-violet-600/20 hover:scale-105 active:scale-95 cursor-pointer"
                  }`}
                  title="Click to speak"
                >
                  <span className="text-sm">{listening ? "⏹" : "🎤"}</span>
                  <span>{listening ? (dict.voiceStopBtn || "Recording... (Stop)") : (dict.voiceMicBtn || "बोलकर लिखें (Mic)")}</span>
                </button>
              )}
            </div>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={dict.describeLabel || "Describe the issue in Bhopal (or click the mic to speak in Hindi/Hinglish)..."}
                className="min-h-[140px] w-full resize-y rounded-xl border border-slate-700/80 bg-slate-950/60 p-3 pr-12 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={listening ? stopVoice : () => startVoice()}
                  className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                    listening
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40"
                      : "bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white shadow-sm"
                  }`}
                  title={listening ? "Click to stop listening" : "Click to speak"}
                >
                  {listening ? (
                    <span className="h-4 w-4 rounded-full bg-white animate-ping" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            {listening && (
              <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-red-500 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                <span>सुन रहा हूँ... बोलिए (Listening...)</span>
              </div>
            )}
          </div>

          {/* Photo Evidence Upload Input */}
          <div className="rounded-2xl border border-dashed border-slate-700 p-3.5 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>📷</span> {dict.photoEvidenceLabel || "Photo Evidence (Optional)"}
              </span>
              {photoFile && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setImageAnalysis(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-[10px] text-red-400 font-bold hover:underline cursor-pointer"
                >
                  {dict.removePhotoBtn || "Remove Photo"}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={analyzingImage || busy}
              onChange={handlePhotoChange}
              className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-800 file:text-white hover:file:bg-violet-600 cursor-pointer w-full"
            />

            {analyzingImage && (
              <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-2 rounded-xl animate-pulse">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                <span>Validating Civic Media & AI Classification...</span>
              </div>
            )}

            {photoFile && imageAnalysis && !analyzingImage && (
              <div className="mt-2.5">
                {imageAnalysis.needsReview || imageAnalysis.confidence < 0.60 ? (
                  <div className="flex items-center justify-between p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>⚠️</span> Needs Manual Officer Review
                    </span>
                    <span className="bg-amber-500/20 text-amber-200 text-[10px] px-2 py-0.5 rounded-full font-black">
                      AI {Math.round(imageAnalysis.confidence * 100)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>✅</span> Verified: {imageAnalysis.category}
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                      AI {Math.round(imageAnalysis.confidence * 100)}% Match
                    </span>
                  </div>
                )}
              </div>
            )}

            {photoPreview && (
              <div className="mt-2.5 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-700 shadow-sm">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <Button 
            onClick={submitText} 
            disabled={!canSubmitText} 
            className={`w-full py-4 font-black uppercase tracking-widest transition-all ${
              canSubmitText ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 hover:-translate-y-0.5 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {busy ? (dict.processingBtn || "Processing...") : analyzingImage ? "Validating Media..." : (dict.submitTextBtn || t("complaint.submitText"))}
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {dict.step2TitleVision || "Step 2: AI Vision Report"}
          </h4>
          
          <div className="relative overflow-hidden rounded-2xl bg-black border border-slate-800 aspect-video mb-2">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className={`w-full h-full object-cover ${isLive ? 'opacity-100' : 'opacity-0'}`} 
            />
            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs font-bold">
                {dict.cameraStandby || "Camera Standby"}
              </div>
            )}
          </div>

          <Button 
            onClick={toggleLiveVision} 
            variant="secondary"
            className="w-full text-[10px] font-black uppercase cursor-pointer"
          >
            {isLive ? (dict.stopVisionBtn || "🛑 Stop Live Vision") : (dict.startVisionBtn || "🎥 Start Live AI Vision")}
          </Button>

          <Input
            label={dict.captionLabel || "Image Caption"}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={dict.captionPlaceholder || "What are we looking at?"}
          />

          <AnimatePresence>
            {analyzingImage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[10px] font-black text-violet-400 uppercase">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                {dict.visionAnalyzing || "AI Vision Analyzing & Validating..."}
              </motion.div>
            )}
          </AnimatePresence>

          {imageAnalysis && (
            <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold ${
              imageAnalysis.needsReview || imageAnalysis.confidence < 0.60
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            }`}>
              <span className="text-[10px] font-black uppercase">
                {imageAnalysis.needsReview || imageAnalysis.confidence < 0.60
                  ? "⚠️ Needs Manual Officer Review"
                  : `AI Detected: ${imageAnalysis.category}`}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                imageAnalysis.needsReview || imageAnalysis.confidence < 0.60
                  ? "bg-amber-500/30 text-amber-200"
                  : "bg-emerald-600 text-white"
              }`}>
                {Math.round(imageAnalysis.confidence * 100)}% Match
              </span>
            </div>
          )}

          <Button 
            onClick={submitImage} 
            disabled={!canSubmitImage} 
            className={`w-full py-4 font-black uppercase tracking-widest transition-all ${
              canSubmitImage ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 hover:-translate-y-0.5 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {busy ? (dict.uploadingBtn || "Uploading...") : (dict.submitImageBtn || t("complaint.submitImage"))}
          </Button>
        </div>
      </div>
    </Card>
  );
}