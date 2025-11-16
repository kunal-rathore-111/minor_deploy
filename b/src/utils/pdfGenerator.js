const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

async function generatePdf(html) {
    const executablePath = process.env.NODE_ENV === "development"
        ? (process.env.CHROME_EXECUTABLE_PATH || "/usr/bin/google-chrome") // Local dev (Linux)
        : await chromium.executablePath(); // Vercel

    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { left: "20px", right: "20px", top: "20px", bottom: "20px" },
    });

    await browser.close();
    return pdfBuffer;
}

module.exports = generatePdf;