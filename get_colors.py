from playwright.sync_api import sync_playwright
import time

def extract_colors():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print("Navigating to https://thejamiesea.com/...")
        page.goto("https://thejamiesea.com/")
        
        # Wait for page to load
        time.sleep(3)
        
        # Take screenshot
        screenshot_path = "c:/strmom website/jamiesea_capture.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Saved screenshot to {screenshot_path}")
        
        # Get background, text, and button colors
        colors = page.evaluate("""() => {
            const body = window.getComputedStyle(document.body);
            const bgColor = body.backgroundColor;
            const textColor = body.color;
            
            // Try to find a primary button
            const buttons = Array.from(document.querySelectorAll('button, .button, .btn, a'));
            let btnBg = 'unknown';
            let btnColor = 'unknown';
            
            for (const btn of buttons) {
                const style = window.getComputedStyle(btn);
                if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') {
                    btnBg = style.backgroundColor;
                    btnColor = style.color;
                    break;
                }
            }
            
            return {
                background: bgColor,
                text: textColor,
                buttonBg: btnBg,
                buttonText: btnColor
            };
        }""")
        
        print(f"Extracted Colors from DOM: {colors}")
        browser.close()

if __name__ == "__main__":
    extract_colors()
