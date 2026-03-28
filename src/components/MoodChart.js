import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';
import '../styles/MoodChart.css';

function MoodChart() {
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchScores() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: checks, error } = await supabase
          .from('user_checkins')
          .select('created_at, stress_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(7);

        if (error) throw error;
        
        if (checks && checks.length > 0) {
          // reverse to map chronologically left to right visually in Recharts
          const formatted = checks.reverse().map(c => {
             const d = new Date(c.created_at);
             const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
             const neDays = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि'];
             return {
               name: isEn ? enDays[d.getDay()] : neDays[d.getDay()],
               score: c.stress_score
             };
          });
          setData(formatted);
        }
      } catch (e) {
        console.error('Failed to load mood chart data:', e);
      }
    }
    fetchScores();
  }, [isEn]);

  if (data.length === 0) {
    return (
      <div className="mood-chart-empty" style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontStyle: 'italic' }}>
        {isEn ? "No check-ins yet. Take your first assessment!" : "अहिलेसम्म कुनै तथ्याङ्क छैन। आफ्नो पहिलो जाँच गर्नुहोस्!"}
      </div>
    );
  }

  return (
    <div className="mood-chart" style={{ width: '100%', height: '220px', marginTop: '1rem', background: 'var(--color-bg-cream)', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <XAxis 
            dataKey="name" 
            stroke="var(--color-primary-sage)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            domain={[0, 20]} 
            hide={true} 
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'white' }}
            labelStyle={{ color: 'var(--color-deep-indigo)', fontWeight: 'bold' }}
            itemStyle={{ color: 'var(--color-warm-terracotta)', fontWeight: '600' }}
            formatter={(value) => [value, isEn ? "Stress Score" : "तनाव स्कोर"]}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="var(--color-warm-terracotta)" 
            strokeWidth={3} 
            dot={{ fill: 'var(--color-muted-gold)', r: 5, strokeWidth: 0 }}
            activeDot={{ r: 8, fill: 'var(--color-deep-indigo)' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MoodChart;
