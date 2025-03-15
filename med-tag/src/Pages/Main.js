import React, { useState } from "react";

const Main = () => {
    const [inputText, setInputText] = useState("");
    const [tags, setTags] = useState([]);


    const extractTags = () => {
       
    };

    return (
        <div style={{ display: "flex", height: "100vh", padding: "20px" }}>
            {/* Left Side: Input Box & Button */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                <textarea
                    style={{ width: "100%", height: "200px", padding: "10px", fontSize: "16px" }}
                    placeholder="Enter text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button onClick={extractTags} style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>
                    Extract Tags
                </button>
            </div>

            {/* Right Side: Display Tags */}
            <div style={{ flex: 1, padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
                <h3>Extracted Tags:</h3>
                <ul>
                    {tags.map((tag, index) => (
                        <li key={index} style={{ fontSize: "16px", marginBottom: "5px" }}>
                            {tag}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Main;
