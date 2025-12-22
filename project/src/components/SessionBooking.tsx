import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_your_stripe_publishable_key'); // Replace with your Stripe publishable key

interface Teacher {
  _id: string;
  userId: {
    username: string;
  };
  specializations: string[];
  hourlyRate: number;
  bio: string;
  rating: number;
  totalSessions: number;
}

interface Session {
  _id: string;
  subject: string;
  scheduledTime: string;
  duration: number;
  price: number;
  status: string;
  meetingRoom: {
    roomId: string;
  };
}

const PaymentForm: React.FC<{
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      }
    });

    if (error) {
      onError(error.message || 'Payment failed');
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-700 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#fff',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : '🦇 Complete Payment'}
      </button>
    </form>
  );
};

const SessionBooking: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-sessions'>('browse');
  const [searchFilters, setSearchFilters] = useState({
    subject: '',
    maxRate: '',
    minRating: ''
  });
  const [bookingData, setBookingData] = useState({
    subject: '',
    scheduledTime: '',
    duration: 60
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchMySessions();
  }, []);

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (searchFilters.subject) queryParams.append('subject', searchFilters.subject);
      if (searchFilters.maxRate) queryParams.append('maxRate', searchFilters.maxRate);
      if (searchFilters.minRating) queryParams.append('minRating', searchFilters.minRating);

      const response = await fetch(`/api/teachers/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchMySessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sessions/my-sessions?type=student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMySessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleBookSession = async () => {
    if (!selectedTeacher) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teacherId: selectedTeacher._id,
          subject: bookingData.subject,
          scheduledTime: bookingData.scheduledTime,
          duration: bookingData.duration
        })
      });

      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setShowBookingModal(false);
        setShowPaymentModal(true);
      } else {
        const error = await response.json();
        alert(`Booking failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedTeacher(null);
    setBookingData({ subject: '', scheduledTime: '', duration: 60 });
    alert('🦇 Session booked successfully! Check your sessions tab for details.');
    fetchMySessions();
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  const joinSession = (sessionId: string) => {
    window.open(`/session/${sessionId}`, '_blank');
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">
              🦇 Wayne Tech Learning Sessions
            </h1>
            <p className="text-gray-300">
              Connect with verified expert instructors for personalized learning
            </p>
          </div>

          {/* Navigation */}
          <div className="bg-gray-800 rounded-lg shadow-2xl mb-8">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'browse'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🔍 Browse Teachers
              </button>
              <button
                onClick={() => setActiveTab('my-sessions')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'my-sessions'
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📚 My Sessions
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'browse' && (
                <div>
                  {/* Search Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <input
                      type="text"
                      placeholder="Subject (e.g., Python)"
                      value={searchFilters.subject}
                      onChange={(e) => setSearchFilters({
                        ...searchFilters,
                        subject: e.target.value
                      })}
                      className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max Rate ($)"
                      value={searchFilters.maxRate}
                      onChange={(e) => setSearchFilters({
                        ...searchFilters,
                        maxRate: e.target.value
                      })}
                      className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Min Rating"
                      min="0"
                      max="5"
                      step="0.1"
                      value={searchFilters.minRating}
                      onChange={(e) => setSearchFilters({
                        ...searchFilters,
                        minRating: e.target.value
                      })}
                      className="p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    />
                    <button
                      onClick={fetchTeachers}
                      className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-300 transition-colors"
                    >
                      🔍 Search
                    </button>
                  </div>

                  {/* Teachers List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map(teacher => (
                      <div key={teacher._id} className="bg-gray-700 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mr-4">
                            <span className="text-black font-bold text-xl">
                              {teacher.userId.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">
                              {teacher.userId.username}
                            </h3>
                            <div className="flex items-center">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-gray-300 ml-1">
                                {teacher.rating.toFixed(1)} ({teacher.totalSessions} sessions)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-300 text-sm mb-2">{teacher.bio}</p>
                          <div className="flex flex-wrap gap-2">
                            {teacher.specializations.map(spec => (
                              <span key={spec} className="bg-gray-600 text-yellow-400 px-2 py-1 rounded text-xs">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400 font-bold text-lg">
                            ${teacher.hourlyRate}/hr
                          </span>
                          <button
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setShowBookingModal(true);
                            }}
                            className="bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-300 transition-colors"
                          >
                            Book Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {teachers.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg">
                        No teachers found. Try adjusting your search criteria.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'my-sessions' && (
                <div className="space-y-4">
                  {mySessions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg">
                        No sessions booked yet. Browse teachers to get started!
                      </p>
                    </div>
                  ) : (
                    mySessions.map(session => (
                      <div key={session._id} className="bg-gray-700 rounded-lg p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              {session.subject}
                            </h3>
                            <p className="text-gray-300">
                              {new Date(session.scheduledTime).toLocaleString()}
                            </p>
                            <p className="text-gray-400">
                              Duration: {session.duration} minutes
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-bold text-lg">
                              ${session.price}
                            </p>
                            <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                              session.status === 'completed' ? 'bg-green-900 text-green-300' :
                              session.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                              session.status === 'scheduled' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {session.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {session.status === 'scheduled' && (
                          <div className="mt-4">
                            <button
                              onClick={() => joinSession(session._id)}
                              className="bg-yellow-400 text-black font-bold py-2 px-6 rounded hover:bg-yellow-300 transition-colors"
                            >
                              🎥 Join Session
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                Book Session with {selectedTeacher.userId.username}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={bookingData.subject}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      subject: e.target.value
                    })}
                    placeholder="What would you like to learn?"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingData.scheduledTime}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      scheduledTime: e.target.value
                    })}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={bookingData.duration}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      duration: parseInt(e.target.value)
                    })}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Rate:</span>
                    <span className="text-white">${selectedTeacher.hourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-white">{bookingData.duration} min</span>
                  </div>
                  <hr className="border-gray-600 my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-yellow-400">Total:</span>
                    <span className="text-yellow-400">
                      ${(selectedTeacher.hourlyRate * (bookingData.duration / 60)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookSession}
                  disabled={loading || !bookingData.subject || !bookingData.scheduledTime}
                  className="flex-1 bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Booking...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && clientSecret && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                🦇 Complete Payment
              </h2>
              
              <PaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
              
              <div className="mt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Elements>
  );
};

export default SessionBooking;