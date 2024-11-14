// src/components/TournamentScheduler.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const TournamentScheduler = () => {
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState('');
  const [venues, setVenues] = useState([]);
  const [newVenue, setNewVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [teamStats, setTeamStats] = useState({});
  const [predictions, setPredictions] = useState([]);

  // AI model simulation for team strength calculation
  const calculateTeamStrength = (team) => {
    // Simulate AI calculation with multiple factors
    const baseStrength = Math.random() * 100;
    const recentForm = Math.random() * 20 - 10; // -10 to +10
    const consistency = Math.random() * 10;
    
    return Math.min(100, Math.max(0, baseStrength + recentForm + consistency));
  };

  // AI matchup prediction
  const predictMatch = (homeTeam, awayTeam) => {
    const homeStrength = teamStats[homeTeam]?.strength || 50;
    const awayStrength = teamStats[awayTeam]?.strength || 50;
    const homeAdvantage = 5;
    const randomFactor = (Math.random() * 10) - 5; // -5 to +5
    
    const homeWinProb = ((homeStrength + homeAdvantage) / 
      (homeStrength + awayStrength + homeAdvantage) * 100) + randomFactor;
    
    return {
      homeWin: Math.min(100, Math.max(0, homeWinProb)).toFixed(1),
      awayWin: Math.min(100, Math.max(0, 100 - homeWinProb)).toFixed(1),
      predictedScore: {
        home: Math.floor(homeWinProb / 10),
        away: Math.floor((100 - homeWinProb) / 10)
      }
    };
  };

  // AI schedule optimization
  const optimizeSchedule = (matches) => {
    // Sort matches to maximize competitive balance
    return matches.sort((a, b) => {
      const predA = predictMatch(a.home, a.away);
      const predB = predictMatch(b.home, b.away);
      // Prioritize closer matchups (closer to 50-50)
      return Math.abs(50 - predA.homeWin) - Math.abs(50 - predB.homeWin);
    });
  };

  // Initialize team stats when teams change
  useEffect(() => {
    if (teams.length > 0) {
      const stats = {};
      teams.forEach(team => {
        stats[team] = {
          strength: calculateTeamStrength(team),
          form: Array(5).fill(0).map(() => Math.floor(Math.random() * 3)), // Last 5 matches
          winStreak: Math.floor(Math.random() * 4)
        };
      });
      setTeamStats(stats);
    }
  }, [teams]);

  const addTeam = () => {
    if (newTeam.trim()) {
      setTeams([...teams, newTeam.trim()]);
      setNewTeam('');
    }
  };

  const addVenue = () => {
    if (newVenue.trim()) {
      setVenues([...venues, newVenue.trim()]);
      setNewVenue('');
    }
  };

  const removeTeam = (index) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const removeVenue = (index) => {
    setVenues(venues.filter((_, i) => i !== index));
  };

  const generateSchedule = () => {
    if (teams.length < 2) {
      setError('Need at least 2 teams');
      return;
    }
    if (venues.length < 1) {
      setError('Need at least 1 venue');
      return;
    }
    if (!startDate) {
      setError('Please set a start date');
      return;
    }

    let matches = createSchedule(teams, venues, startDate);
    matches = optimizeSchedule(matches);
    setSchedule(matches);
    
    // Generate match predictions
    const matchPredictions = matches.map(match => ({
      match: `${match.home} vs ${match.away}`,
      ...predictMatch(match.home, match.away),
      date: match.date,
      time: match.time,
      venue: match.venue
    }));
    setPredictions(matchPredictions);
    setError('');
  };

  const createSchedule = (teams, venues, startDate) => {
    const matches = [];
    let currentDate = new Date(startDate);
    const gamesPerDay = venues.length * 2; // 2 games per venue per day
    let matchIndex = 0;

    // Generate round-robin matches
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const venueIndex = matchIndex % venues.length;
        const timeSlot = Math.floor((matchIndex % gamesPerDay) / venues.length);
        const gameTime = timeSlot === 0 ? "14:00" : "16:30";

        matches.push({
          home: teams[i],
          away: teams[j],
          date: new Date(currentDate).toLocaleDateString(),
          time: gameTime,
          venue: venues[venueIndex]
        });

        matchIndex++;
        if (matchIndex % gamesPerDay === 0) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    return matches;
  };

  const TeamStrengthChart = () => {
    const data = teams.map(team => ({
      name: team,
      strength: teamStats[team]?.strength || 0,
      winStreak: teamStats[team]?.winStreak || 0
    }));

    return (
      <LineChart width={600} height={300} data={data} className="mx-auto">
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="strength" stroke="#8884d8" name="Team Strength" />
        <Line type="monotone" dataKey="winStreak" stroke="#82ca9d" name="Win Streak" />
      </LineChart>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Tournament Scheduler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Team Input */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter team name"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                />
                <Button onClick={addTeam}>Add Team</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {teams.map((team, index) => (
                  <div key={index} className="flex items-center bg-slate-100 rounded-lg px-3 py-1">
                    <span>{team}</span>
                    <button 
                      onClick={() => removeTeam(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Venue Input */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter venue name"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addVenue()}
                />
                <Button onClick={addVenue}>Add Venue</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {venues.map((venue, index) => (
                  <div key={index} className="flex items-center bg-slate-100 rounded-lg px-3 py-1">
                    <span>{venue}</span>
                    <button 
                      onClick={() => removeVenue(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Input */}
            <div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <Button 
              onClick={generateSchedule}
              className="w-full"
            >
              Generate AI-Optimized Schedule
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Strength Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamStrengthChart />
          </CardContent>
        </Card>
      )}

      {schedule && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Optimized Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schedule.map((match, index) => (
                <div 
                  key={index}
                  className="p-3 bg-slate-50 rounded-lg flex justify-between items-center"
                >
                  <div className="flex-1">
                    <span className="font-semibold">{match.home}</span>
                    <span className="mx-2">vs</span>
                    <span className="font-semibold">{match.away}</span>
                  </div>
                  <div className="text-slate-600">
                    {match.date} at {match.time}
                  </div>
                  <div className="ml-4 text-slate-500">
                    {match.venue}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Match Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {predictions.map((pred, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg">
                  <div className="font-semibold">{pred.match}</div>
                  <div className="text-sm text-slate-600">
                    Win probabilities: {pred.homeWin}% - {pred.awayWin}%
                  </div>
                  <div className="text-sm text-slate-500">
                    Predicted score: {pred.predictedScore.home} - {pred.predictedScore.away}
                  </div>
                  <div className="text-xs text-slate-400">
                    {pred.date} at {pred.time} ({pred.venue})
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TournamentScheduler;