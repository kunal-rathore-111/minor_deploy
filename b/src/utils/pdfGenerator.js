const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

async function generatePdf(html) {
    let browser = null;
    
    try {
        console.log("Starting PDF generation...");
        
        // Get executable path
        const executablePath = process.env.NODE_ENV === "development"
            ? (process.env.CHROME_EXECUTABLE_PATH || "/usr/bin/google-chrome") // Local dev (Linux)
            : await chromium.executablePath(); // Vercel

        console.log("Launching browser with executable:", executablePath);

        // Optimized args for serverless
        const args = [
            ...chromium.args,
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process',
            '--no-zygote',
            '--disable-setuid-sandbox'
        ];

        browser = await puppeteer.launch({
            args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: chromium.headless || true,
            timeout: 30000, // 30 second timeout for launch
        });

        console.log("Browser launched, creating new page...");
        const page = await browser.newPage();
        
        // Set a timeout for page operations
        page.setDefaultTimeout(25000); // 25 seconds
        
        // Use domcontentloaded instead of networkidle0 for faster processing
        await page.setContent(html, { 
            waitUntil: "domcontentloaded",
            timeout: 20000 
        });

        console.log("Generating PDF...");
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { left: "20px", right: "20px", top: "20px", bottom: "20px" },
            timeout: 25000
        });

        console.log("PDF generated successfully");
        return pdfBuffer;
        
    } catch (error) {
        console.error("Error in PDF generation:", error);
        throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
        if (browser) {
            try {
                await browser.close();
                console.log("Browser closed");
            } catch (closeError) {
                console.error("Error closing browser:", closeError);
            }
        }
    }
}

module.exports = generatePdf;