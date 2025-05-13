/* TemplatePreview.js */
import React, { useState } from 'react';
import './template.css';

const templates = [
  { id: 1, content: 'Template 1: Welcome to my site!' },
  { id: 2, content: 'Template 2: Learn more about our services.' },
  { id: 3, content: 'Template 3: Contact us for more information.' },
];

const TemplatePreview = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="template-preview-container">
      <div className="preview-box">
        <p>{selectedTemplate.content}</p>
      </div>
      <div className="template-list">
        {templates.map((template) => (
          <button
            key={template.id}
            className="template-button"
            onClick={() => handleTemplateSelect(template)}
          >
            Template {template.id}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplatePreview;