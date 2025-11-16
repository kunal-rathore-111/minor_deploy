
const API_KEY = process.env.GEMINI_API;

const returnRawHtml = require("../utils/rawHtml");

async function generateHtml(conversation) {
  try {
    const { query, answer } = conversation;
    
    // Validate conversation structure
    if (!conversation.papers || !Array.isArray(conversation.papers) || conversation.papers.length === 0) {
      console.warn("No papers found in conversation, using fallback");
      return returnRawHtml(query, answer, [], "", {});
    }

    const { papers, summary, validation } = conversation.papers[0];

    const prompt = `
              You are an "HTML Agent". Format the following research assistant data into a visually appealing HTML page for pdf generation.

              - DO NOT include any code block markers like \`\`\`html.
              - Use <section> for main categories: Query, Answer, Papers, Summary, Validation.
              - Use <article> for each paper including title, authors, link, and paper ID.
              - Use <h1> for main heading, <h2> for section headings, <h3> for paper titles.
              - Bold important labels like Authors, Link, Paper ID, Feedback.
              - Include inline CSS for better readability:
                  - Add spacing (margin/padding) between sections and articles.
                  - Use different colors for headings (vary colors slightly each time).
                  - For Validation: if "Is Valid" is true → green text, if false → red text.
                  - Use readable font-family and appropriate font sizes.
                  - Optional: subtle background color or border for sections for modern look.
              - Make the format modern and visually appealing, vary layout, or font sizes slightly each time.
              - *Make it well looking, there are no division of paragraph on two pages on the A4 size page like half was on bottom of page1 and half was on top of page2, ignore such things keep it will formated*
              - Return ONLY HTML (no explanations).

              Query: ${query}
              Answer: ${answer}
              Papers: ${papers ? papers.join(', ') : 'No papers'}
              Summary: ${summary || 'No summary'}
              Validation: ${JSON.stringify(validation || {})}
              `;

    // Only try Gemini API if API key is available
    if (!API_KEY) {
      console.warn("GEMINI_API key not found, using fallback HTML");
      return returnRawHtml(query, answer, papers || [], summary || "", validation || {});
    }

    console.log("Executing htmlagent with Gemini API");
    
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          headers: {
            "x-goog-api-key": `${API_KEY}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      console.log("Htmlagent executed, response status:", response.status);
      
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Error in html agent ${response.status}- ${responseText}`);
      }
      
      const rawHtml = await response.json();
      const html = rawHtml?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!html) {
        throw new Error("No response from the html agent");
      }
      
      console.log("HTML generated successfully from Gemini");
      return html;

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.warn("Gemini API request timed out, using fallback HTML");
      } else {
        console.error("Error calling Gemini API:", fetchError.message);
      }
      throw fetchError;
    }

  } catch (error) {
    console.error("Error in html agent:", error.message);
    
    // Fallback to basic HTML template
    const { query, answer } = conversation;
    const papers = conversation.papers?.[0]?.papers || [];
    const summary = conversation.papers?.[0]?.summary || "";
    const validation = conversation.papers?.[0]?.validation || {};
    
    return returnRawHtml(query, answer, papers, summary, validation);
  }
}

module.exports = generateHtml;