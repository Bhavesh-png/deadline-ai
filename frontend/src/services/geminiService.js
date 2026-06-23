// Gemini & NVIDIA AI Service – DeadlineAI
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function getProviderConfig() {
  const provider = localStorage.getItem('ai_provider') || 'gemini';
  const geminiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  const nvidiaKey = localStorage.getItem('nvidia_api_key') || import.meta.env.VITE_NVIDIA_API_KEY || '';
  return { provider, geminiKey, nvidiaKey };
}

let genAI = null;
let model = null;

function getModel() {
  const { provider, geminiKey } = getProviderConfig();
  if (provider !== 'gemini' || !geminiKey || geminiKey === 'your-gemini-api-key') {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(geminiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }
  return model;
}

async function getAuthHeader() {
  const user = auth.currentUser;
  const { provider, geminiKey, nvidiaKey } = getProviderConfig();
  
  const headers = {
    'Content-Type': 'application/json',
    'X-AI-Provider': provider,
  };
  
  if (geminiKey && geminiKey !== 'your-gemini-api-key') headers['X-Gemini-API-Key'] = geminiKey;
  if (nvidiaKey && nvidiaKey !== 'your-nvidia-api-key') headers['X-NVIDIA-API-Key'] = nvidiaKey;

  if (user) {
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
      return headers;
    } catch (err) {
      console.warn('Failed to fetch Firebase auth token:', err);
    }
  }
  
  headers['Authorization'] = 'Bearer demo-token';
  return headers;
}

// Client side call to NVIDIA NIM endpoints
async function callNvidiaClientSide(prompt, apiKey) {
  if (!apiKey || apiKey === 'your-nvidia-api-key') {
    throw new Error('No NVIDIA API Key configured.');
  }
  const url = 'https://integrate.api.nvidia.com/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1024
    })
  });
  if (!res.ok) {
    throw new Error(`NVIDIA Client-Side Request Failed: ${res.statusText}`);
  }
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// Mock AI responses for demo mode (if both client AI and Backend API fail)
const MOCK_RESPONSES = {
  analyze: (task) => ({
    title: task,
    priority: 'medium',
    estimatedHours: 24,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtasks: [
      { id: '1', title: 'Research and planning', estimatedHours: 3, done: false },
      { id: '2', title: 'Design UI/UX mockups', estimatedHours: 4, done: false },
      { id: '3', title: 'Build core features', estimatedHours: 8, done: false },
      { id: '4', title: 'Integrate AI functionality', estimatedHours: 4, done: false },
      { id: '5', title: 'Testing and debugging', estimatedHours: 3, done: false },
      { id: '6', title: 'Documentation and deployment', estimatedHours: 2, done: false },
    ],
    tags: ['development', 'design', 'deadline-critical'],
    urgency: 9,
    complexity: 8,
    recommendation: 'Start immediately. Break into daily 4-hour sessions for optimal productivity.',
  }),
  schedule: (task, subtasks, deadline) => {
    const days = [];
    const now = new Date();
    subtasks.forEach((st, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        activity: st.title,
        hours: st.estimatedHours || st.estimated_hours || 3,
        subtaskId: st.id,
      });
    });
    return days;
  },
};

