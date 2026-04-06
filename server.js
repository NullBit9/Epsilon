const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Use local openclaw from node_modules/.bin if available, otherwise fall back to global
const openclawBin = path.join(__dirname, 'node_modules', '.bin', 'openclaw');

app.use(express.json());
app.use(express.static(__dirname));

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    
    if (!userMessage) {
        return res.status(400).json({ error: 'No message provided' });
    }

    try {
        // Call openclaw CLI with the user's message
        // Uses local installation from node_modules (no global install needed)
        const openclawCmd = `"${openclawBin}" run --message "${userMessage.replace(/"/g, '\\"')}" --session epsilon`;
        
        exec(openclawCmd, { timeout: 60000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`OpenClaw error: ${error.message}`);
                return res.status(500).json({ 
                    response: `Error processing request: ${error.message}` 
                });
            }
            
            // Parse the output to get the agent's response
            // OpenClaw outputs the response to stdout
            const agentResponse = stdout.trim() || 'No response from agent';
            res.json({ response: agentResponse });
        });
        
    } catch (err) {
        console.error(`Server error: ${err.message}`);
        res.status(500).json({ 
            response: `Server error: ${err.message}` 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Epsilon server running at http://localhost:${PORT}`);
    console.log(`OpenClaw is installed locally - no global setup required!`);
});
