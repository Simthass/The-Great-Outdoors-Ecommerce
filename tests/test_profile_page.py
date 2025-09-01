import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils import by_testid, wait_visible

def wait_present(driver, locator, timeout=8):
    return WebDriverWait(driver, timeout).until(EC.presence_of_element_located(locator))

@pytest.fixture
def profile_url(base_url):
    return base_url.rstrip("/")

def test_profile_smoke(driver, profile_url):
    driver.get(profile_url)
    # Either loading state or page shell
    try:
        wait_visible(driver, by_testid("profile-page"), timeout=6)
    except Exception:
        wait_visible(driver, by_testid("profile-loading"), timeout=6)
        wait_visible(driver, by_testid("profile-page"), timeout=10)

    wait_visible(driver, by_testid("profile-hero"))
    wait_visible(driver, by_testid("profile-card"))
    wait_visible(driver, by_testid("profile-image"))
    wait_visible(driver, by_testid("profile-header"))
    wait_present(driver, by_testid("profile-content"))

def test_edit_mode_toggle_and_cancel(driver, profile_url):
    driver.get(profile_url)
    # ensure page visible
    try:
        wait_visible(driver, by_testid("profile-page"), timeout=6)
    except Exception:
        wait_visible(driver, by_testid("profile-loading"), timeout=6)
        wait_visible(driver, by_testid("profile-page"), timeout=10)

    # enter edit mode (button might be hidden if already editing)
    edit_btns = driver.find_elements(*by_testid("btn-edit-profile"))
    if edit_btns:
        edit_btns[0].click()

    wait_visible(driver, by_testid("profile-edit-form"))
    # type something into bio
    bio = wait_visible(driver, by_testid("input-bio"))
    bio.clear()
    bio.send_keys("Automated test bio")

    # Cancel should exit edit mode without crashing
    driver.find_element(*by_testid("btn-cancel")).click()
    # view-mode visible again (or edit button returns)
    WebDriverWait(driver, 6).until(
        lambda d: d.find_elements(*by_testid("profile-view-mode")) or d.find_elements(*by_testid("btn-edit-profile"))
    )

def test_inputs_present_in_edit_mode(driver, profile_url):
    driver.get(profile_url)
    try:
        wait_visible(driver, by_testid("profile-page"), timeout=6)
    except Exception:
        wait_visible(driver, by_testid("profile-loading"), timeout=6)
        wait_visible(driver, by_testid("profile-page"), timeout=10)

    # open edit
    btns = driver.find_elements(*by_testid("btn-edit-profile"))
    if btns:
        btns[0].click()
    wait_visible(driver, by_testid("profile-edit-form"))

    # Core inputs
    for tid in [
        "input-firstName","input-lastName","input-email","input-phoneNumber",
        "input-address","input-city","input-state","input-bio"
    ]:
        wait_present(driver, by_testid(tid))

def test_image_upload_controls_exist(driver, profile_url):
    driver.get(profile_url)
    try:
        wait_visible(driver, by_testid("profile-page"), timeout=6)
    except Exception:
        wait_visible(driver, by_testid("profile-loading"), timeout=6)
        wait_visible(driver, by_testid("profile-page"), timeout=10)

    wait_visible(driver, by_testid("profile-image"))
    wait_present(driver, by_testid("btn-upload-image"))
    wait_present(driver, by_testid("file-input"))

def test_save_button_clickable_in_edit_mode(driver, profile_url):
    driver.get(profile_url)
    try:
        wait_visible(driver, by_testid("profile-page"), timeout=6)
    except Exception:
        wait_visible(driver, by_testid("profile-loading"), timeout=6)
        wait_visible(driver, by_testid("profile-page"), timeout=10)

    # Enter edit mode if needed
    btns = driver.find_elements(*by_testid("btn-edit-profile"))
    if btns:
        btns[0].click()
    wait_visible(driver, by_testid("profile-edit-form"))

    # Change firstName field to ensure body is valid JSON
    fn = wait_visible(driver, by_testid("input-firstName"))
    fn.clear()
    fn.send_keys("QA")

    # Click save (we don't assert network; just that UI is responsive)
    driver.find_element(*by_testid("btn-save")).click()

    # After save, either a notification shows or edit mode closes
    time.sleep(0.3)
    possible_notif = driver.find_elements(*by_testid("profile-notification"))
    if possible_notif:
      # optional content check
      driver.find_element(*by_testid("notification-message"))

    # Eventually edit form may disappear (on success)
    # Make this tolerant—no hard assertion to avoid backend dependency
    # but we at least ensure the app didn't crash:
    wait_present(driver, by_testid("profile-content"))
