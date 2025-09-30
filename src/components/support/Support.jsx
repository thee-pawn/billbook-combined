// App.js
// Make sure to install lucide-react: npm install lucide-react
import React, { useState } from 'react';
import { Phone, Mail, Clock, LifeBuoy, MessageSquare, Ticket, Send, X, ListChecks, Search } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';

// Mock contact information
const supportContactInfo = {
  phone: '+1 (555) 123-4567',
  email: 'support@example.com',
  hours: 'Mon-Fri, 9 AM - 6 PM EST',
};

// Initial mock tickets
const initialTickets = [
  { id: 'TKT-001', subject: 'Login Issue', description: 'Cannot log into my account.', status: 'Open', createdDate: '2024-05-09' },
  { id: 'TKT-002', subject: 'Billing Discrepancy', description: 'Incorrect charge on my last invoice.', status: 'In Progress', createdDate: '2024-05-10' },
  { id: 'TKT-003', subject: 'Feature Request: Dark Mode', description: 'Would love to see a dark mode option.', status: 'Closed', createdDate: '2024-05-08' },
];

/**
 * CustomerSupportWidget component
 * Provides options to contact support, create tickets, send messages, and track tickets.
 */
const CustomerSupportWidget = () => {
  const { showNotification } = useNotification();
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showTrackTickets, setShowTrackTickets] = useState(false);

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [submittedTickets, setSubmittedTickets] = useState(initialTickets);

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to close all views
  const closeAllViews = () => {
    setShowTicketForm(false);
    setShowChat(false);
    setShowTrackTickets(false);
  };

  // Handler for showing the ticket creation form
  const handleCreateTicketView = () => {
    closeAllViews();
    setShowTicketForm(true);
  };

  // Handler for submitting the ticket form
  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      // Using a more noticeable alert or a custom modal would be better in a real app
      showNotification("Please fill in both subject and description for the ticket.", 'error');
      return;
    }
    const newTicket = {
      id: `TKT-${String(Date.now()).slice(-5)}`, // Simple unique ID
      subject: ticketSubject,
      description: ticketDescription,
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };
    setSubmittedTickets(prevTickets => [newTicket, ...prevTickets]);
    showNotification(`Ticket "${newTicket.subject}" (ID: ${newTicket.id}) created successfully!`, 'success');
    setTicketSubject('');
    setTicketDescription('');
    setShowTicketForm(false);
  };

  // Handler for showing the chat interface
  const handleSendMessageView = () => {
    closeAllViews();
    setShowChat(true);
    if (chatHistory.length === 0) { // Start chat with a welcome message if it's new
        setChatHistory([{ type: 'support', text: 'Hello! How can I help you today?' }]);
    }
  };

  // Handler for sending a chat message
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newHistory = [...chatHistory, { type: 'user', text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    // Simulate a support response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {type: 'support', text: 'Thanks for your message. Our team will get back to you shortly.'}]);
    }, 1000);
  };

  // Handler for showing the track tickets view
  const handleTrackTicketsView = () => {
    closeAllViews();
    setShowTrackTickets(true);
  };
  
  const filteredTickets = submittedTickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'in progress': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };


  return (
    <div className="bg-gradient-to-br from-white-900 to-grey-200 p-4 sm:p-6 lg:p-8  max-h-screen flex justify-center font-sans">
      <div className="bg-white shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden"> {/* Increased max-width for more content */}
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-indigo-700 p-6 text-white flex items-center space-x-3">
          <LifeBuoy size={32} />
          <h1 className="text-2xl font-bold">Customer Support Hub</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information Box */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h2 className="text-xl font-semibold text-slate-700 mb-3">Contact Information</h2>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center">
                <Phone size={18} className="mr-3 text-blue-500" />
                <span>{supportContactInfo.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-3 text-blue-500" />
                <span>{supportContactInfo.email}</span>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="mr-3 text-blue-500" />
                <span>{supportContactInfo.hours}</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons - now 3 columns for smaller screens, wrapping */}
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
            <button
              onClick={handleCreateTicketView}
              className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              <Ticket size={20} className="mr-2" />
              Create Ticket
            </button>
            <button
              onClick={handleSendMessageView}
              className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            >
              <MessageSquare size={20} className="mr-2" />
              Send Message
            </button>
            <button
              onClick={handleTrackTicketsView}
              className="flex items-center justify-center w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 max-h-100"
            >
              <ListChecks size={10} className="mr-2" />
              Track Tickets
            </button>
          </div>

          {/* Ticket Creation Form (Conditional) */}
          {showTicketForm && (
            <div className="mt-6 p-5 border border-blue-300 rounded-lg bg-blue-50 relative">
              <button 
                onClick={() => setShowTicketForm(false)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="Close ticket form"
              >
                <X size={20}/>
              </button>
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Create New Support Ticket</h3>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label htmlFor="ticketSubject" className="block text-sm font-medium text-slate-600 mb-1">Subject</label>
                  <input
                    type="text"
                    id="ticketSubject"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="e.g., Issue with login"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="ticketDescription" className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                  <textarea
                    id="ticketDescription"
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    rows="4"
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Please describe your issue in detail..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Submit Ticket
                </button>
              </form>
            </div>
          )}

          {/* Chat Interface (Conditional) */}
          {showChat && (
            <div className="mt-6 p-5 border border-green-300 rounded-lg bg-green-50 relative flex flex-col h-96">
               <button 
                onClick={() => setShowChat(false)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="Close chat"
              >
                <X size={20}/>
              </button>
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Live Chat</h3>
              <div className="flex-grow overflow-y-auto mb-4 p-3 bg-white border border-slate-200 rounded-md space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500 shadow-sm"
                  placeholder="Type your message..."
                />
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          )}

          {/* Track Tickets Section (Conditional) */}
          {showTrackTickets && (
            <div className="mt-6 p-5 border border-purple-300 rounded-lg bg-purple-50 relative">
              <button 
                onClick={() => setShowTrackTickets(false)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200 transition-colors"
                aria-label="Close track tickets"
              >
                <X size={20}/>
              </button>
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Track Your Tickets</h3>
              <div className="mb-4 relative">
                <input 
                  type="text"
                  placeholder="Search by ID, subject, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 border border-slate-300 rounded-md focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
              {filteredTickets.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                  {filteredTickets.map(ticket => (
                    <div key={ticket.id} className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <h4 className="text-md font-semibold text-purple-700">{ticket.subject}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">ID: {ticket.id}</p>
                      <p className="text-sm text-slate-600 mt-2">{ticket.description.substring(0,100)}{ticket.description.length > 100 ? '...' : ''}</p>
                      <p className="text-xs text-slate-400 mt-2 text-right">Created: {ticket.createdDate}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">
                  {submittedTickets.length === 0 ? "You haven't submitted any tickets yet." : "No tickets match your search."}
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerSupportWidget;
