from playwright.sync_api import sync_playwright, expect
import os
import time

def test_memento_app():
    port = 5174
    url = f"http://localhost:{port}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            permissions=['microphone']
        )

        # Mocking getUserMedia and MediaRecorder
        page = context.new_page()
        page.add_init_script("""
            navigator.mediaDevices.getUserMedia = async (constraints) => {
                return new MediaStream();
            };
            window.MediaRecorder = class {
                constructor(stream) { this.stream = stream; }
                start() { this.state = 'recording'; }
                stop() { this.state = 'inactive'; if(this.onstop) this.onstop(); }
                addEventListener() {}
                dispatchEvent() {}
            };
        """)

        # Capture console logs
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err.message}"))

        print(f"🚀 Navigating to {url}...")
        page.goto(url)

        print("📸 Step 1: Landing Screen")
        expect(page.get_by_role("heading", name="Preserve Your Story")).to_be_visible()
        page.screenshot(path="/home/jules/verification/step1_landing.png")

        page.fill("input[type='email']", "demo@memento.ai")
        dummy_img = "/home/jules/verification/test_photo.png"
        page.set_input_files("input[type='file']", dummy_img)
        page.wait_for_selector("img[alt='Upload 0']")
        page.screenshot(path="/home/jules/verification/step2_uploaded.png")

        print("🎤 Step 2: Interview Start")
        page.get_by_role("button", name="Start My Story").click()

        page.wait_for_selector("text=Connected", timeout=10000)
        page.screenshot(path="/home/jules/verification/step3_interview_start.png")

        print("⏺️ Step 3: Recording Simulation")
        rec_button = page.get_by_role("button", name="Hold to Respond")
        rec_button.scroll_into_view_if_needed()

        # We need to trigger mousedown/mouseup carefully
        page.get_by_role("button", name="Hold to Respond").dispatch_event("mousedown")

        page.wait_for_selector("text=Recording...", timeout=10000)
        print("✅ Recording active.")
        page.screenshot(path="/home/jules/verification/step4_recording.png")

        time.sleep(2)
        page.get_by_role("button", name="Recording...").dispatch_event("mouseup")

        page.wait_for_selector("text=Hold to Respond")
        print("✅ Recording stopped.")

        print("⌛ Step 4: Finishing Story")
        page.click("text=Finish My Story")

        page.wait_for_selector("text=Your biographer is at work...")
        page.screenshot(path="/home/jules/verification/step5_loading.png")

        print("⏳ Waiting for processing (30s)...")
        page.wait_for_selector("text=Your Biography is Ready", timeout=40000)
        page.screenshot(path="/home/jules/verification/step7_preview.png")

        print("📧 Step 5: Finalizing")
        page.click("text=Send to My Email")
        expect(page.get_by_text("Sent to demo@memento.ai")).to_be_visible()
        page.screenshot(path="/home/jules/verification/step8_final.png")

        print("✨ Full Journey Test Completed Successfully!")
        browser.close()

if __name__ == "__main__":
    try:
        test_memento_app()
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        exit(1)
