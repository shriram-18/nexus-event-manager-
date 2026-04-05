exports.generateDescription = async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const HF_TOKEN = process.env.HF_TOKEN;
        if(!HF_TOKEN) return res.status(500).json({ error: 'HF_TOKEN not set in server environment' });
        
        const promptBody = `[INST] You are an expert marketing copywriter. Based on the event title: "${prompt}", generate a creative event description (3 sentences), suggest the best category (Choose exactly ONE from: Music, Tech, Chill, Social, Community, Sports), and provide 3 short tags as an array of strings. YOU MUST RETURN ONLY VALID JSON. Do not return any other text. Follow this schema exactly: {"description": "string", "category": "string", "tags": ["tag1", "tag2"]} [/INST]`;

        const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
            headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({
                inputs: promptBody,
                parameters: { max_new_tokens: 250, temperature: 0.7 }
            }),
        });
        
        const result = await response.json();
        
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }
        
        let generatedText = result[0]?.generated_text || '';
        if(generatedText.includes('[/INST]')) {
             generatedText = generatedText.split('[/INST]')[1].trim();
        }
        
        // Safety parsing
        try {
            // Strip markdown JSON wrapping if model adds it
            let cleanJson = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(cleanJson);
            res.json(parsedData);
        } catch(e) {
            // Fallback if model fails strict JSON
            res.json({ description: generatedText, category: "Social", tags: ["Event", "Gathering"] });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