export async function analyzeTask(userInput) {
  const { provider, nvidiaKey } = getProviderConfig();

  // Try calling Nvidia directly if key is set
  if (provider === 'nvidia' && nvidiaKey && nvidiaKey !== 'your-nvidia-api-key') {
    const prompt = `You are an expert AI planning agent for DeadlineAI.
    
Analyze this task and respond with ONLY valid JSON (no markdown, no code blocks):
Task: "${userInput}"

Required JSON structure:
{
  "title": "clean task title",
  "priority": "high|medium|low",
  "estimatedHours": <number>,
  "deadline": "YYYY-MM-DD (infer from context or set 7 days from now)",
  "subtasks": [
    { "id": "1", "title": "subtask name", "estimatedHours": <number>, "done": false }
  ],
  "tags": ["tag1", "tag2"],
  "urgency": <1-10>,
  "complexity": <1-10>,
  "recommendation": "brief actionable advice"
}

Respond with ONLY the JSON object, nothing else.`;
    try {
      const text = await callNvidiaClientSide(prompt, nvidiaKey);
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn('NVIDIA client-side analyzeTask call failed, trying backend fallback:', err);
    }
  }

  const m = getModel();
  if (!m) {
    // Try FastAPI Backend first
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/ai/analyze-task`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ user_input: userInput }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || userInput,
          priority: data.priority || 'medium',
          estimatedHours: data.estimated_hours || data.estimatedHours || 24,
          deadline: data.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          subtasks: (data.subtasks || []).map(st => ({
            id: st.id,
            title: st.title,
            estimatedHours: st.estimated_hours || st.estimatedHours || 3,
            done: st.done || false,
          })),
          tags: data.tags || ['development'],
          urgency: data.urgency || 5,
          complexity: data.complexity || 5,
          recommendation: data.recommendation || 'Plan created successfully.',
        };
      }
    } catch (err) {
      console.warn('Backend analyze-task call failed, using local mock:', err);
    }
    await new Promise(r => setTimeout(r, 1200));
    return MOCK_RESPONSES.analyze(userInput);
  }

  const prompt = `You are an expert AI productivity coach for DeadlineAI.
  
Analyze this task and respond with ONLY valid JSON (no markdown, no code blocks):
Task: "${userInput}"

Required JSON structure:
{
  "title": "clean task title",
  "priority": "high|medium|low",
  "estimatedHours": <number>,
  "deadline": "YYYY-MM-DD (infer from context or set 7 days from now)",
  "subtasks": [
    { "id": "1", "title": "subtask name", "estimatedHours": <number>, "done": false }
  ],
  "tags": ["tag1", "tag2"],
  "urgency": <1-10>,
  "complexity": <1-10>,
  "recommendation": "brief actionable advice"
}

Respond with ONLY the JSON object, nothing else.`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('Gemini parse error, using mock:', err);
    return MOCK_RESPONSES.analyze(userInput);
  }
}

export async function generateSchedule(taskTitle, subtasks, deadline) {
  const { provider, nvidiaKey } = getProviderConfig();

  if (provider === 'nvidia' && nvidiaKey && nvidiaKey !== 'your-nvidia-api-key') {
    const prompt = `You are an expert AI scheduler for DeadlineAI.

Create an optimal daily schedule for this task.

Task: "${taskTitle}"
Deadline: ${deadline}
Subtasks: ${JSON.stringify(subtasks)}
Today: ${new Date().toISOString().split('T')[0]}

Respond with ONLY valid JSON array (no markdown, no code blocks):
[
  { "date": "YYYY-MM-DD", "activity": "description", "hours": <number>, "subtaskId": "id" }
]`;
    try {
      const text = await callNvidiaClientSide(prompt, nvidiaKey);
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn('NVIDIA client-side generateSchedule call failed, trying backend fallback:', err);
    }
  }

  const m = getModel();
  if (!m) {
    // Try FastAPI Backend first
    try {
      const headers = await getAuthHeader();
      const mappedSubtasks = subtasks.map(st => ({
        id: st.id,
        title: st.title,
        done: st.done || false,
        estimated_hours: st.estimatedHours || st.estimated_hours || 3,
      }));
      const res = await fetch(`${API_BASE_URL}/ai/generate-schedule`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          task_title: taskTitle,
          subtasks: mappedSubtasks,
          deadline: deadline,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return (data.schedule || []).map(item => ({
          date: item.date,
          activity: item.activity,
          hours: item.hours || 2,
          subtaskId: item.subtask_id || item.subtaskId,
        }));
      }
    } catch (err) {
      console.warn('Backend generate-schedule call failed, using local mock:', err);
    }
    await new Promise(r => setTimeout(r, 800));
    return MOCK_RESPONSES.schedule(taskTitle, subtasks, deadline);
  }

  const prompt = `You are an expert AI scheduler for DeadlineAI.

Create an optimal daily schedule for this task.

Task: "${taskTitle}"
Deadline: ${deadline}
Subtasks: ${JSON.stringify(subtasks)}
Today: ${new Date().toISOString().split('T')[0]}

Respond with ONLY valid JSON array (no markdown):
[
  { "date": "YYYY-MM-DD", "activity": "description", "hours": <number>, "subtaskId": "id" }
]`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return MOCK_RESPONSES.schedule(taskTitle, subtasks, deadline);
  }
}

export async function rescheduleTask(task, missedDate, reason = '') {
  const { provider, nvidiaKey } = getProviderConfig();

  if (provider === 'nvidia' && nvidiaKey && nvidiaKey !== 'your-nvidia-api-key') {
    const prompt = `You are an empathetic AI coach. A user missed a deadline.

Task: "${task.title}"
Deadline: ${task.deadline}
Missed date: ${missedDate}
Reason: ${reason || 'Not specified'}
Remaining subtasks: ${JSON.stringify(task.subtasks?.filter(s => !s.done))}

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "message": "empathetic motivational message (2 sentences)",
  "newSchedule": [
    { "date": "YYYY-MM-DD", "activity": "description", "hours": <number> }
  ]
}`;
    try {
      const text = await callNvidiaClientSide(prompt, nvidiaKey);
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn('NVIDIA client-side rescheduleTask call failed, trying backend fallback:', err);
    }
  }

  const m = getModel();
  if (!m) {
    // Try FastAPI Backend first
    try {
      const headers = await getAuthHeader();
      const mappedSubtasks = (task.subtasks || []).map(st => ({
        id: st.id,
        title: st.title,
        done: st.done || false,
        estimated_hours: st.estimatedHours || st.estimated_hours || 3,
      }));
      const res = await fetch(`${API_BASE_URL}/ai/reschedule`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          task_id: task.id || 'temp',
          missed_date: missedDate,
          reason: reason,
          task_title: task.title,
          deadline: task.deadline,
          subtasks: mappedSubtasks,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const sched = (data.new_schedule || data.newSchedule || []).map(item => ({
          date: item.date,
          activity: item.activity,
          hours: item.hours || 2,
          subtaskId: item.subtask_id || item.subtaskId,
        }));
        return {
          message: data.message || "I've rescheduled your remaining tasks.",
          newSchedule: sched,
        };
      }
    } catch (err) {
      console.warn('Backend reschedule call failed, using local mock:', err);
    }
    await new Promise(r => setTimeout(r, 800));
    return {
      message: `No worries! I've rescheduled your task starting from tomorrow.`,
      newSchedule: MOCK_RESPONSES.schedule(task.title, task.subtasks || [], task.deadline),
    };
  }

  const prompt = `You are an empathetic AI coach. A user missed a deadline.

Task: "${task.title}"
Deadline: ${task.deadline}
Missed date: ${missedDate}
Reason: ${reason || 'Not specified'}
Remaining subtasks: ${JSON.stringify(task.subtasks?.filter(s => !s.done))}

Respond with ONLY valid JSON:
{
  "message": "empathetic motivational message (2 sentences)",
  "newSchedule": [
    { "date": "YYYY-MM-DD", "activity": "description", "hours": <number> }
  ]
}`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return {
      message: `No worries! I've rescheduled your task for optimal completion.`,
      newSchedule: [],
    };
  }
}

