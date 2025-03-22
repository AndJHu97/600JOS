import React, { useState } from "react";

const Main = () => {
    const [inputText, setInputText] = useState("");
    const [tags, setTags] = useState([]);

    const REST_URL = "http://data.bioontology.org";
    const BIOPORTAL_API_KEY = "81cfc5f3-4ed0-4991-a696-9d623fbcd79e";
    //const terms = ["Morbid%20obesity", "Laparoscopic%20Roux-en-Y%20gastric%20bypass", "Overweight"];

    // Helper function to convert string returned by ChatGPT to json
    function convertStringToJson(str) {
        // Remove the markdown code block syntax (```json and ```)
        const jsonString = str.replace(/^```json\s*|\s*```$/g, '').trim();
        
        // Parse the cleaned-up string into a JSON object
        try {
          const jsonObject = JSON.parse(jsonString);
          return jsonObject;
        } catch (error) {
          console.error("Invalid JSON string:", error);
          return null;
        }
    }

    // TEMPORARY placeholder to test end to end
    function combineArrays(jsonObj) {
        // Combine all the arrays from the JSON object into a single array
        const combinedArray = [
          ...jsonObj.diseases,
          ...jsonObj.treatments,
          ...jsonObj.symptoms,
          ...jsonObj.tests
        ];
        
        return combinedArray;
    }

    // Function to get chat gpt response
    const getChatGptResponse = async () => {
        const apiKey = "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"; 
        const endpoint = "https://api.openai.com/v1/chat/completions";
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        };
  
        const body = JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content:
                "Generate just a json format of medical tags for the following clinical note with categories for diseases, treatments, symptoms, tests (return blank array if there are none for particular category): Morbid obesity.  Laparoscopic antecolic antegastric Roux-en-Y gastric bypass with EEA anastomosis.  This is a 30-year-old female, who has been overweight for many years.  She has tried many different diets, but is unsuccessful.",
            },
          ],
        });
  
        const response = await fetch(endpoint, {
          method: "POST",
          headers: headers,
          body: body,
        });
  
        const data = await response.json();
        if (data.choices.length > 0) {
            return combineArrays(convertStringToJson(data.choices[0].message.content));
        }
    }

    const getBioontologyData = async (url) => {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'apikey token=' + BIOPORTAL_API_KEY
          }
        });
        const data = await response.json();
        return data;
      };

    const extractTags = async () => {
        // Query chat gpt for potential tags
        const tags = await getChatGptResponse();

        // Get bioontology data
        const results = [];
        for (let term of tags) {
            const adjTerm = term.replace(/ /g, '%20')
            const url = `${REST_URL}/search?q=${adjTerm}`;
            const result = await getBioontologyData(url);
            if (result.collection.length > 0) {
                results.push(result.collection[0]);
            }
        }
        console.log(results)
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

