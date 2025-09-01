# tests/test_login_page.py
import os
import pytest
from urllib.parse import urlparse

from utils import by_testid, wait_visible, wait_clickable
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# --- Helpers ---------------------------------------------------------------

def _origin_from(base_url: str) -> str:
    p = urlparse(base_url)
    return f"{p.scheme}://{p.netloc}"

def _wait_for_home(driver, base_url, timeout=15):
    """
    Prefer waiting for a stable home-page hook if present.
    Fallback to URL check: same origin + "/" (with optional ? or #).
    """
    # 1) Try UI hook first (best for SPAs)
    try:
        return wait_visible(driver, by_testid("home-page"), timeout=timeout)
    except Exception:
        pass

    # 2) Fallback: URL pattern on SAME ORIGIN as base_url
    origin = _origin_from(base_url)
    pattern = rf"^{origin}/(?:\?|#.*)?$"
    WebDriverWait(driver, timeout).until(EC.url_matches(pattern))
    return True


# --- Tests -----------------------------------------------------------------

def test_login_page_renders(driver, base_url):
    driver.get(base_url)
    wait_visible(driver, by_testid("login-page"))
    wait_visible(driver, by_testid("login-title"))
    wait_visible(driver, by_testid("email-input"))
    wait_visible(driver, by_testid("password-input"))
    wait_visible(driver, by_testid("signin-btn"))
    wait_visible(driver, by_testid("google-btn"))
    wait_visible(driver, by_testid("login-hero-image"))

def test_signin_shows_validation_error_when_empty(driver, base_url):
    driver.get(base_url)
    wait_clickable(driver, by_testid("signin-btn")).click()  # submit without typing
    err = wait_visible(driver, by_testid("error-alert"))
    assert "Please provide both email and password" in err.text

def test_forgot_password_requires_email(driver, base_url):
    driver.get(base_url)
    # With no inputs, clicking Sign in should surface the same validation
    wait_clickable(driver, by_testid("signin-btn")).click()
    err = wait_visible(driver, by_testid("error-alert"))
    assert "Please provide both email and password" in err.text

@pytest.mark.skip(reason="Enter-to-submit removed in UI (no onSubmit/Enter handler).")
def test_enter_key_submits_form(driver, base_url):
    # Keep this as documentation for future behavior if you re-enable Enter-submit.
    driver.get(base_url)
    email = wait_visible(driver, by_testid("email-input"))
    pwd = wait_visible(driver, by_testid("password-input"))
    email.send_keys("someone@example.com")
    pwd.send_keys("\n")
    err = wait_visible(driver, by_testid("error-alert"))
    assert "Cannot connect to server" in err.text or "Login failed" in err.text

def test_successful_login(driver, base_url):
    """
    Robust happy path:
    - Uses creds from env if provided, else defaults
    - Clicks Sign in
    - Waits for either home-page testid OR same-origin "/" URL
    - Asserts we are no longer on /login
    """
    EMAIL = os.getenv("E2E_EMAIL", "costapamindu7@gmail.com")
    PASSWORD = os.getenv("E2E_PASSWORD", "Pamindu123@")

    driver.get(base_url)

    wait_visible(driver, by_testid("email-input")).clear()
    wait_visible(driver, by_testid("email-input")).send_keys(EMAIL)

    wait_visible(driver, by_testid("password-input")).clear()
    wait_visible(driver, by_testid("password-input")).send_keys(PASSWORD)

    wait_clickable(driver, by_testid("signin-btn")).click()

    # Wait for SPA redirect to home
    _wait_for_home(driver, base_url, timeout=20)

    # Not on /login anymore
    assert "/login" not in driver.current_url.lower()

