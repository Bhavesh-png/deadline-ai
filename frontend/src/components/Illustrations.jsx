/* ─── Inline SVG Illustrations for DeadlineAI ─────────────────────────────── */

/* Dashboard – AI Productivity */
export function IllustrationDashboard({ className = '' }) {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="20" y="30" width="280" height="160" rx="16" fill="url(#db-bg)" opacity="0.6"/>
      {/* Bar chart */}
      <rect x="50" y="120" width="24" height="50" rx="6" fill="#6366f1" opacity="0.7"/>
      <rect x="86" y="95" width="24" height="75" rx="6" fill="#8b5cf6" opacity="0.8"/>
      <rect x="122" y="75" width="24" height="95" rx="6" fill="#6366f1" opacity="0.9"/>
      <rect x="158" y="100" width="24" height="70" rx="6" fill="#06b6d4" opacity="0.7"/>
      <rect x="194" y="65" width="24" height="105" rx="6" fill="#8b5cf6"/>
      <rect x="230" y="85" width="24" height="85" rx="6" fill="#6366f1" opacity="0.85"/>
      {/* Trend line */}
      <polyline points="62,118 98,93 134,73 170,98 206,63 242,83" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Dots */}
      {[[62,118],[98,93],[134,73],[170,98],[206,63],[242,83]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#06b6d4" stroke="#0f172a" strokeWidth="2"/>
      ))}
      {/* Brain icon */}
      <circle cx="270" cy="55" r="20" fill="url(#brain-grad)" opacity="0.9"/>
      <path d="M263 55 Q267 48 275 52 Q275 60 270 63 Q267 65 263 62 Z" fill="white" opacity="0.8"/>
      <path d="M270 52 Q277 48 280 55 Q278 62 273 63" stroke="white" strokeWidth="1.5" fill="none"/>
      {/* Stats chips */}
      <rect x="50" y="38" width="60" height="20" rx="10" fill="rgba(99,102,241,0.3)" stroke="rgba(99,102,241,0.5)" strokeWidth="1"/>
      <text x="80" y="52" textAnchor="middle" fill="#a5b4fc" fontSize="9" fontWeight="600">94% Rate</text>
      <rect x="125" y="38" width="60" height="20" rx="10" fill="rgba(16,185,129,0.2)" stroke="rgba(16,185,129,0.4)" strokeWidth="1"/>
      <text x="155" y="52" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="600">↑ 12% Today</text>
      <defs>
        <linearGradient id="db-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1b4b"/>
          <stop offset="100%" stopColor="#0c0e1a"/>
        </linearGradient>
        <linearGradient id="brain-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Tasks – Kanban Board */
export function IllustrationTasks({ className = '' }) {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Three kanban columns */}
      {[
        { x: 20, color: '#94a3b8', label: 'To Do', items: [60, 90, 115] },
        { x: 120, color: '#6366f1', label: 'In Progress', items: [60, 90] },
        { x: 220, color: '#10b981', label: 'Done', items: [60, 90, 115, 140] },
      ].map(({ x, color, label, items }) => (
        <g key={label}>
          <rect x={x} y="30" width="90" height="165" rx="12" fill="rgba(255,255,255,0.03)" stroke={`${color}30`} strokeWidth="1"/>
          {/* Column header */}
          <circle cx={x + 10} cy="48" r="5" fill={color}/>
          <text x={x + 20} y="52" fill={color} fontSize="9" fontWeight="700">{label}</text>
          {/* Task cards */}
          {items.map((y, i) => (
            <g key={i}>
              <rect x={x + 8} y={y} width="74" height="22" rx="6" fill={`${color}15`} stroke={`${color}25`} strokeWidth="1"/>
              <rect x={x + 14} y={y + 7} width="30" height="3" rx="1.5" fill={`${color}60`}/>
              <rect x={x + 14} y={y + 13} width="20" height="2.5" rx="1.25" fill={`${color}40`}/>
              {label === 'Done' && <path d={`M${x + 67} ${y + 8} l3 3 5-5`} stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
            </g>
          ))}
        </g>
      ))}
      {/* Floating drag card */}
      <rect x="108" y="85" width="84" height="30" rx="8" fill="#4f46e5" opacity="0.95" style={{ filter: 'drop-shadow(0 8px 20px rgba(79,70,229,0.5))' }}/>
      <rect x="118" y="93" width="35" height="3" rx="1.5" fill="white" opacity="0.8"/>
      <rect x="118" y="100" width="25" height="2.5" rx="1.25" fill="white" opacity="0.5"/>
      <defs/>
    </svg>
  );
}

