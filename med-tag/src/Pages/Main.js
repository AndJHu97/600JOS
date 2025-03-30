import React, { useState } from "react";
import Tag from "../Components/Tag";

const Main = () => {
    const [inputText, setInputText] = useState("");
    //const [tags, setTags] = useState(["obesity", "rheumatoid arthritis"]);
    const [groupedCategoryResults, setGroupedCategoryResults] = useState({});

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
                `Generate just a json format of medical tags for the following clinical note with categories for diseases, treatments, symptoms, tests (return blank array if there are none for particular category): ${inputText}`,
            },
          ],
        });
  
        const response = await fetch(endpoint, {
          method: "POST",
          headers: headers,
          body: body,
        });
        
        const data = await response.json();
        if(data.choices.length > 0){
            console.log("Response: ", convertStringToJson(data.choices[0].message.content));
            return convertStringToJson(data.choices[0].message.content);
        }
        
        /** 
        if (data.choices.length > 0) {
            console.log("Response: ", convertStringToJson(data.choices[0].message.content));
            console.log("Combined response: ", combineArrays(convertStringToJson(data.choices[0].message.content)));
            return combineArrays(convertStringToJson(data.choices[0].message.content));
        }
            */
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
        console.log("Tag: ", tags)
        // Get bioontology data
        const results = [];

        //Go through categories 
        for (const category in tags){
            if (Array.isArray(tags[category])){
                for (const term of tags[category]){
                    const adjTerm = term.replace(/ /g, '%20')
                    const url = `${REST_URL}/search?q=${adjTerm}`;
                    
                    try{
                        const result = await getBioontologyData(url);

                        if (result.collection.length > 0) {
                            const bioData = result.collection[0];
                            results.push({
                                category, 
                                name: bioData.prefLabel, 
                                databaseChecked: true});
                                
                        }else{
                            results.push({
                                category, 
                                name: term,
                                databaseChecked: false
                            });
                        }
                    }catch (error) {
                        console.error(`Error fetching bioontology data for ${term}:`, error);
                        // On error, also set databaseChecked to false
                        results.push({
                            category, 
                            name: term, 
                            databaseChecked: false
                    });
                }
            }
        }
        /** 
        for (let term of tags) {
            const adjTerm = term.replace(/ /g, '%20')
            const url = `${REST_URL}/search?q=${adjTerm}`;
            const result = await getBioontologyData(url);
            if (result.collection.length > 0) {
                results.push(result.collection[0]);
            }
        }
        */
    }

        
        console.log("results from bio: ", results)

        // Group results by category
        const groupedResults = results.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {});

        // You can now use groupedResults for rendering
        console.log(groupedResults);
        setGroupedCategoryResults(groupedResults);

    };

    return (
        <div style={{ display: "flex", height: "100vh", padding: "20px" }}>
            {/* Left Side: Input Box & Button */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                <textarea
                    style={{ width: "95%", height: "200px", padding: "10px", fontSize: "16px" }}
                    placeholder="Enter text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button onClick={extractTags} style={{ padding: "10px", fontSize: "16px", cursor: "pointer", width: "95%" }}>
                    Extract Tags
                </button>
            </div>

            {/* Right Side: Display Tags */}
            <div style={{ flex: 1, padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
                <h3>Extracted Tags:</h3>
                {Object.keys(groupedCategoryResults).map((category, index) => (
                    <div key={index}>
                        <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                        <ul>
                            {groupedCategoryResults[category].map((item, index) => (
                                <li key={index}>
                                    <Tag name={item.name} databaseChecked={item.databaseChecked} />
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Main;

