import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

/**
 * PhonePreview Component
 * Simulates how the message will appear on a customer's smartphone screen.
 * @param {{ message: string; imagePreviewUrl: string; }} props
 */
const PhonePreview = ({ message, imagePreviewUrl }) => {
  // Renders the message text, converting text between asterisks into bold elements.
  const renderMessageWithFormatting = (text) => {
    if (!text) {
      return <span className="text-gray-400">Your message will appear here...</span>;
    }
    return text.split('*').map((part, index) => (
      <span key={index} className={index % 2 === 1 ? 'font-bold' : ''}>
        {part}
      </span>
    ));
  };

  return (
    // Sticky container to keep the preview visible on scroll
    <div className="sticky top-6">
      {/* Phone mockup container */}
      <div className="bg-white border-8 border-gray-800 rounded-3xl shadow-2xl overflow-hidden mx-auto max-w-sm">
        {/* Phone notch */}
        <div className="h-8 bg-gray-800 flex items-center justify-center">
          <div className="w-20 h-2 bg-gray-900 rounded-b-lg"></div>
        </div>
        
        {/* Chat screen with a WhatsApp-like background color */}
        <div className="bg-gray-200 p-4" style={{ minHeight: '367px' }}>
          <div className="flex justify-end">
            {/* Outgoing message bubble */}
            <div className="bg-green-200 rounded-lg p-2 max-w-xs shadow-md">
              {imagePreviewUrl && (
                <img 
                  src={imagePreviewUrl} 
                  alt="Promotion Preview" 
                  className="rounded-md mb-2 w-full h-auto object-cover" 
                />
              )}
              <div className="text-gray-800 text-sm whitespace-pre-wrap break-words">
                {renderMessageWithFormatting(message)}
              </div>
              <div className="text-right text-xs text-gray-400 mt-1">
                <span>Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


/**
 * Main WhatsAppPromotion Component
 * The main component for composing and sending WhatsApp promotions.
 * @param {{ selectedCustomers: any[]; onClose: () => void; credits: number; }} props
 */
const WhatsAppPromotion = ({ selectedCustomers = [], onClose, credits = 1000 }) => {
  const { showNotification } = useNotification();
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('custom');
  const [isLoading, setIsLoading] = useState(false);
  const [templateVariables, setTemplateVariables] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null); // { status, total, done, pending, failures }
  const [pollTimer, setPollTimer] = useState(null);
  const textareaRef = useRef(null);

  // Pre-defined message templates
  const templates = [
    { id: 'custom', name: 'Custom Message' },
    { 
      id: 'discount', 
      name: 'Discount Offer', 
      template: 'Hi there! Get *{{discount}}% off* on your next visit! 🎉 Valid until {{date}}. Show this message to redeem.',
      variables: ['discount', 'date']
    },
    { 
      id: 'newService', 
      name: 'New Service Launch', 
      template: '✨ Introducing our new *{{service}}* service! Special introductory price of just ₹{{price}}. Book your slot today!',
      variables: ['service', 'price']
    },
    { 
      id: 'reminder', 
      name: 'Appointment Reminder', 
      template: 'Dear customer, your next appointment is due. Book now and get a *10% discount*! Don\'t miss out.',
      variables: []
    }
  ];

  // Handles changing the message template
  const handleTemplateChange = (e) => {
    const selectedTemplate = templates.find(t => t.id === e.target.value);
    setTemplate(e.target.value);
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
        finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), value || `{{${key}}}`);
      });
      setMessage(finalMessage);
    }
  }, [templateVariables, template]);

  // Handles the image selection and preview generation
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('Image size should be less than 5MB.', 'error');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Removes the selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreviewUrl('');
    const fileInput = document.getElementById('image-upload');
    if(fileInput) fileInput.value = '';
  };

  // Inserts asterisks around selected text to make it bold
  const insertBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);

    if (selectedText) {
      const newMessage = `${value.substring(0, selectionStart)}*${selectedText}*${value.substring(selectionEnd)}`;
      setMessage(newMessage);
      // Refocus the textarea and place cursor after the inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(selectionEnd + 2, selectionEnd + 2);
      }, 0);
    }
  };
  
  // Backend base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  // Poll job status every 5s while a job is running
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/v1/whatsapp/job/${jobId}/status`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (!cancelled) setJobStatus(data);
        if (['completed', 'failed', 'Done'].includes(data.status)) return; // stop on terminal status
        const t = setTimeout(poll, 5000);
        if (!cancelled) setPollTimer(t);
      } catch (e) {
        const t = setTimeout(poll, 5000);
        if (!cancelled) setPollTimer(t);
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [jobId]);

  // Send using job API when multiple customers selected; fall back to single-send for 1
  const handleSendMessage = async () => {
    const recipients = selectedCustomers
      .map((c) => String(c.number || c.phone || c.mobile || c.contactNumber || c.whatsapp || '').trim())
      .filter((p) => p.length > 0);

    if (recipients.length === 0) {
      showNotification('No valid phone numbers found in selected customers.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Always use the job API, even for a single recipient
  const resp = await fetch(`${API_BASE_URL}/api/v1/whatsapp/send-whatsapp-job?visible=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones: recipients, text: message, imageDataUrl: imagePreviewUrl || undefined }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setJobId(data.jobId);
      setJobStatus({ status: 'pending', total: data.total, done: 0, pending: data.total, failures: [] });
    } catch (e) {
      showNotification(`Failed to start job: ${String(e)}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const progressPct = jobStatus && jobStatus.total > 0 ? Math.round((jobStatus.done / jobStatus.total) * 100) : 0;
  const isTerminal = Boolean(jobStatus && ['completed', 'failed', 'Done'].includes(jobStatus.status));

  // Basic validation for selectedCustomers prop
  if (!Array.isArray(selectedCustomers)) {
    console.error('selectedCustomers is not an array:', selectedCustomers);
    return <div className="p-4 text-red-600">Error: Invalid customer data provided.</div>;
  }
  
  const currentTemplate = templates.find(t => t.id === template);

  return (
    <div className=" rounded-lg font-sans">
      {/* Top Bar: Header with customer count and credits */}
      <header className="flex  flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b">
        <div>
           <span className="text-sm bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-medium mt-1 inline-block">
            {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="text-left sm:text-right mt-2 sm:mt-0">
          <div className="text-sm font-semibold text-gray-600">WhatsApp Credit</div>
          <div className="text-lg font-bold text-green-600">{credits.toLocaleString()} remaining</div>
        </div>
      </header>

      {/* Main Content: Two-column layout */}
      <main className="grid sm:grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Controls */}
        <div className="space-y-6">
          {/* 1. Template Selection */}
          <section>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Choose a Template
            </label>
            <select
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
              <p className="block text-sm font-medium text-gray-800 mb-3">
                Fill in Template Variables
              </p>
              <div className="grid sm:grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* 2. Image Upload */}
          <section>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Add Image (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <label htmlFor="image-upload" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer shadow-sm">
                Choose Image
              </label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              {imagePreviewUrl && (
                <button onClick={removeImage} className="text-sm text-red-600 hover:text-red-800 font-semibold">
                  Remove Image
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Max file size: 5MB. PNG or JPG recommended.</p>
          </section>
          
          {/* 3. Message Editor */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                3. Edit Your Message
              </label>
              <button
                onClick={insertBold}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-bold text-sm"
                title="Select text to make it bold"
              >
                B
              </button>
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 resize-vertical"
                placeholder="Enter your message... Use *asterisks* for bold text."
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {message.length} / 1024
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Phone Preview */}
              <div className="sm:hidden md:block">
           <PhonePreview message={message} imagePreviewUrl={imagePreviewUrl} />
        </div>
      </main>
      
      {/* Footer: Action Buttons */}
      <footer className="mt-8 pt-6 border-t flex flex-col gap-3">
        {jobId && jobStatus && (
          <div className="w-full">
            <div className="flex justify-between mb-1 text-sm text-gray-700">
              <span>Status: {jobStatus.status}</span>
              <span>
                {jobStatus.done}/{jobStatus.total} ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
              <div className="bg-teal-600 h-2" style={{ width: `${progressPct}%` }} />
            </div>
            {['completed','failed','Done'].includes(jobStatus.status) && jobStatus.failures?.length > 0 && (
              <div className="mt-3 text-sm text-red-600">
                <div className="font-semibold mb-1">Failed numbers:</div>
                <ul className="list-disc ml-5">
                  {jobStatus.failures.map((f, idx) => (
                    <li key={idx}>{f.phone} — {f.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-semibold"
          >
            {jobId ? 'Close' : 'Cancel'}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim() || selectedCustomers.length === 0 || (Boolean(jobId) && !isTerminal)}
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm transition-colors"
          >
            {jobId
              ? (isTerminal ? 'Send Again' : 'Job Running…')
              : (isLoading ? 'Sending…' : `Send to ${selectedCustomers.length} Customer(s)`)}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default WhatsAppPromotion;