/* Calendar – Scheduling */
export function IllustrationCalendar({ className = '' }) {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="30" y="30" width="260" height="165" rx="16" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.2)" strokeWidth="1"/>
      {/* Header bar */}
      <rect x="30" y="30" width="260" height="40" rx="16" fill="url(#cal-header)"/>
      <rect x="30" y="54" width="260" height="16" fill="url(#cal-header)"/>
      <text x="160" y="55" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">June 2026</text>
      {/* Nav arrows */}
      <path d="M50 50 l-6 0 m6-5 l-6 5 6 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      <path d="M270 50 l6 0 m-6-5 l6 5-6 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      {/* Day headers */}
      {['S','M','T','W','T','F','S'].map((d, i) => (
        <text key={i} x={52 + i * 34} y="85" textAnchor="middle" fill="#64748b" fontSize="8.5" fontWeight="600">{d}</text>
      ))}
      {/* Calendar cells */}
      {[...Array(30)].map((_, i) => {
        const col = i % 7; const row = Math.floor(i / 7);
        const x = 52 + col * 34; const y = 100 + row * 26;
        const day = i + 1;
        const isToday = day === 23;
        const hasEvent = [5,12,19,23,28].includes(day);
        const isDeadline = [29].includes(day);
        return (
          <g key={i}>
            {isToday && <circle cx={x} cy={y} r="11" fill="url(#cal-today)"/>}
            {isDeadline && <circle cx={x} cy={y} r="11" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth="1"/>}
            <text x={x} y={y + 3.5} textAnchor="middle" fill={isToday ? 'white' : isDeadline ? '#fca5a5' : '#94a3b8'} fontSize="9" fontWeight={isToday ? '700' : '400'}>{day <= 30 ? day : ''}</text>
            {hasEvent && !isToday && <circle cx={x} cy={y + 8} r="2" fill="#06b6d4" opacity="0.8"/>}
          </g>
        );
      })}
      <defs>
        <linearGradient id="cal-header" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0891b2"/>
          <stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient>
        <linearGradient id="cal-today" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Analytics – Data Charts */
export function IllustrationAnalytics({ className = '' }) {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Background */}
      <rect x="15" y="20" width="290" height="180" rx="16" fill="rgba(16,185,129,0.04)" stroke="rgba(16,185,129,0.15)" strokeWidth="1"/>
      {/* Area chart */}
      <path d="M40 160 Q70 140 100 120 Q130 100 160 85 Q190 70 220 60 Q250 55 280 50 L280 170 L40 170 Z" fill="url(#analytics-area)" opacity="0.4"/>
      <path d="M40 160 Q70 140 100 120 Q130 100 160 85 Q190 70 220 60 Q250 55 280 50" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Data points */}
      {[[100,120],[160,85],[220,60],[280,50]].map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#10b981" stroke="#0f172a" strokeWidth="2"/>
          <circle cx={x} cy={y} r="10" fill="#10b981" opacity="0.15"/>
        </g>
      ))}
      {/* Donut chart */}
      <circle cx="70" cy="90" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
      <circle cx="70" cy="90" r="38" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray="72 167" strokeLinecap="round" transform="rotate(-90 70 90)"/>
      <circle cx="70" cy="90" r="38" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="50 167" strokeLinecap="round" strokeDashoffset="-72" transform="rotate(-90 70 90)"/>
      <circle cx="70" cy="90" r="38" fill="none" stroke="#06b6d4" strokeWidth="12" strokeDasharray="30 167" strokeLinecap="round" strokeDashoffset="-122" transform="rotate(-90 70 90)"/>
      <text x="70" y="87" textAnchor="middle" fill="white" fontSize="14" fontWeight="800">94%</text>
      <text x="70" y="98" textAnchor="middle" fill="#64748b" fontSize="7">Score</text>
      {/* KPI cards */}
      {[
        { x: 145, label: 'Completed', value: '23', color: '#10b981' },
        { x: 215, label: 'Streak',    value: '7d',  color: '#f59e0b' },
      ].map(({ x, label, value, color }) => (
        <g key={label}>
          <rect x={x} y="145" width="60" height="40" rx="10" fill={`${color}12`} stroke={`${color}25`} strokeWidth="1"/>
          <text x={x + 30} y="162" textAnchor="middle" fill={color} fontSize="13" fontWeight="800">{value}</text>
          <text x={x + 30} y="175" textAnchor="middle" fill="#64748b" fontSize="7.5">{label}</text>
        </g>
      ))}
      <defs>
        <linearGradient id="analytics-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/* AI Assistant – Chatbot */
