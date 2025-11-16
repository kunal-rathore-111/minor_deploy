const API_KEY = process.env.GEMINI_API;

async function summaryAgent(searchAgentAns, query) {


    console.log("summaryAgent executing");

    // formating the ans in single string
    const data = searchAgentAns.map((d, i) => {
        return `Paper ${i + 1}- ${d.title} by ${d.author.join(", ")} \n Abstract: ${d.summary} \n Link- ${d.link} \n Published- ${d.published} \n categories- ${d.categories}`
    });
    const dataInString = data.join("\n\n");


    const prompt = `You are a research assistant AI. The user is researching: "${query}".

        For each paper below:

        1. Summarize the **main contributions** in simple, clear language.
        2. Highlight the **key findings**, especially comparing Web3 vs Web2 where relevant.
        3. Note any **important limitations** or gaps.
        4. Keep abstracts **short (2-3 lines max)**.
        5. Normalize the category field (e.g., if multiple letters, keep only one main category).
        6. Present the output in **numbered format**:
        - Paper #: Title, Authors
            1. Main Contributions:
            2. Key Findings:
            3. Important Limitations:
            4. Links:
        7. Give me lot of necessary data specially summary.    

        Papers: ${dataInString}
        `

    if (!API_KEY) {
        return {
            answer: '',
            papers: [],
            summary: '',
            validation: null
        };
    }

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                headers: {
                    "Content-Type": `application/json`,
                    "X-goog-api-key": `${API_KEY}`,
                },
                method: "POST",
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { "text": prompt }
                            ]
                        }
                    ]
                })
            });
        if (!response.ok) {
            const responseText = await response.text(); // await here
            throw new Error(responseText);
        }
        const rawData = await response.json();

        const output = await rawData?.candidates[0]?.content?.parts[0]?.text;

        console.log("summaryAgent executed");

        return output;
    } catch (e) {
        // rethrow to be caught by controller next(err)
        throw e;
    }
}

module.exports = summaryAgent;