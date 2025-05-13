import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function Editor({ text, setText }) {
  const handleChange = (value) => {
    setText(value);
  };

  return (
    <div className="editor">
      <ReactQuill value={text} onChange={handleChange} theme="snow" />
    </div>
  );
}

export default Editor;