export async function getProductivityInsights(completedTasks, pendingTasks) {
  const m = getModel();
  if (!m) {
    // Try FastAPI Backend first
    try {
      const userId = auth.currentUser?.uid || 'demo-user-123';
      const headers = await getAuthHeader();
      const res = await fetch(
        `${API_BASE_URL}/analytics?user_id=${userId}&completed=${completedTasks}&pending=${pendingTasks}&streak=7`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        const a = data.analytics || {};
        return {
          score: a.score || 78,
          insights: a.insights || [
            'You work most efficiently in focused 90-minute sessions.',
            'Breaking tasks into subtasks increases your throughput significantly.',
          ],
          weeklyTrend: a.weekly_trend || a.weeklyTrend || 'improving',
          recommendation: a.recommendation || 'Focus on your top priorities each morning.',
        };
      }
    } catch (err) {
      console.warn('Backend analytics call failed, using local mock:', err);
    }
    await new Promise(r => setTimeout(r, 800));
    return {
      score: 78,
      insights: [
        'You complete most tasks in the morning – schedule important work before noon.',
        'Your average completion rate this week is 78%, up 12% from last week.',
        'Consider breaking large tasks into 2-hour focused sessions.',
      ],
      weeklyTrend: 'improving',
      recommendation: 'Focus on your top 3 priorities each morning for maximum impact.',
    };
  }

  const prompt = `You are an AI productivity analyst.

Analyze this user's productivity data and respond with ONLY valid JSON:

Completed tasks this week: ${completedTasks}
Pending tasks: ${pendingTasks}

{
  "score": <0-100>,
  "insights": ["insight1", "insight2", "insight3"],
  "weeklyTrend": "improving|declining|stable",
  "recommendation": "one actionable recommendation"
}`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return { score: 75, insights: [], weeklyTrend: 'stable', recommendation: 'Keep going!' };
  }
}

export async function chatWithAI(message, context = {}) {
  const { provider, nvidiaKey } = getProviderConfig();

  if (provider === 'nvidia' && nvidiaKey && nvidiaKey !== 'your-nvidia-api-key') {
    const prompt = `You are DeadlineAI, an empathetic and proactive AI productivity coach. 
You help users manage tasks, meet deadlines, and stay motivated. 
Keep responses concise (2-3 sentences max), actionable, and encouraging.
Current user context: ${JSON.stringify(context)}

User: ${message}`;
    try {
      return await callNvidiaClientSide(prompt, nvidiaKey);
    } catch (err) {
      console.warn('NVIDIA client-side chatWithAI call failed, trying backend fallback:', err);
    }
  }

  const m = getModel();
  if (!m) {
    // Try Backend AI chat agent or use random local response
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message, context }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.response;
      }
    } catch (err) {
      // ignore, fall through
    }
    await new Promise(r => setTimeout(r, 1000));
    const responses = [
      "I've analyzed your tasks and suggest focusing on the highest priority items first. Your deadline is approaching!",
      "Great progress! You've completed your tasks today. Keep this momentum going – you're on track to finish before your deadline.",
      "I notice you have a task due tomorrow. Let me help you break it down into manageable pieces for tonight.",
      "Based on your productivity patterns, you work best in focused 90-minute sessions. Try the Pomodoro technique!",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  const systemPrompt = `You are DeadlineAI, an empathetic and proactive AI productivity coach. 
You help users manage tasks, meet deadlines, and stay motivated. 
Keep responses concise (2-3 sentences max), actionable, and encouraging.
Current user context: ${JSON.stringify(context)}`;

  try {
    const result = await m.generateContent(`${systemPrompt}\n\nUser: ${message}`);
    return result.response.text().trim();
  } catch (err) {
    return "I'm here to help you stay on track! What would you like to work on today?";
  }
}
