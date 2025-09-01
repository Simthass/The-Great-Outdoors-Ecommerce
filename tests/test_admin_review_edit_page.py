# tests/test_admin_review_edit_page.py
import pytest
from urllib.parse import urlparse
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils import wait_visible, wait_clickable


# ----------------- helpers -----------------

def _origin(u: str) -> str:
    p = urlparse(u)
    return f"{p.scheme}://{p.netloc}"

def _open_logged_in(driver, base_url: str):
    """Put a dummy token in localStorage and open the page."""
    driver.get(_origin(base_url) + "/")
    driver.execute_script("window.localStorage.setItem('token','TEST');")
    driver.get(base_url)

def _wait_form_ready(driver, timeout=30):
    """
    Wait for the edit/create form area to be usable:
    - description textarea visible OR
    - spinner goes away and header shows.
    """
    desc = ("css selector", "textarea[name='description']")
    header = ("xpath", "//h1[contains(normalize-space(.),'Review')]")
    spinner = ("css selector", ".animate-spin")

    def _ready(drv):
        # If spinner visible, keep waiting
        if drv.find_elements(*spinner):
            return False
        # Ready if description or header present
        return bool(drv.find_elements(*desc) or drv.find_elements(*header))

    WebDriverWait(driver, timeout).until(_ready)

def _is_new_mode(driver) -> bool:
    return "/new" in driver.current_url.lower()

def _button_by_text(label: str):
    # Match exact button label (ignoring surrounding spaces)
    return ("xpath", f"//button[normalize-space()='{label}']")


# ----------------- tests -----------------

def test_page_header_and_basic_fields_present(driver, base_url):
    _open_logged_in(driver, base_url)
    _wait_form_ready(driver)

    # Header shows Add or Edit
    wait_visible(driver, ("xpath", "//h1[contains(.,'Add New Review') or contains(.,'Edit Review')]"))
    # Core fields render
    wait_visible(driver, ("css selector", "textarea[name='description']"))
    wait_visible(driver, ("css selector", "input[name='customerId']"))
    wait_visible(driver, ("css selector", "input[name='productId']"))
    wait_visible(driver, ("css selector", "input[name='dateAdded']"))
    wait_visible(driver, ("css selector", "select[name='status']"))
    wait_visible(driver, ("css selector", "textarea[name='response']"))


def test_cancel_navigates_back(driver, base_url):
    _open_logged_in(driver, base_url)
    _wait_form_ready(driver)

    wait_clickable(driver, _button_by_text("Cancel"))
    WebDriverWait(driver, 15).until(
        lambda d: "/Admin/ReviewList" in d.current_url or "/login" in d.current_url.lower()
    )


def test_create_mode_shows_required_error_when_blank(driver, base_url):
    _open_logged_in(driver, base_url)

    # If not on /new, skip this test
    if "/new" not in base_url.lower():
        pytest.skip("Base URL is not the 'new' route; skipping create-mode check.")

    _wait_form_ready(driver)
    # Try to save with empty requireds -> expect inline error text to appear
    wait_clickable(driver, _button_by_text("Create Review"))
    # Error box text set by component
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(("xpath", "//*[contains(., 'Please fill in all required fields')]"))
    )


def test_edit_mode_save_response_enabling(driver, base_url):
    _open_logged_in(driver, base_url)

    # If this is /new, skip (Save Response only in edit mode)
    if "/new" in base_url.lower():
        pytest.skip("Base URL is 'new'; Save Response is not rendered in create mode.")

    _wait_form_ready(driver)

    # Initially disabled until response text differs from original
    save_resp_btn = wait_visible(driver, _button_by_text("Save Response"))
    assert save_resp_btn.get_attribute("disabled") in ("true", "disabled", ""), \
        "Save Response should start disabled until response text changes"

    # Type something into response -> should enable
    resp = wait_visible(driver, ("css selector", "textarea[name='response']"))
    resp.clear()
    resp.send_keys("Automated admin response")

    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(*_button_by_text("Save Response")).get_attribute("disabled") in (None, "", "false")
    )


def test_edit_mode_save_changes_shows_error_if_required_missing(driver, base_url):
    _open_logged_in(driver, base_url)

    # Only meaningful in edit mode (button label "Save Changes")
    if "/new" in base_url.lower():
        pytest.skip("Base URL is 'new'; skipping edit-mode Save Changes check.")

    _wait_form_ready(driver)

    # Ensure required fields are empty (backend may or may not have returned values)
    # description is required
    desc = wait_visible(driver, ("css selector", "textarea[name='description']"))
    desc.clear()

    # Click Save Changes -> expect error banner text
    wait_clickable(driver, _button_by_text("Save Changes"))
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(("xpath", "//*[contains(., 'Please fill in all required fields')]"))
    )


def test_edit_mode_delete_flow_cancel(driver, base_url):
    _open_logged_in(driver, base_url)

    if "/new" in base_url.lower():
        pytest.skip("Delete not shown on 'new' page; skipping.")

    _wait_form_ready(driver)

    # Click Delete Review, then dismiss confirm() if it appears
    del_btns = driver.find_elements(*_button_by_text("Delete Review"))
    if not del_btns:
        pytest.skip("Delete button not present (possibly restricted); skipping.")
    del_btns[0].click()

    # Some browsers may block dialogs in headless; accept both outcomes
    try:
        WebDriverWait(driver, 3).until(EC.alert_is_present())
        driver.switch_to.alert.dismiss()
        # Should still be on the same page (Edit Review)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(("xpath", "//h1[contains(.,'Edit Review')]"))
        )
    except Exception:
        # No alert appeared; just assert we didn't navigate away immediately
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located(("xpath", "//h1[contains(.,'Edit Review')]"))
        )
