import React, { useState, useEffect } from 'react';
import { t } from '../data/i18n.js';
import {
  Sunrise,
  Truck,
  PackageCheck,
  Moon,
  CheckCircle2,
  Clock,
  Users,
  Package,
  ArrowRight,
} from 'lucide-react';

export default function LogisticsView({ lang }) {
  // Live stage tracking: 0 to 3
  const [activeStage, setActiveStage] = useState(1);

  // Stats count-up animation state
  const [counts, setCounts] = useState({
    farmers: 0,
    crates: 0,
    tempos: 0,
    delivered: 0,
  });

  // Cycle active stage every 4 seconds for demo simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Animate stats counting up from 0 to target values over ~1.5s
  useEffect(() => {
    const targets = {
      farmers: 847,
      crates: 4230,
      tempos: 38,
      delivered: 3150,
    };

    const duration = 1500;
    let startTime = null;
    let frameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic curve for smooth slowdown
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setCounts({
        farmers: Math.floor(targets.farmers * easeProgress),
        crates: Math.floor(targets.crates * easeProgress),
        tempos: Math.floor(targets.tempos * easeProgress),
        delivered: Math.floor(targets.delivered * easeProgress),
      });

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCounts(targets);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  const stages = [
    {
      icon: Sunrise,
      title: t(lang, 'stage1'),
      time: t(lang, 'stage1Time'),
      desc: t(lang, 'stage1Desc'),
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      ringColor: 'ring-amber-400',
    },
    {
      icon: Truck,
      title: t(lang, 'stage2'),
      time: t(lang, 'stage2Time'),
      desc: t(lang, 'stage2Desc'),
      color: 'bg-agri-600',
      lightColor: 'bg-green-50',
      textColor: 'text-agri-600',
      ringColor: 'ring-agri-400',
    },
    {
      icon: PackageCheck,
      title: t(lang, 'stage3'),
      time: t(lang, 'stage3Time'),
      desc: t(lang, 'stage3Desc'),
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      ringColor: 'ring-blue-400',
    },
    {
      icon: Moon,
      title: t(lang, 'stage4'),
      time: t(lang, 'stage4Time'),
      desc: t(lang, 'stage4Desc'),
      color: 'bg-highway-600',
      lightColor: 'bg-orange-50',
      textColor: 'text-highway-600',
      ringColor: 'ring-highway-400',
    },
  ];

  const statItems = [
    {
      id: 'farmers',
      label: t(lang, 'farmersBooked'),
      value: counts.farmers.toLocaleString('en-IN'),
      icon: Users,
      bgCircle: 'bg-emerald-100',
      iconColor: 'text-agri-600',
      cardBorder: 'border-emerald-100',
    },
    {
      id: 'crates',
      label: t(lang, 'cratesCollected'),
      value: counts.crates.toLocaleString('en-IN'),
      icon: Package,
      bgCircle: 'bg-blue-100',
      iconColor: 'text-blue-600',
      cardBorder: 'border-blue-100',
    },
    {
      id: 'tempos',
      label: t(lang, 'temposDispatched'),
      value: counts.tempos.toLocaleString('en-IN'),
      icon: Truck,
      bgCircle: 'bg-orange-100',
      iconColor: 'text-highway-600',
      cardBorder: 'border-orange-100',
    },
    {
      id: 'delivered',
      label: t(lang, 'deliveredMarket'),
      value: counts.delivered.toLocaleString('en-IN'),
      icon: CheckCircle2,
      bgCircle: 'bg-purple-100',
      iconColor: 'text-purple-600',
      cardBorder: 'border-purple-100',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* SECTION 1: Header */}
      <div className="bg-gradient-to-r from-agri-700 via-agri-600 to-highway-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 w-32 h-32 rounded-full bg-white/5 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium text-white mb-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'mr' ? 'थेट २४x७ सप्लाय चेन ट्रॅकर' : 'Live 24x7 Supply Chain Tracker'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 tracking-tight">
              <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 flex-shrink-0" />
              <span>{t(lang, 'logisticsTitle')}</span>
            </h1>
            <p className="text-sm text-emerald-100 mt-1 max-w-xl">
              {t(lang, 'logisticsSub')}
            </p>
          </div>

          {/* Quick Route Stage Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/15 backdrop-blur-md px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold border border-white/20 self-start sm:self-center">
            <span className="text-emerald-200">{lang === 'mr' ? 'शिवार' : 'Farm'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-emerald-100">{lang === 'mr' ? 'संकलन' : 'Hub'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-amber-200">{lang === 'mr' ? 'हायवे' : 'Highway'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-orange-200">{lang === 'mr' ? 'मार्केट' : 'Market'}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Visual Pipeline Timeline (4 stages) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-gray-100 gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              {lang === 'mr' ? 'दैनिक ६ ते १० तास जलद लॉजिस्टिक्स पाईपलाईन' : 'Daily 6-10 Hour Rapid Pipeline'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === 'mr'
                ? 'प्रत्येक टप्प्यातील लाइव्ह प्रगती व वाहनांचे वेळापत्रक'
                : 'Live stage progress and vehicle schedules across Maharashtra'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-agri-50 text-agri-700 text-xs font-semibold self-start sm:self-auto border border-agri-200">
            <span className="w-2 h-2 rounded-full bg-agri-500 animate-ping" />
            <span>
              {lang === 'mr' ? `टप्पा ${activeStage + 1}/4 चालू` : `Stage ${activeStage + 1}/4 Active`}
            </span>
          </div>
        </div>

        {/* Timeline list */}
        <div className="relative">
          {/* Continuous vertical connecting line */}
          <div className="absolute left-[19px] sm:left-[23px] top-5 bottom-8 w-1 bg-gray-100 rounded-full" />
          
          {/* Animated active fill progress line */}
          <div
            className="absolute left-[19px] sm:left-[23px] top-5 w-1 bg-gradient-to-b from-agri-500 to-highway-500 rounded-full transition-all duration-700 ease-in-out"
            style={{
              height: `${(activeStage / (stages.length - 1)) * 82}%`,
            }}
          />

          <div className="space-y-6 sm:space-y-7">
            {stages.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isCompleted = idx < activeStage;
              const isActive = idx === activeStage;
              const isFuture = idx > activeStage;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveStage(idx)}
                  className="relative flex items-start gap-4 sm:gap-6 cursor-pointer group"
                >
                  {/* Left Column: Stage Status Circle Node */}
                  <div className="relative z-10 flex-shrink-0 pt-1">
                    {isCompleted && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-agri-600 text-white flex items-center justify-center shadow-md ring-4 ring-agri-100 transition-transform group-hover:scale-105">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    )}

                    {isActive && (
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${stage.color} text-white flex items-center justify-center shadow-lg ring-4 ring-agri-200 animate-pulse transition-transform group-hover:scale-105`}>
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-sm animate-ping" />
                      </div>
                    )}

                    {isFuture && (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 border-2 border-gray-300 text-gray-400 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Stage Detail Card */}
                  <div
                    className={`flex-1 rounded-2xl p-4 sm:p-5 transition-all duration-300 ${
                      isActive
                        ? 'bg-white border-2 border-agri-500 ring-4 ring-agri-50 shadow-md translate-x-0.5'
                        : isCompleted
                        ? 'bg-slate-50/70 border border-gray-200 hover:bg-white hover:shadow-sm'
                        : 'bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${stage.lightColor} flex items-center justify-center shadow-sm flex-shrink-0`}
                        >
                          <StageIcon className={`w-5 h-5 ${stage.textColor}`} />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                            {lang === 'mr' ? `टप्पा ०${idx + 1}` : `Stage 0${idx + 1}`}
                          </span>
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                            {stage.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Time Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <span>{stage.time}</span>
                        </div>

                        {/* Live/Status Pill */}
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-agri-100 text-agri-700 border border-agri-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-agri-600 animate-ping" />
                            {lang === 'mr' ? 'चालू टप्पा' : 'LIVE NOW'}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-200/70 text-gray-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-agri-600" />
                            {lang === 'mr' ? 'पूर्ण' : 'Completed'}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2.5 leading-relaxed pl-0 sm:pl-12">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: Today's Live Statistics */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-gray-100 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-agri-600 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {t(lang, 'todayStats')}
            </h2>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            {lang === 'mr' ? 'दर तासाला रिअल-टाइम अपडेट' : 'Real-time Hourly Updates'}
          </span>
        </div>

        {/* 4-column grid (2x2 on mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {statItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={`bg-slate-50/70 rounded-2xl p-4 sm:p-5 border ${stat.cardBorder} flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all duration-200`}
              >
                <div
                  className={`w-12 h-12 rounded-full ${stat.bgCircle} flex items-center justify-center mb-3 shadow-inner`}
                >
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
