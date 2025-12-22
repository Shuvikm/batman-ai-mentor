import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, IndianRupee, CheckCircle, AlertCircle, Users } from 'lucide-react';
import BatmanLogo from '../ui/BatmanLogo';

interface BookingSessionProps {
  user?: any;
}

interface Teacher {
  _id: string;
  userId: {
    username: string;
    email: string;
  };
  subjects: string[];
  hourlyRate: number;
  rating: number;
  totalSessions: number;
  bio: string;
  availability: string[];
}

interface Session {
  _id: string;
  teacher: Teacher;
  student: {
    username: string;
    email: string;
  };
  subject: string;
  scheduledTime: string;
  duration: number;
  status: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

const BookingSession: React.FC<BookingSessionProps> = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [bookingData, setBookingData] = useState({
    subject: '',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    loadTeachers();
    loadSessions();
  }, []);

  const loadTeachers = async () => {
    try {
      const token = localStorage.getItem('batman_token');
      const response = await fetch('/api/teachers/approved', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem('batman_token');
      const response = await fetch('/api/sessions/my-sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleBookSession = async () => {
    if (!selectedTeacher || !bookingData.subject || !bookingData.date || !bookingData.time) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('batman_token');
      const scheduledTime = new Date(`${bookingData.date}T${bookingData.time}`);
      
      const response = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacherId: selectedTeacher._id,
          subject: bookingData.subject,
          scheduledTime: scheduledTime.toISOString(),
          duration: bookingData.duration,
          notes: bookingData.notes
        })
      });

      if (response.ok) {
        await response.json();
        alert('Session booked successfully!');
        setShowBookingForm(false);
        setSelectedTeacher(null);
        setBookingData({
          subject: '',
          date: '',
          time: '',
          duration: 60,
          notes: ''
        });
        loadSessions(); // Refresh sessions
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to book session');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Batman Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BatmanLogo size="large" />
            <h1 className="text-4xl font-bold text-white">Batman Mentoring Sessions</h1>
            <BatmanLogo size="large" />
          </div>
          <p className="text-gray-300 text-lg">Book 1-on-1 sessions with expert teachers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teachers List */}
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Users className="mr-3" />
              Available Teachers
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {teachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedTeacher?._id === teacher._id
                      ? 'bg-blue-600/30 border-blue-500'
                      : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                  }`}
                  onClick={() => {
                    setSelectedTeacher(teacher);
                    setShowBookingForm(true);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <BatmanLogo size="medium" />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold flex items-center">
                        {teacher.userId.username}
                        <span className="ml-2 text-yellow-400">⭐ {teacher.rating.toFixed(1)}</span>
                      </h3>
                      <p className="text-gray-400 text-sm">{teacher.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teacher.subjects.slice(0, 3).map((subject, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-green-400 font-semibold flex items-center">
                          <IndianRupee className="w-4 h-4 mr-1" />
                          {formatCurrency(teacher.hourlyRate)}/hour
                        </span>
                        <span className="text-gray-400 text-sm">
                          {teacher.totalSessions} sessions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form or Sessions List */}
          <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            {showBookingForm && selectedTeacher ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Calendar className="mr-3" />
                  Book Session with {selectedTeacher.userId.username}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Subject
                    </label>
                    <select
                      value={bookingData.subject}
                      onChange={(e) => setBookingData({...bookingData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Subject</option>
                      {selectedTeacher.subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Duration (minutes)
                    </label>
                    <select
                      value={bookingData.duration}
                      onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      placeholder="Any specific topics or requirements..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Cost Calculation */}
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-white">
                      <span>Session Cost:</span>
                      <span className="font-bold text-xl flex items-center">
                        <IndianRupee className="w-5 h-5 mr-1" />
                        {formatCurrency((selectedTeacher.hourlyRate * bookingData.duration) / 60)}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {formatCurrency(selectedTeacher.hourlyRate)}/hour × {bookingData.duration} minutes
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBookSession}
                      disabled={loading}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Video className="w-5 h-5 mr-2" />
                          Book Session
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Calendar className="mr-3" />
                  My Booked Sessions
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {sessions.length > 0 ? (
                    sessions.map((session) => (
                      <div
                        key={session._id}
                        className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <BatmanLogo size="small" />
                            <div>
                              <h3 className="text-white font-semibold">
                                {session.subject}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                with {session.teacher.userId.username}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="text-gray-300 flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(session.scheduledTime).toLocaleDateString()}
                                </span>
                                <span className="text-gray-300 flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {new Date(session.scheduledTime).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center space-x-1 ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)}
                              <span className="capitalize text-sm">{session.status}</span>
                            </div>
                            <div className="text-green-400 font-semibold mt-1 flex items-center">
                              <IndianRupee className="w-4 h-4 mr-1" />
                              {formatCurrency(session.amount)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No sessions booked yet</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Select a teacher to book your first session
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSession;