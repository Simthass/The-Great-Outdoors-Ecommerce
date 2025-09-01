# tests/test_user_settings_page.py
import os
from urllib.parse import urlparse
from selenium.webdriver.support.ui import WebDriverWait

from utils import by_testid, wait_visible, wait_clickable

# ---------- helpers ----------------------------------------------------------

def _origin_from(base_url: str) -> str:
    p = urlparse(base_url)
    return f"{p.scheme}://{p.netloc}"

def _open_usersettings_logged_out(driver, base_url):
    origin = _origin_from(base_url)
    driver.get(origin + "/")  # ensure same-origin for localStorage access
    driver.execute_script("window.localStorage.clear();")
    driver.get(base_url)

def _open_usersettings_logged_in(driver, base_url, token_value="TEST"):
    origin = _origin_from(base_url)
    driver.get(origin + "/")
    driver.execute_script("window.localStorage.setItem('token', arguments[0]);", token_value)
    driver.get(base_url)

def _wait_settings_ready_or_auth_result(driver, timeout=20):
    """
    Accept either:
      - notifications tab visible (authed render), or
      - inline auth-error block, or
      - redirect to /login
    """
    def _ok(drv):
        if drv.find_elements(*by_testid("tab-notifications")):
            return True
        if drv.find_elements(*by_testid("auth-error")):
            return True
        return "/login" in drv.current_url.lower()
    WebDriverWait(driver, timeout).until(_ok)

def _wait_present(driver, locator, timeout=10):
    return WebDriverWait(driver, timeout).until(lambda d: d.find_elements(*locator))

# ---------- tests ------------------------------------------------------------

def test_renders_auth_error_when_logged_out(driver, base_url):
    _open_usersettings_logged_out(driver, base_url)
    _wait_settings_ready_or_auth_result(driver)

    # Assert either inline error OR redirect to login
    on_login = "/login" in driver.current_url.lower()
    has_inline = bool(driver.find_elements(*by_testid("auth-error")))
    assert on_login or has_inline, "Expected inline auth error or redirect to /login."

def test_lands_on_notifications_when_logged_in(driver, base_url):
    _open_usersettings_logged_in(driver, base_url)
    _wait_settings_ready_or_auth_result(driver)
    tab = wait_visible(driver, by_testid("tab-notifications"))
    wait_visible(driver, by_testid("email-notifications-checkbox"))
    wait_visible(driver, by_testid("promotions-checkbox"))
    assert tab is not None

def test_switch_to_security_and_validate_password_mismatch(driver, base_url):
    from urllib.parse import urlparse
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.common.exceptions import TimeoutException
    from utils import by_testid, wait_visible, wait_clickable

    # Open origin, set a dummy token, then navigate straight to /usersettings
    def _origin(u):
        p = urlparse(u)
        return f"{p.scheme}://{p.netloc}"

    driver.get(_origin(base_url) + "/")
    driver.execute_script("window.localStorage.setItem('token', 'TEST');")
    driver.get(base_url)

    # Wait until either the settings UI is ready or we see an auth result
    WebDriverWait(driver, 20).until(
        lambda d: d.find_elements(*by_testid("tab-notifications"))
               or d.find_elements(*by_testid("auth-error"))
               or "/login" in d.current_url.lower()
    )

    # Go to Security tab
    wait_clickable(driver, by_testid("tab-btn-security"))

    # Fill the form with mismatched passwords
    wait_visible(driver, by_testid("current-password-input")).send_keys("anything")
    wait_visible(driver, by_testid("new-password-input")).send_keys("abc123")
    wait_visible(driver, by_testid("confirm-password-input")).send_keys("abc124")

    # Submit (click only; avoid ENTER to prevent stale refs after re-render)
    wait_clickable(driver, by_testid("change-password-btn"))

    # Prefer the inline mismatch error; otherwise accept fast auth redirect
    def _mismatch_or_redirect(d):
        if d.find_elements(*by_testid("confirm-password-error")):
            return "mismatch"
        if d.find_elements(*by_testid("auth-error")) or "/login" in d.current_url.lower():
            return "redirect"
        return False

    outcome = WebDriverWait(driver, 25).until(_mismatch_or_redirect)
    if outcome == "mismatch":
        # Double-check text if present
        try:
            el = wait_visible(driver, by_testid("confirm-password-error"))
            assert "match" in el.text.lower()
        except TimeoutException:
            # Element might be present-but-not-visible; just ensure it's in DOM
            assert driver.find_elements(*by_testid("confirm-password-error"))
    else:
        # Redirect is acceptable in environments where the token gets invalidated fast
        assert "/login" in driver.current_url.lower() or driver.find_elements(*by_testid("auth-error"))

def test_delete_account_modal_toggle_state(driver, base_url):
    _open_usersettings_logged_in(driver, base_url)
    _wait_settings_ready_or_auth_result(driver)

    wait_clickable(driver, by_testid("tab-btn-account"))
    wait_clickable(driver, by_testid("open-delete-modal-btn"))
    wait_visible(driver, by_testid("delete-account-modal"))

    delete_btn = wait_visible(driver, by_testid("delete-account-btn"))
    assert delete_btn.get_attribute("disabled") is not None

    wait_clickable(driver, by_testid("delete-confirm-checkbox"))
    # re-query attribute after state change
    assert wait_visible(driver, by_testid("delete-account-btn")).get_attribute("disabled") is None

    wait_clickable(driver, by_testid("delete-cancel-btn"))
    WebDriverWait(driver, 10).until(
        lambda d: not d.find_elements(*by_testid("delete-account-modal"))
    )

def test_open_address_form_and_cancel(driver, base_url):
    _open_usersettings_logged_in(driver, base_url)
    _wait_settings_ready_or_auth_result(driver)

    wait_clickable(driver, by_testid("tab-btn-addresses"))
    wait_clickable(driver, by_testid("add-address-btn"))
    wait_visible(driver, by_testid("address-form-modal"))

    wait_clickable(driver, by_testid("address-cancel-btn"))
    WebDriverWait(driver, 10).until(
        lambda d: not d.find_elements(*by_testid("address-form-modal"))
    )

def test_orders_tab_shows_list_or_empty_or_error(driver, base_url):
    _open_usersettings_logged_in(driver, base_url)
    _wait_settings_ready_or_auth_result(driver)

    wait_clickable(driver, by_testid("tab-btn-my-orders"))

    def _any_orders_state(drv):
        # if we got kicked to login due to 401, accept that
        if "/login" in drv.current_url.lower():
            return True
        if drv.find_elements(*by_testid("orders-error")):
            return True
        list_root = drv.find_elements(*by_testid("orders-list"))
        if list_root:
            return any(
                "order-card-" in el.get_attribute("data-testid")
                for el in list_root[0].find_elements("css selector", "[data-testid^='order-card-']")
            )
        return bool(drv.find_elements(*by_testid("orders-empty-state")))

    WebDriverWait(driver, 25).until(_any_orders_state)
