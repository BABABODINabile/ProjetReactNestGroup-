import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FaWallet, FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";
import KpiCard from '../../components/KpiCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardHome() {
  const [stats, setStats] = useState({ kpis: [], pieChart: [], lineChart: [] });
  const [loading, setLoading] = useState(true);

  // Filtre global : mois / année
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const API_URL = "http://localhost:3000";

  // 1. Récupération des données via l'API native fetch
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const month = Number(selectedMonth);
        const year = Number(selectedYear);

        if (isNaN(month) || isNaN(year)) {
          console.error('Mois ou année invalide');
          return;
        }

        // Récupération avec le token JWT stocké (requis par votre JwtAuthGuard) [cite: 10, 18]
        const response = await fetch(`${API_URL}/transactions/stats?month=${month}&year=${year}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // [cite: 10]
          }
        });

        if (!response.ok) throw new Error('Erreur réseau');
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Erreur stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedMonth, selectedYear]);

  // 2. Calcul des valeurs pour les KpiCard
  const kpiValues = useMemo(() => {
    const kpiData = Array.isArray(stats?.kpis) ? stats.kpis : [];
    const recettes = Number(kpiData.find(t => t.type === 'Recette')?.sum || 0);
    const depenses = Number(kpiData.find(t => t.type === 'Dépense')?.sum || 0);
    
    // On récupère le solde global envoyé par le backend (ou 0 par défaut)
    const soldeGlobal = Number(stats?.currentBalance || 0);
    
    // Calcul du rapport du mois (différence locale)
    const rapportMois = recettes - depenses;

    return {
      recettes,
      depenses,
      rapportMois,
      soldeGlobal // <-- Nouvelle valeur
    };
  }, [stats.kpis, stats.currentBalance]);

  // Construire une série journalière complète pour le mois courant
  // Remplit les jours manquants avec 0 pour recettes/depenses
  const dailyData = useMemo(() => {
    const raw = Array.isArray(stats?.lineChart) ? stats.lineChart : [];
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const daysInMonth = new Date(year, month, 0).getDate();

    const map = new Map();
    for (const it of raw) {
      const d = Number(it.day);
      if (!Number.isNaN(d) && d >= 1 && d <= daysInMonth) {
        map.set(d, {
          day: d,
          recettes: Number(it.recettes) || 0,
          depenses: Number(it.depenses) || 0,
        });
      }
    }

    const series = [];
    for (let d = 1; d <= daysInMonth; d++) {
      series.push(map.get(d) || { day: d, recettes: 0, depenses: 0 });
    }

    return series;
  }, [stats.lineChart]);


  
  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <>
    {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 ">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg hover:scale-105 transition-transform">
            <MdDashboard className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent ">
              Tableau de Bord
            </h1>
            <p className="text-sm text-gray-500">
              Satistiques périodique
            </p>
          </div>
        </div>


          {/* Filtre global pour sélectionner mois/année */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">Période :</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[
              "Jan",
              "Fév",
              "Mar",
              "Avr",
              "Mai",
              "Juin",
              "Juil",
              "Aoû",
              "Sep",
              "Oct",
              "Nov",
              "Déc",
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 6 }).map((_, idx) => {
              const y = now.getFullYear() - 2 + idx; // 2 years back .. +3
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>

          <button
            onClick={() => {
              /* trigger re-fetch via state change already handled */
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Afficher
          </button>
        </div>

      </div>
  
    <div className="p-6 bg-gray-50 mt-10 flex flex-col  ">
        
      {/* Rendu des indicateurs clés (KPIs) [cite: 60, 68] */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        

        <KpiCard
          title="Rapport du mois"
          value={`${kpiValues.rapportMois.toLocaleString()} FCFA`}
          color="bg-blue-600"
          icon={FaChartLine}
        />
        
        <KpiCard
          title="Recettes (Mois)"
          value={`${kpiValues.recettes.toLocaleString()} FCFA`}
          color="bg-green-500"
          icon={FaArrowUp}
        />

        <KpiCard
          title="Dépenses (Mois)"
          value={`${kpiValues.depenses.toLocaleString()} FCFA`}
          color="bg-red-500"
          icon={FaArrowDown}
        />

        <KpiCard
          title="Solde Total (Global)"
          value={`${kpiValues.soldeGlobal.toLocaleString()} FCFA`}
          color="bg-indigo-700" // Couleur distincte pour le différencier du mois
          icon={FaWallet}
        />
      </div>
     
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Évolution temporelle (LineChart) [cite: 53, 63] */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" /> Tendances Mensuelles
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis
                  tickFormatter={(value) =>
                    Number(value).toLocaleString("fr-FR")
                  }
                  width="auto"
                />
                <Tooltip
                  formatter={(value) =>
                    `${Number(value).toLocaleString("fr-FR")} FCFA`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="recettes"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="Recettes"
                />
                <Line
                  type="monotone"
                  dataKey="depenses"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Dépenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventilation par catégorie (PieChart) [cite: 59, 61] */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Répartition des Dépenses
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieChart}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ label, percent }) =>
                    `${label} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {stats.pieChart.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  </>
  );
  
}