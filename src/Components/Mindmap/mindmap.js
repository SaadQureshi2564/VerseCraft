import React, { useState, useRef } from 'react';
import './mindmap.css';

const NODE_WIDTH = 150;
const NODE_HEIGHT = 80; // Define the node width and height

const MindMap = () => {
    const [nodes, setNodes] = useState([]);
    const [newNode, setNewNode] = useState('');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, nodeIndex: null });
    const containerRef = useRef(null);

    const addNode = () => {
        if (newNode.trim()) {
            const id = nodes.length + 1;
            const xPos = id === 1 ? 100 : nodes[id - 2].x + NODE_WIDTH + 20;
            const yPos = 100;
            setNodes([...nodes, { id, text: newNode, x: xPos, y: yPos }]);
            setNewNode('');
        }
    };

    const updateNodePosition = (index, newX, newY) => {
        const updatedNodes = [...nodes];
        updatedNodes[index] = { ...updatedNodes[index], x: newX, y: newY };
        setNodes(updatedNodes);
    };

    const deleteNode = (index) => {
        const updatedNodes = nodes.filter((_, i) => i !== index);
        setNodes(updatedNodes);
        hideContextMenu();
    };

    const addConnectedNode = (index) => {
        const selectedNode = nodes[index];
        const newId = nodes.length + 1;

        // Place the new node perpendicularly below the selected node
        const newNodeX = selectedNode.x; // Same x-position as the selected node
        const newNodeY = selectedNode.y + NODE_HEIGHT + 20; // Place it directly below

        setNodes([...nodes, { id: newId, text: `Node ${newId}`, x: newNodeX, y: newNodeY }]);
        hideContextMenu();
    };

    const showContextMenu = (e, index) => {
        e.preventDefault(); // Prevent the default browser right-click menu
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, nodeIndex: index });
    };

    const hideContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, nodeIndex: null });
    };

    return (
        <div className="mindmap-container" ref={containerRef}>
            <h1>Mind Map</h1>
            <div className="mindmap-editor">
                <input
                    type="text"
                    value={newNode}
                    onChange={(e) => setNewNode(e.target.value)}
                    placeholder="Enter a new idea"
                />
                <button onClick={addNode}>Add Node</button>
            </div>

            <div className="mindmap">
                <svg className="mindmap-svg">
                    {nodes.map((node, index) => {
                        if (index > 0) {
                            const prevNode = nodes[index - 1];
                            return (
                                <line
                                    key={index}
                                    x1={prevNode.x + NODE_WIDTH / 2} y1={prevNode.y + NODE_HEIGHT / 2}
                                    x2={node.x + NODE_WIDTH / 2} y2={node.y + NODE_HEIGHT / 2}
                                    stroke="black"
                                    strokeWidth="2"
                                />
                            );
                        }
                        return null;
                    })}
                </svg>

                {nodes.map((node, index) => (
                    <div
                        key={node.id}
                        className="mindmap-node"
                        style={{ left: `${node.x}px`, top: `${node.y}px`, position: 'absolute' }}
                        onContextMenu={(e) => showContextMenu(e, index)}
                        draggable
                        onDrag={(e) => updateNodePosition(index, e.clientX, e.clientY)}
                    >
                        {node.text}
                    </div>
                ))}

                {contextMenu.visible && (
                    <div
                        className="context-menu"
                        style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                    >
                        <ul>
                            <li onClick={() => deleteNode(contextMenu.nodeIndex)}>Delete Node</li>
                            <li onClick={() => addConnectedNode(contextMenu.nodeIndex)}>Add Connected Node</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MindMap;
