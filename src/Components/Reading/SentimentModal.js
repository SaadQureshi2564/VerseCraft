import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const SentimentModal = ({ isOpen, onClose, projectId }) => {
  const [sentimentData, setSentimentData] = useState([
    { name: "positive", value: 0 },
    { name: "neutral", value: 0 },
    { name: "negative", value: 0 },
  ]);

  useEffect(() => {
    if (!isOpen || !projectId) return;
  
    const fetchComments = async () => {
      try {
        const response = await axios.get(`/api/comments`, { params: { projectId } });
        const comments = response.data;
  
        console.log("Fetched Comments:", comments);
  
        const sentimentCount = { positive: 0, neutral: 0, negative: 0, undecided: 0 };
        comments.forEach((comment) => {
          const type = comment.commentType.toLowerCase();
          if (sentimentCount.hasOwnProperty(type)) {
            sentimentCount[type] += 1;
          }
        });
  
        setSentimentData([
          { name: "positive", value: sentimentCount.positive },
          { name: "neutral", value: sentimentCount.neutral },
          { name: "negative", value: sentimentCount.negative },
        ]);
      } catch (err) {
        console.error("Error fetching comments:", err);
        toast.error("Failed to load sentiment data");
      }
    };
  
    fetchComments();
  
    return () => {
      setSentimentData([ // Reset state when closing
        { name: "positive", value: 0 },
        { name: "neutral", value: 0 },
        { name: "negative", value: 0 },
       
      ]);
    };
  }, [isOpen, projectId]);
  

  if (!isOpen) return null;

  const COLORS = ["#00f5d4", "#ffdd00", "#ff007f", "#8884d8"];

  return (
    <div className="sentiment-modal-overlay">
      <div className="sentiment-modal-content">
        <h2>Sentiment Analysis</h2>
        {/* <p><strong>Project ID:</strong> {projectId}</p> */}

        <div className="sentiment-chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={2}
                className="pie-chart-glow"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <button className="sentiment-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SentimentModal;
