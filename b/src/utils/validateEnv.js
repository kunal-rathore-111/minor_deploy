// Validate required environment variables
function validateEnv() {
    const required = ['MONGOO_DB_URL', 'JWT_SECRET'];
    const warnings = ['GEMINI_API', 'EMAIL_ID', 'EMAIL_PASS'];
    
    const missing = [];
    const warningMissing = [];
    
    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }
    
    for (const key of warnings) {
        if (!process.env[key]) {
            warningMissing.push(key);
        }
    }
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    if (warningMissing.length > 0) {
        console.warn(`⚠️  Warning: Optional environment variables not set: ${warningMissing.join(', ')}`);
        console.warn('   Some features may not work properly without these variables.');
    }
    
    console.log('✓ Environment variables validated');
}

module.exports = { validateEnv };