export function IllustrationAI({ className = '' }) {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Bot head */}
      <rect x="110" y="20" width="100" height="90" rx="20" fill="url(#ai-bot)"/>
      {/* Eyes */}
      <circle cx="140" cy="55" r="12" fill="rgba(255,255,255,0.2)"/>
      <circle cx="180" cy="55" r="12" fill="rgba(255,255,255,0.2)"/>
      <circle cx="140" cy="55" r="6" fill="white"/>
      <circle cx="180" cy="55" r="6" fill="white"/>
      <circle cx="142" cy="53" r="2.5" fill="#0f172a"/>
      <circle cx="182" cy="53" r="2.5" fill="#0f172a"/>
      {/* Mouth */}
      <path d="M148 75 Q160 82 172 75" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Antenna */}
      <line x1="160" y1="20" x2="160" y2="8" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="160" cy="6" r="4" fill="#8b5cf6"/>
      {/* Chat bubbles */}
      <rect x="20" y="125" width="160" height="35" rx="12" fill="url(#ai-bubble1)"/>
      <path d="M50 160 l-10 10 10-2" fill="url(#ai-bubble1)"/>
      <text x="100" y="146" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="500">How can I help you</text>
      <text x="100" y="156" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="500">stay productive today?</text>
      <rect x="140" y="168" width="150" height="30" rx="10" fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.3)" strokeWidth="1"/>
      <path d="M270 198 l10 8-2-10" fill="rgba(99,102,241,0.3)"/>
      <text x="215" y="187" textAnchor="middle" fill="#a5b4fc" fontSize="8">Plan my day for me!</text>
      {/* Stars / sparkles */}
      {[[30,35],[285,140],[60,200]].map(([x,y],i)=>(
        <path key={i} d={`M${x} ${y} l2 6 6 2-6 2-2 6-2-6-6-2 6-2 z`} fill="#f59e0b" opacity="0.7" transform={`scale(${0.5+i*0.2})`}/>
      ))}
      <defs>
        <linearGradient id="ai-bot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
        <linearGradient id="ai-bubble1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4f46e5"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Settings – Gear/Control Panel */
export function IllustrationSettings({ className = '' }) {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Main gear */}
      <g transform="translate(160,110)">
        <circle r="32" fill="url(#settings-gear)" opacity="0.9"/>
        <circle r="14" fill="#0f172a"/>
        <circle r="8" fill="rgba(245,158,11,0.3)" stroke="rgba(245,158,11,0.6)" strokeWidth="1"/>
        {[0,45,90,135,180,225,270,315].map((angle,i)=>(
          <rect key={i} x="-5" y="-44" width="10" height="14" rx="4" fill="url(#settings-gear)" transform={`rotate(${angle})`}/>
        ))}
      </g>
      {/* Small gears */}
      <g transform="translate(80,80)">
        <circle r="18" fill="rgba(99,102,241,0.3)" stroke="rgba(99,102,241,0.5)" strokeWidth="1"/>
        <circle r="8" fill="#0f172a"/>
        {[0,60,120,180,240,300].map((a,i)=>(
          <rect key={i} x="-3.5" y="-26" width="7" height="10" rx="3" fill="#6366f1" transform={`rotate(${a})`}/>
        ))}
      </g>
      <g transform="translate(250,80)">
        <circle r="22" fill="rgba(16,185,129,0.2)" stroke="rgba(16,185,129,0.4)" strokeWidth="1"/>
        <circle r="9" fill="#0f172a"/>
        {[0,51.4,102.8,154.2,205.6,257,308.4].map((a,i)=>(
          <rect key={i} x="-4" y="-30" width="8" height="12" rx="3" fill="#10b981" transform={`rotate(${a})`}/>
        ))}
      </g>
      {/* Toggle sliders */}
      {[
        { y: 158, label: 'Notifications', on: true,  color: '#6366f1' },
        { y: 178, label: 'AI Scheduling', on: true,  color: '#10b981' },
        { y: 198, label: 'Calendar Sync', on: false, color: '#94a3b8' },
      ].map(({ y, label, on, color }) => (
        <g key={label}>
          <text x="40" y={y + 4} fill="#64748b" fontSize="8.5">{label}</text>
          <rect x="230" y={y - 6} width="36" height="16" rx="8" fill={on ? color : 'rgba(148,163,184,0.2)'} stroke={on ? `${color}60` : 'rgba(148,163,184,0.3)'} strokeWidth="1"/>
          <circle cx={on ? 258 : 238} cy={y + 2} r="6" fill="white" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}/>
        </g>
      ))}
      <defs>
        <linearGradient id="settings-gear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#ef4444"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Empty state – No Tasks */
export function IllustrationEmpty({ className = '', message = 'Nothing here yet' }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Box */}
      <rect x="50" y="50" width="100" height="80" rx="10" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5"/>
      <rect x="50" y="50" width="100" height="25" rx="10" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5"/>
      {/* Flap */}
      <path d="M50 62 Q100 82 150 62" stroke="rgba(99,102,241,0.3)" strokeWidth="1.5" fill="none"/>
      {/* Question mark */}
      <text x="100" y="108" textAnchor="middle" fill="rgba(99,102,241,0.4)" fontSize="28" fontWeight="800">?</text>
      {/* Stars */}
      <circle cx="30" cy="40" r="3" fill="rgba(99,102,241,0.3)"/>
      <circle cx="175" cy="55" r="2" fill="rgba(139,92,246,0.3)"/>
      <circle cx="160" cy="140" r="4" fill="rgba(6,182,212,0.3)"/>
    </svg>
  );
}
