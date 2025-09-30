import React, { useState, useEffect, useRef } from 'react';

/**
 * SmsPromotion Component
 * A component for composing and sending SMS promotions to a list of customers.
 * @param {{ selectedCustomers: any[]; onClose: () => void; credits: number; }} props
 */
const SmsPromotion = ({ selectedCustomers = [], onClose, credits = 5000 }) => {
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('custom');
  const [isLoading, setIsLoading] = useState(false);
  const [templateVariables, setTemplateVariables] = useState({});
  const textareaRef = useRef(null);

  // Pre-defined SMS templates (more concise for SMS)
  const templates = [
    { id: 'custom', name: 'Custom Message' },
    { 
      id: 'sale', 
      name: 'Flash Sale', 
      template: 'FLASH SALE! Get {{discount}}% off everything for the next 24 hours. Don\'t miss out!',
      variables: ['discount']
    },
    { 
      id: 'offer', 
      name: 'Special Offer', 
      template: 'Special offer for you: {{offer_details}}. Visit us today!',
      variables: ['offer_details']
    },
    { 
      id: 'reminder', 
      name: 'Appointment Reminder', 
      template: 'Hi! Just a reminder about your appointment on {{date}} at {{time}}. See you soon!',
      variables: ['date', 'time']
    }
  ];
  
  // Character limit for a standard SMS
  const SMS_CHAR_LIMIT = 160;

  // Handles changing the message template
  const handleTemplateChange = (e) => {
    const selectedTemplate = templates.find(t => t.id === e.target.value);
    setTemplate(e.target.value);
    // Reset and initialize variables for the new template
    setTemplateVariables(
      selectedTemplate?.variables?.reduce((acc, v) => ({ ...acc, [v]: '' }), {}) ?? {}
    );
    setMessage(selectedTemplate?.template || '');
  };

  // Handles changes to template variable input fields
  const handleVariableChange = (variable, value) => {
    setTemplateVariables(prev => ({ ...prev, [variable]: value }));
  };

  // Effect to update the message whenever template variables change
  useEffect(() => {
    const currentTemplate = templates.find(t => t.id === template);
    if (currentTemplate?.template) {
      let finalMessage = currentTemplate.template;
      Object.entries(templateVariables).forEach(([key, value]) => {
        // Replace placeholders with variable values, or keep the placeholder if the value is empty
        finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
      });
      setMessage(finalMessage);
    }
  }, [templateVariables, template]);

  // Simulates sending the SMS message
  const handleSendMessage = async () => {
    if (!Array.isArray(selectedCustomers) || selectedCustomers.length === 0) {
      console.error('No customers selected');
      return;
    }
    setIsLoading(true);
    try {
      // In a real app, you would make an API call to your SMS gateway here
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      alert('SMS promotions sent successfully!');
      onClose();
    } catch (error) {
      console.error('Error sending SMS message:', error);
      alert('Failed to send SMS promotions.');
    } finally {
      setIsLoading(false);
    }
  };

  // Basic validation for selectedCustomers prop
  if (!Array.isArray(selectedCustomers)) {
    console.error('selectedCustomers is not an array:', selectedCustomers);
    return <div className="p-4 text-red-600">Error: Invalid customer data provided.</div>;
  }
  
  const currentTemplate = templates.find(t => t.id === template);
  const charCount = message.length;
  const isOverLimit = charCount > SMS_CHAR_LIMIT;

  return (
    <div className=" p-4 sm:p-6 rounded-lg font-sans max-w-2xl mx-auto">
      {/* Top Bar: Header with customer count and credits */}
      <header className="flex  sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b">
        <div>
           <span className="text-sm bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-medium mt-1 inline-block">
            {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="text-left sm:text-right mt-2 sm:mt-0">
          <div className="text-sm font-semibold text-gray-600">SMS Credits</div>
          <div className="text-lg font-bold text-teal-600">{credits.toLocaleString()} remaining</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-6">
        
        {/* 1. Template Selection */}
        <section>
          <label htmlFor="sms-template" className="block text-sm font-medium text-gray-700 mb-2">
            1. Choose a Template
          </label>
          <select
            id="sms-template"
            value={template}
            onChange={handleTemplateChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          >
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </section>

        {/* Template Variables (conditional) */}
        {currentTemplate?.variables?.length > 0 && (
          <section className="p-4 bg-gray-100 rounded-md border border-gray-300">
            <h3 className="block text-sm font-medium text-gray-800 mb-3">
              Fill in Template Variables
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTemplate.variables.map(variable => (
                <div key={variable}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">
                    {`{{${variable}}}`}
                  </label>
                  <input
                    type="text"
                    value={templateVariables[variable] || ''}
                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder={`Enter ${variable}`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* 2. Message Editor */}
        <section>
          <label htmlFor="sms-message" className="text-sm font-medium text-gray-700">
            2. Edit Your Message
          </label>
          <div className="relative mt-2">
            <textarea
              id="sms-message"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className={`w-full p-3 border rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 resize-vertical ${isOverLimit ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your SMS message here..."
            />
            <div className={`absolute bottom-3 right-3 text-xs font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
              {charCount} / {SMS_CHAR_LIMIT}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer: Action Buttons */}
      <footer className="mt-8 pt-6 border-t flex justify-end space-x-3">
        <button
          onClick={onClose}
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleSendMessage}
          type="button"
          disabled={isLoading || !message.trim() || selectedCustomers.length === 0}
          className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm transition-colors"
        >
          {isLoading ? 'Sending...' : `Send to ${selectedCustomers.length} Customer(s)`}
        </button>
      </footer>
    </div>
  );
};

export default SmsPromotion;
