import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertsAndActions } from './components/AlertsAndActions';
import { AnalyticsSection } from './components/AnalyticsSection';
import { AqiHeroCard } from './components/AqiHeroCard';
import { CityComparisonWidget } from './components/CityComparisonWidget';
import { CompareCitiesView } from './components/CompareCitiesView';
import { DashboardHero } from './components/DashboardHero';
import { EducationView } from './components/EducationView';
import { Footer } from './components/Footer';
import { GeminiAssistant } from './components/GeminiAssistant';
import { HealthRecommendations } from './components/HealthRecommendations';
import { PollutantGrid } from './components/PollutantGrid';
import { SettingsView } from './components/SettingsView';
import { Sidebar, SidebarNavId } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { fetchAirQuality, reverseGeocode } from './services/api';
import {
  AirQualityResponse,
  AqiStandard,
  CityLocation,
  ForecastMetricKey,
} from './types/airQuality';
import {
  createDemoAirQualitySnapshot,
  formatHourLabel,
  formatPollutantValue,
  formatTimestamp,
  generateAlertsAndRecommendations,
  getAqiCategory,
  PRESET_CITIES,
} from './utils/aqi';

export default function App() {
  const [activeNav, setActiveNav] = useState<SidebarNavId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<CityLocation>(PRESET_CITIES[0]);
  const [aqiStandard, setAqiStandard] = useState<AqiStandard>('us_aqi');
  const [forecastMetric, setForecastMetric] = useState<ForecastMetricKey>('us_aqi');
  const [autoRefreshAi, setAutoRefreshAi] = useState(true);

  const [airQuality, setAirQuality] = useState<AirQualityResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const assistantRef = useRef<HTMLElement | null>(null);
  const analyticsRef = useRef<HTMLDivElement | null>(null);

  const loadCityAirQuality = useCallback(async (location: CityLocation) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await fetchAirQuality(location);
      setAirQuality(result);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Unable to fetch live air quality telemetry from Open-Meteo.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCityAirQuality(selectedLocation);
  }, [selectedLocation, loadCityAirQuality]);

  const handleSelectLocation = (loc: CityLocation) => {
    setLocationError(null);
    setSelectedLocation(loc);
  };

  const handleChangeStandard = (std: AqiStandard) => {
    setAqiStandard(std);
    if (forecastMetric === 'us_aqi' || forecastMetric === 'european_aqi') {
      setForecastMetric(std);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const resolvedLocation = await reverseGeocode(latitude, longitude);
          setSelectedLocation(resolvedLocation);
        } catch (err) {
          setLocationError(
            err instanceof Error ? err.message : 'Unable to resolve your current coordinates.'
          );
        } finally {
          setIsLocating(false);
        }
      },
      (geoErr) => {
        setIsLocating(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. Please search for your city manually.');
        } else if (geoErr.code === geoErr.TIMEOUT) {
          setLocationError('Location request timed out. Please try again or search by city name.');
        } else {
          setLocationError('Unable to determine your current location.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSelectPollutantForChart = (metric: ForecastMetricKey) => {
    setForecastMetric(metric);
    if (activeNav === 'live') {
      setActiveNav('forecast');
    } else {
      analyticsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoadDemoFallback = () => {
    setApiError(null);
    setAirQuality(createDemoAirQualitySnapshot(selectedLocation));
  };

  const alertsList = useMemo(() => {
    if (!airQuality) return [];
    return generateAlertsAndRecommendations(airQuality, aqiStandard).alerts;
  }, [airQuality, aqiStandard]);

  const lastUpdatedText = airQuality
    ? formatTimestamp(airQuality.current.time, airQuality.timezone)
    : null;

  const renderSkeleton = () => (
    <div className="space-y-6 animate-pulse" aria-live="polite" aria-busy="true">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 h-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 h-44" />
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-80" />
    </div>
  );

  const renderErrorState = () => (
    <div
      role="alert"
      className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
    >
      <div className="flex items-start gap-3.5">
        <AlertTriangle className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Live Air Quality Service Unavailable
          </h2>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">{apiError}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => void loadCityAirQuality(selectedLocation)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Live Data</span>
        </button>
        <button
          type="button"
          onClick={handleLoadDemoFallback}
          className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Load Labeled Demo Data
        </button>
      </div>
    </div>
  );

  const renderDemoBanner = (data: AirQualityResponse) => {
    if (!data.isDemoData) return null;
    return (
      <div
        role="status"
        className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs sm:text-sm text-amber-950">
            <strong className="font-semibold">DEMO DATA MODE:</strong>{' '}
            {data.demoNotice ||
              'Displaying illustrative sample measurements because the live API is currently unreachable.'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadCityAirQuality(selectedLocation)}
          className="px-3.5 py-1.5 text-xs font-medium bg-white border border-amber-300 text-amber-900 rounded-xl hover:bg-amber-100 whitespace-nowrap shrink-0"
        >
          Reconnect Live API
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900">
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          selectedLocation={selectedLocation}
          lastUpdatedText={lastUpdatedText}
          alerts={alertsList}
          aqiStandard={aqiStandard}
          isLocating={isLocating}
          locationError={locationError}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSelectLocation={handleSelectLocation}
          onUseCurrentLocation={handleUseCurrentLocation}
          onNavigate={setActiveNav}
          onChangeStandard={handleChangeStandard}
        />

        <main className="flex-1">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
            {/* Overview Workspace */}
            {activeNav === 'overview' && (
              <>
                <DashboardHero
                  selectedLocation={selectedLocation}
                  aqiStandard={aqiStandard}
                  isLoadingData={isLoading}
                  isLocating={isLocating}
                  onSelectLocation={handleSelectLocation}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  onChangeStandard={handleChangeStandard}
                  onRefresh={() => void loadCityAirQuality(selectedLocation)}
                />

                {isLoading && renderSkeleton()}
                {!isLoading && apiError && !airQuality && renderErrorState()}
                {!isLoading && airQuality && (
                  <motion.div
                    key={`${airQuality.location.id}-${airQuality.retrievedAt}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-7"
                  >
                    {apiError && renderErrorState()}
                    {renderDemoBanner(airQuality)}
                    <AqiHeroCard data={airQuality} standard={aqiStandard} />
                    <PollutantGrid
                      data={airQuality}
                      onSelectPollutantForChart={handleSelectPollutantForChart}
                    />
                    <div ref={analyticsRef}>
                      <AnalyticsSection
                        data={airQuality}
                        standard={aqiStandard}
                        selectedMetric={forecastMetric}
                        onSelectMetric={setForecastMetric}
                      />
                    </div>
                    <GeminiAssistant
                      airQuality={airQuality}
                      standard={aqiStandard}
                      sectionRef={assistantRef}
                      autoRefresh={autoRefreshAi}
                    />
                    <HealthRecommendations data={airQuality} standard={aqiStandard} />
                    <CityComparisonWidget
                      primaryData={airQuality}
                      standard={aqiStandard}
                      onOpenFullComparison={() => setActiveNav('compare')}
                    />
                  </motion.div>
                )}
              </>
            )}

            {/* Live Air Quality Focused View */}
            {activeNav === 'live' && (
              <>
                <DashboardHero
                  selectedLocation={selectedLocation}
                  aqiStandard={aqiStandard}
                  isLoadingData={isLoading}
                  isLocating={isLocating}
                  onSelectLocation={handleSelectLocation}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  onChangeStandard={handleChangeStandard}
                  onRefresh={() => void loadCityAirQuality(selectedLocation)}
                />
                {isLoading && renderSkeleton()}
                {!isLoading && apiError && !airQuality && renderErrorState()}
                {!isLoading && airQuality && (
                  <div className="space-y-7">
                    {renderDemoBanner(airQuality)}
                    <AqiHeroCard data={airQuality} standard={aqiStandard} />
                    <PollutantGrid
                      data={airQuality}
                      onSelectPollutantForChart={handleSelectPollutantForChart}
                    />
                    <AlertsAndActions data={airQuality} standard={aqiStandard} />
                  </div>
                )}
              </>
            )}

            {/* City Comparison View */}
            {activeNav === 'compare' && (
              <CompareCitiesView primaryData={airQuality} standard={aqiStandard} />
            )}

            {/* Forecast & Trends Analytics View */}
            {activeNav === 'forecast' && (
              <>
                <DashboardHero
                  selectedLocation={selectedLocation}
                  aqiStandard={aqiStandard}
                  isLoadingData={isLoading}
                  isLocating={isLocating}
                  onSelectLocation={handleSelectLocation}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  onChangeStandard={handleChangeStandard}
                  onRefresh={() => void loadCityAirQuality(selectedLocation)}
                />
                {isLoading && renderSkeleton()}
                {!isLoading && apiError && !airQuality && renderErrorState()}
                {!isLoading && airQuality && (
                  <div className="space-y-7">
                    {renderDemoBanner(airQuality)}
                    <AnalyticsSection
                      data={airQuality}
                      standard={aqiStandard}
                      selectedMetric={forecastMetric}
                      onSelectMetric={setForecastMetric}
                    />
                    <section
                      aria-label="24-Hour Tabular Air Quality Forecast"
                      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                    >
                      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h2 className="font-display text-lg font-bold text-slate-900">
                            Next 24 Hours · Hourly Breakdown ({airQuality.location.name})
                          </h2>
                          <p className="text-xs text-slate-500">
                            All pollutant concentrations in µg/m³ · Timezone {airQuality.timezone}
                          </p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600">
                              <th className="py-2.5 px-4 font-semibold">Hour</th>
                              <th className="py-2.5 px-4 font-semibold text-right">
                                {aqiStandard === 'european_aqi' ? 'EAQI' : 'US AQI'}
                              </th>
                              <th className="py-2.5 px-4 font-semibold">Category</th>
                              <th className="py-2.5 px-4 font-semibold text-right">PM2.5</th>
                              <th className="py-2.5 px-4 font-semibold text-right">PM10</th>
                              <th className="py-2.5 px-4 font-semibold text-right">O3</th>
                              <th className="py-2.5 px-4 font-semibold text-right">NO2</th>
                              <th className="py-2.5 px-4 font-semibold text-right">SO2</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {airQuality.hourly.slice(0, 24).map((pt) => {
                              const val = pt[aqiStandard];
                              const cat = getAqiCategory(val, aqiStandard);
                              return (
                                <tr key={pt.time} className="hover:bg-sky-50/40">
                                  <td className="py-2.5 px-4 font-mono text-slate-800 whitespace-nowrap">
                                    {pt.time.slice(5, 10)} · {formatHourLabel(pt.time)}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                                    {val !== null ? Math.round(val) : '—'}
                                  </td>
                                  <td className="py-2.5 px-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                                      <span className={`w-2 h-2 rounded-sm ${cat.barClass}`} />
                                      {cat.shortLabel}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                                    {formatPollutantValue(pt.pm2_5, 'pm2_5')}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                                    {formatPollutantValue(pt.pm10, 'pm10')}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                                    {formatPollutantValue(pt.ozone, 'ozone')}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                                    {formatPollutantValue(pt.nitrogen_dioxide, 'nitrogen_dioxide')}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                                    {formatPollutantValue(pt.sulphur_dioxide, 'sulphur_dioxide')}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>
                )}
              </>
            )}

            {/* Dedicated AI Health Assistant View */}
            {activeNav === 'assistant' && (
              <>
                {isLoading && renderSkeleton()}
                {!isLoading && apiError && !airQuality && renderErrorState()}
                {!isLoading && airQuality && (
                  <div className="space-y-7">
                    {renderDemoBanner(airQuality)}
                    <GeminiAssistant
                      airQuality={airQuality}
                      standard={aqiStandard}
                      sectionRef={assistantRef}
                      autoRefresh={autoRefreshAi}
                    />
                    <HealthRecommendations data={airQuality} standard={aqiStandard} />
                  </div>
                )}
              </>
            )}

            {/* Pollution Insights & Education View */}
            {activeNav === 'insights' && (
              <div className="space-y-7">
                {airQuality && <AlertsAndActions data={airQuality} standard={aqiStandard} />}
                <EducationView />
              </div>
            )}

            {/* Settings, About, Privacy & Attribution View */}
            {activeNav === 'settings' && (
              <SettingsView
                aqiStandard={aqiStandard}
                onChangeStandard={handleChangeStandard}
                selectedLocation={selectedLocation}
                onSelectLocation={handleSelectLocation}
                autoRefreshAi={autoRefreshAi}
                onToggleAutoRefreshAi={setAutoRefreshAi}
              />
            )}
          </div>
        </main>

        <Footer onNavigate={setActiveNav} />
      </div>
    </div>
  );
}
