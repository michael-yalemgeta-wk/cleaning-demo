"use client";

import { useEffect, useState } from "react";
import { Clock, Play, Pause, CheckCircle } from "lucide-react";

export default function TimeTrackingPage() {
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const [staffId, setStaffId] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("workerStaffId") || "";
    setStaffId(sid);
    loadTodaysSessions();
    
    const interval = setInterval(() => {
      if (isWorking && startTime) {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorking, startTime]);

  const loadTodaysSessions = () => {
    const stored = localStorage.getItem(`timeTracking_${new Date().toDateString()}`);
    if (stored) {
      setTodaySessions(JSON.parse(stored));
    }
  };

  const handleClockIn = () => {
    const now = new Date();
    setStartTime(now);
    setIsWorking(true);
  };

  const handleClockOut = () => {
    if (startTime) {
      const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const session = {
        id: `session-${Date.now()}`,
        startTime: startTime.toLocaleTimeString(),
        endTime: new Date().toLocaleTimeString(),
        duration,
        durationFormatted: formatDuration(duration),
        date: new Date().toDateString()
      };

      const newSessions = [...todaySessions, session];
      setTodaySessions(newSessions);
      localStorage.setItem(`timeTracking_${new Date().toDateString()}`, JSON.stringify(newSessions));

      setStartTime(null);
      setIsWorking(false);
      setElapsedTime(0);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalHoursToday = todaySessions.reduce((sum, s) => sum + s.duration, 0) + (isWorking ? elapsedTime : 0);

  return (
    <div className="section container">
      <h1 className="mb-lg">Time Tracking</h1>

      {/* Clock In/Out Section */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Current Session</p>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '1rem' }}>
            {formatDuration(elapsedTime)}
          </div>
        </div>

        {isWorking ? (
          <button onClick={handleClockOut} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', marginBottom: '1rem' }}>
            <Pause size={24} /> Clock Out
          </button>
        ) : (
          <button onClick={handleClockIn} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', marginBottom: '1rem' }}>
            <Play size={24} /> Clock In
          </button>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Sessions Today</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{todaySessions.length}</p>
          </div>
          <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Hours</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(totalHoursToday / 3600).toFixed(2)}h</p>
          </div>
        </div>
      </div>

      {/* Today's Sessions */}
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={24} /> Today's Work Sessions
        </h2>

        {todaySessions.length === 0 && !isWorking ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No work sessions today. Start tracking your time by clicking Clock In!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {todaySessions.map((session, idx) => (
              <div key={session.id} style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Session {idx + 1}</span>
                  <span style={{ 
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    background: '#dcfce7',
                    color: '#166534',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    <CheckCircle size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Completed
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Start Time</p>
                    <p style={{ fontWeight: 'bold' }}>{session.startTime}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>End Time</p>
                    <p style={{ fontWeight: 'bold' }}>{session.endTime}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Duration</p>
                    <p style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{session.durationFormatted}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
