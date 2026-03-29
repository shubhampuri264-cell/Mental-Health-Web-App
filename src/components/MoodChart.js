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
          const formatted = checks.reverse().map(c => {
             const d = new Date(c.created_at);
             const month = d.getMonth() + 1;
             const day = d.getDate();
             return {
               name: isEn ? `${month}/${day}` : `${day}/${month}`,
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

  const tierLabel = (value) => {
    if (value <= 5) return isEn ? 'Low' : 'कम';
    if (value <= 10) return isEn ? 'Mild' : 'हल्का';
    if (value <= 15) return isEn ? 'Moderate' : 'मध्यम';
    return isEn ? 'High' : 'उच्च';
  };

  return (
    <div className="mood-chart" style={{ width: '100%', marginTop: '1rem', background: 'var(--color-bg-cream)', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-deep-indigo)', marginBottom: '8px', textAlign: 'center' }}>
        {isEn ? 'Your Wellness Trend' : 'तपाईंको मानसिक स्वास्थ्य प्रवृत्ति'}
      </p>
      <div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
            <XAxis
              dataKey="name"
              stroke="var(--color-primary-sage)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
              tickFormatter={tierLabel}
              fontSize={10}
              stroke="var(--color-primary-sage)"
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'white' }}
              labelStyle={{ color: 'var(--color-deep-indigo)', fontWeight: 'bold' }}
              itemStyle={{ color: 'var(--color-warm-terracotta)', fontWeight: '600' }}
              formatter={(value) => [`${value}/20 — ${tierLabel(value)}`, isEn ? "Stress" : "तनाव"]}
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
      <p style={{ fontSize: '0.7rem', color: 'var(--color-muted-gray)', textAlign: 'center', marginTop: '4px' }}>
        {isEn ? 'Lower is better · Based on last 7 check-ins' : 'कम राम्रो हो · अन्तिम ७ जाँचमा आधारित'}
      </p>
    </div>
  );
}

export default MoodChart;
