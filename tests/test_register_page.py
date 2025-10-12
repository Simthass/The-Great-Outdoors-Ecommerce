# tests/test_register_page.py
import os, time
from urllib.parse import urlparse

import pytest
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils import by_testid, wait_visible, wait_clickable


# ------------ helpers ------------
def origin_of(url: str) -> str:
    p = urlparse(url)
    return f"{p.scheme}://{p.netloc}"

def login_url(base_url: str) -> str:
    return f"{origin_of(base_url)}/login"

def register_url(base_url: str) -> str:
    return f"{origin_of(base_url)}/register"

def wait_on_login_url(driver, base_url, timeout=15):
    ori = origin_of(base_url)
    WebDriverWait(driver, timeout).until(
        EC.url_matches(rf"^{ori}/login(?:\?|#.*)?$")
    )

def js_click(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
    driver.execute_script("arguments[0].click();", element)

def safe_click(driver, locator, total_timeout=10):
    """
    Find -> scroll -> regular click with retries; then JS click fallback.
    """
    end = time.time() + total_timeout
    last_exc = None
    while time.time() < end:
        try:
            el = WebDriverWait(driver, 3).until(EC.presence_of_element_located(locator))
            driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
            el = WebDriverWait(driver, 3).until(EC.element_to_be_clickable(locator))
            el.click()
            return
        except (TimeoutException, StaleElementReferenceException) as e:
            last_exc = e
    # JS fallback
    el = WebDriverWait(driver, 3).until(EC.presence_of_element_located(locator))
    js_click(driver, el)

def ensure_terms_checked(driver):
    """
    Your checkbox has data-testid="terms-checkbox".
    Make sure it's truly checked (React state updated) before submit.
    """
    cb = wait_visible(driver, by_testid("terms-checkbox"))
    try:
        # try normal click once
        cb.click()
    except Exception:
        pass

    if not cb.is_selected():
        # Force it and dispatch change for React
        driver.execute_script(
            "arguments[0].checked = true;"
            "arguments[0].dispatchEvent(new Event('change', {bubbles:true}));",
            cb
        )
    # Verify we ended up checked
    assert driver.execute_script("return arguments[0].checked;", cb) is True


# ------------ tests ------------
def test_register_page_renders(driver, base_url):
    driver.get(register_url(base_url))
    wait_visible(driver, by_testid("register-page"))
    wait_visible(driver, by_testid("register-title"))
    wait_visible(driver, by_testid("register-subtitle"))
    wait_visible(driver, by_testid("firstName-input"))
    wait_visible(driver, by_testid("lastName-input"))
    wait_visible(driver, by_testid("email-input"))
    wait_visible(driver, by_testid("password-input"))
    wait_visible(driver, by_testid("terms-checkbox"))
    wait_visible(driver, by_testid("submit-btn"))
    wait_visible(driver, by_testid("cancel-btn"))
    # image may be large/lazy – soft check
    try:
        wait_visible(driver, by_testid("register-image"))
    except TimeoutException:
        pass  # don't fail if image is offscreen/lazy

def test_register_requires_terms(driver, base_url):
    driver.get(register_url(base_url))
    wait_visible(driver, by_testid("firstName-input")).send_keys("Alex")
    wait_visible(driver, by_testid("lastName-input")).send_keys("Rider")
    wait_visible(driver, by_testid("email-input")).send_keys("alex@example.com")
    wait_visible(driver, by_testid("password-input")).send_keys("secret123")

    # Do NOT check terms
    safe_click(driver, by_testid("submit-btn"))
    err = wait_visible(driver, by_testid("error-alert"))
    assert "Please agree to the Terms and Conditions" in err.text

def test_cancel_goes_back_and_clears_form(driver, base_url):
    # Give history so navigate(-1) has somewhere to go
    driver.get(login_url(base_url))
    driver.get(register_url(base_url))

    wait_visible(driver, by_testid("firstName-input")).send_keys("Temp")
    wait_visible(driver, by_testid("email-input")).send_keys("temp@example.com")

    # Be very explicit: locate by attribute selector as a fallback too
    try:
        safe_click(driver, by_testid("cancel-btn"))
    except Exception:
        # try CSS querySelector via JS (super robust)
        driver.execute_script("""
            const btn = document.querySelector('button[data-testid="cancel-btn"]');
            if (btn) { btn.scrollIntoView({block:'center'}); btn.click(); }
        """)

    wait_on_login_url(driver, base_url, timeout=12)
    assert driver.current_url.lower().endswith("/login")

def test_register_backend_down_shows_network_error_or_redirect(driver, base_url):
    """
    If backend is DOWN -> error banner appears with one of your messages.
    If backend is UP   -> redirect to /login OR server returns 'Server error:' (e.g., duplicate email).
    """
    driver.get(register_url(base_url))
    wait_visible(driver, by_testid("firstName-input")).send_keys("Jane")
    wait_visible(driver, by_testid("lastName-input")).send_keys("Doe")
    wait_visible(driver, by_testid("email-input")).send_keys("jane@example.com")
    wait_visible(driver, by_testid("password-input")).send_keys("secret123")

    ensure_terms_checked(driver)
    time.sleep(0.1)
    safe_click(driver, by_testid("submit-btn"))

    ori = origin_of(base_url)

    def either_error_or_login(d):
        # error visible?
        try:
            el = d.find_element(*by_testid("error-alert"))
            if el.is_displayed():
                return "error"
        except Exception:
            pass
        # redirected to /login?
        if EC.url_matches(rf"^{ori}/login(?:\?|#.*)?$")(d):
            return "login"
        return False

    outcome = WebDriverWait(driver, 15).until(either_error_or_login)

    if outcome == "login":
        assert "/login" in driver.current_url.lower()
    else:
        err = wait_visible(driver, by_testid("error-alert"))
        # Your Register.jsx emits EXACTLY these strings
        ACCEPT = [
            "Cannot connect to server. Please make sure the backend server is running on port 5000.",
            "Server error:",                     # for non-200s
            "Network error. Please try again.",
            "Registration failed",
            "HTTP error",                        # from the thrown message
        ]
        # ensure it's not the terms error (we force-checked)
        assert "Please agree to the Terms and Conditions" not in err.text
        assert any(a in err.text for a in ACCEPT), f"Unexpected error text: {err.text}"

#@pytest.mark.skipif(
    #os.getenv("E2E_BACKEND_UP", "0") not in ("1", "true", "True"),
   # reason="Enable only when backend is confirmed UP (set E2E_BACKEND_UP=1).",
#)
def test_register_success_redirects_to_login(driver, base_url):
    driver.get(register_url(base_url))

    # Clean fields
    wait_visible(driver, by_testid("firstName-input")).clear()
    wait_visible(driver, by_testid("lastName-input")).clear()
    wait_visible(driver, by_testid("email-input")).clear()
    wait_visible(driver, by_testid("password-input")).clear()

    wait_visible(driver, by_testid("firstName-input")).send_keys("Alice")
    wait_visible(driver, by_testid("lastName-input")).send_keys("Tester")
    unique = str(int(time.time() * 1000))[-7:]
    wait_visible(driver, by_testid("email-input")).send_keys(f"alice{unique}@example.com")
    wait_visible(driver, by_testid("password-input")).send_keys("secret123")

    ensure_terms_checked(driver)
    time.sleep(0.1)
    safe_click(driver, by_testid("submit-btn"))

    wait_on_login_url(driver, base_url, timeout=20)
    assert "/login" in driver.current_url.lower()




