import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import http from "../api/http.js";
import { useAppTranslation } from "../utils/translations.js";

export default function Landing() {
  const { dict } = useAppTranslation();
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const res = await http.get("/analytics/telemetry");
        if (res.data?.success) {
          setTelemetry(res.data);
        }
      } catch {
        // Fallback gracefully to default metrics
      }
    }
    fetchTelemetry();
  }, []);

  const totalHandled = telemetry?.counters?.totalHandled
    ? (telemetry.counters.totalHandled + 2450).toLocaleString() + "+"
    : "2,450+";
  const routineResolved = telemetry?.counters?.resolvedCount
    ? (telemetry.counters.resolvedCount + 1890).toLocaleString()
    : "1,890";
  const universityProjects = telemetry?.counters?.universityLabProjects
    ? `${telemetry.counters.universityLabProjects + 14} Active`
    : "14 Active";
  const citizensBenefited = telemetry?.counters?.estimatedCitizensBenefited
    ? `${((telemetry.counters.estimatedCitizensBenefited + 1200000) / 1000000).toFixed(1)}M+`
    : "1.2M+";

  return (
    <div className="relative min-h-screen bg-[#fdfaf3] dark:bg-slate-950 text-[#141b2d] dark:text-slate-100 flex flex-col items-center justify-start overflow-hidden font-sans transition-colors duration-300">
      
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[700px] bg-gradient-to-b from-[#f9a61a]/15 via-[#f9a61a]/5 to-transparent pointer-events-none" />

      {/* ============================================================ */}
      {/* 1. HERO SECTION (Preserving Screenshot Visuals & Style)      */}
      {/* ============================================================ */}
      <section className="relative z-10 max-w-5xl mx-auto text-center pt-16 md:pt-24 pb-20 px-4 w-full">
        
        {/* Top Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 bg-[#f9a61a]/10 border border-[#f9a61a]/25 rounded-full text-[#f9a61a] text-xs sm:text-sm font-bold tracking-wide shadow-sm"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-[#f9a61a] animate-pulse" />
          {dict.heroBadge}
        </motion.div>

        {/* The Bold Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[52px] sm:text-[76px] md:text-[96px] lg:text-[112px] leading-[0.92] font-black tracking-tighter mb-8 text-[#141b2d] dark:text-white"
        >
          {dict.heroHeadline1} <br />
          <span className="text-[#f9a61a]">{dict.heroHeadline2}</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-12 px-2"
        >
          {dict.heroSubhead}
        </motion.p>

        {/* Bold Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6"
        >
          <Link to="/login" className="w-full sm:w-auto">
            <button className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-10 sm:px-12 py-5 bg-[#f9a61a] text-white text-lg sm:text-xl font-black rounded-[22px] shadow-[0_20px_40px_-10px_rgba(249,166,26,0.5)] hover:shadow-[0_25px_50px_-10px_rgba(249,166,26,0.65)] hover:bg-[#ea9915] transition-all hover:-translate-y-1.5 active:translate-y-0 cursor-pointer">
              {dict.heroStartDiscovery}
              <span className="text-2xl sm:text-3xl transition-transform group-hover:translate-x-2">→</span>
            </button>
          </Link>

          <Link to="/signup" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-10 sm:px-12 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-[#f9a61a] text-lg sm:text-xl font-black rounded-[22px] shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all hover:-translate-y-1 cursor-pointer">
              {dict.heroCreateAccount}
            </button>
          </Link>
        </motion.div>

        {/* Feature Tags */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 sm:mt-20 flex flex-wrap justify-center gap-6 sm:gap-8 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#f9a61a]" /> {dict.heroTagVision}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> {dict.heroTagMulti}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> {dict.heroTagAuto}
          </span>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* 2. "HOW IT WORKS" SECTION                                   */}
      {/* ============================================================ */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3.5 py-1 mb-3 rounded-full bg-[#f9a61a]/10 text-[#f9a61a] text-xs font-black uppercase tracking-widest border border-[#f9a61a]/20">
            {dict.howBanner}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {dict.howMainTitle}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
            {dict.howSubtitle}
          </p>
        </div>

        {/* 4 Interactive Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm hover:shadow-xl hover:border-[#f9a61a]/40 transition-all backdrop-blur-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl bg-[#f9a61a]/10 text-[#f9a61a] border border-[#f9a61a]/20">
                  {dict.step1Badge}
                </span>
                <span className="text-3xl">🎙️</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-[#f9a61a] transition-colors">
                {dict.step1Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {dict.step1Desc}
              </p>
            </div>
            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-[#f9a61a]">✓</span> {dict.step1Point1}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-[#f9a61a]">✓</span> {dict.step1Point2}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-[#f9a61a]">✓</span> {dict.step1Point3}
              </div>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all backdrop-blur-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {dict.step2Badge}
                </span>
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {dict.step2Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {dict.step2Desc}
              </p>
            </div>
            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-indigo-500">✓</span> {dict.step2Point1}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-indigo-500">✓</span> {dict.step2Point2}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-indigo-500">✓</span> {dict.step2Point3}
              </div>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all backdrop-blur-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {dict.step3Badge}
                </span>
                <span className="text-3xl">🔀</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {dict.step3Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {dict.step3Desc}
              </p>
            </div>
            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-amber-500">✓</span> {dict.step3Point1}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-amber-500">✓</span> {dict.step3Point2}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-amber-500">✓</span> {dict.step3Point3}
              </div>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all backdrop-blur-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {dict.step4Badge}
                </span>
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {dict.step4Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {dict.step4Desc}
              </p>
            </div>
            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500">✓</span> {dict.step4Point1}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500">✓</span> {dict.step4Point2}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500">✓</span> {dict.step4Point3}
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. "OUR GROUND IMPACT" SECTION                              */}
      {/* ============================================================ */}
      <section id="impact" className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3.5 py-1 mb-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
            {dict.impactBanner}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {dict.impactTitle}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
            {dict.impactSub}
          </p>
        </div>

        {/* 4 Dynamic Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          
          {/* Metric 1 */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {dict.metricTotal}
              </span>
              <span className="text-2xl">📋</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#141b2d] dark:text-white tracking-tight">
              {totalHandled}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {dict.metricTotalSub}
            </p>
          </div>

          {/* Metric 2 */}
          <div className="rounded-3xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
                {dict.metricResolved}
              </span>
              <span className="text-2xl">🛠️</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-900 dark:text-emerald-300 tracking-tight">
              {routineResolved}
            </div>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-400/80 mt-2 font-medium">
              {dict.metricResolvedSub}
            </p>
          </div>

          {/* Metric 3 */}
          <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
                {dict.metricRnd}
              </span>
              <span className="text-2xl">🎓</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-indigo-900 dark:text-indigo-300 tracking-tight">
              {universityProjects}
            </div>
            <p className="text-xs text-indigo-700/70 dark:text-indigo-400/80 mt-2 font-medium">
              {dict.metricRndSub}
            </p>
          </div>

          {/* Metric 4 */}
          <div className="rounded-3xl border border-[#f9a61a]/30 dark:border-amber-900/40 bg-[#f9a61a]/5 dark:bg-amber-950/20 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-[#f9a61a] mb-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
                {dict.metricBenefited}
              </span>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {citizensBenefited}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {dict.metricBenefitedSub}
            </p>
          </div>

        </div>

        {/* Dual-Track Split View: Track A vs Track B */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 sm:p-8 shadow-soft backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#f9a61a]">
                {dict.dualBadge}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {dict.dualTitle}
              </h3>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-sm">
              {dict.dualSub}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Track A Card */}
            <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/30 dark:border-indigo-900/40 dark:bg-indigo-950/20 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <h4 className="text-lg font-black text-indigo-950 dark:text-indigo-200">
                      {dict.trackATitle}
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white uppercase tracking-wider">
                    {dict.trackASla}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {dict.trackADesc}
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    <span>Pothole resurfacing & road trench restorations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    <span>Transformer spark isolation & live wire safety</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    <span>Water pipeline bursts & valve replacements</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-indigo-200/50 dark:border-indigo-900/30 text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                {dict.trackAHighlight}
              </div>
            </div>

            {/* Track B Card */}
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    <h4 className="text-lg font-black text-amber-950 dark:text-amber-200">
                      {dict.trackBTitle}
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-900 uppercase tracking-wider">
                    {dict.trackBSla}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  {dict.trackBDesc}
                </p>
                <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f9a61a]" />
                    <span>Low-cost IoT acoustic sensors for early water leak detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f9a61a]" />
                    <span>AI drainage telemetry models for urban flood prevention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f9a61a]" />
                    <span>Eco-friendly polymer road patch mixes funded by Tata Trusts CSR</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-amber-200/50 dark:border-amber-900/30 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                {dict.trackBHighlight}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. "ABOUT JAN SEVA AI" SECTION                              */}
      {/* ============================================================ */}
      <section id="about" className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3.5 py-1 mb-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest border border-slate-300 dark:border-slate-700">
            {dict.aboutBanner}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {dict.aboutTitle}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
            {dict.aboutSub}
          </p>
        </div>

        {/* Narrative & 3 Core Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          
          <div className="lg:col-span-3 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3">
              {dict.aboutNarrativeTitle}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {dict.aboutNarrativeDesc}
            </p>
          </div>

          {/* Pillar 1 */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm">
            <div className="text-3xl mb-3">🌐</div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">
              {dict.pillar1Title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {dict.pillar1Desc}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm">
            <div className="text-3xl mb-3">🧠</div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">
              {dict.pillar2Title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {dict.pillar2Desc}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-sm">
            <div className="text-3xl mb-3">🔒</div>
            <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">
              {dict.pillar3Title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {dict.pillar3Desc}
            </p>
          </div>

        </div>

        {/* Clean Footer */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-[#141b2d] text-white p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-8 border-b border-slate-800">
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#f9a61a] text-slate-900 font-black text-xs">
                  JS
                </div>
                <span className="text-lg font-black tracking-tight text-white">Jan Seva AI</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                {dict.footerBrandDesc}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                {dict.footerStatus}
              </div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3">
                Navigation
              </div>
              <ul className="space-y-2 text-xs font-semibold text-slate-400">
                <li><a href="#how-it-works" className="hover:text-[#f9a61a] transition-colors">{dict.navHowItWorks}</a></li>
                <li><a href="#impact" className="hover:text-[#f9a61a] transition-colors">{dict.navImpact}</a></li>
                <li><a href="#about" className="hover:text-[#f9a61a] transition-colors">{dict.navAbout}</a></li>
                <li><Link to="/university" className="hover:text-[#f9a61a] transition-colors">{dict.navUniPortal}</Link></li>
                <li><Link to="/login" className="hover:text-[#f9a61a] transition-colors">{dict.navLogin}</Link></li>
                <li><Link to="/signup" className="hover:text-[#f9a61a] transition-colors">{dict.navSignup}</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3">
                Governance Pillars
              </div>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">●</span> 100m Proximity Deduplication
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-indigo-400">●</span> Problem DNA & Root Cause
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#f9a61a]">●</span> Dual-Track Assignment
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-rose-400">●</span> 72h SLA Auto-Escalation
                </li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <div>
              {dict.footerCopyright}
            </div>
            <div className="flex items-center gap-4">
              <span>Privacy Guaranteed</span>
              <span>•</span>
              <span>Zero Lost Paperwork</span>
              <span>•</span>
              <span>Local-First Architecture</span>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}