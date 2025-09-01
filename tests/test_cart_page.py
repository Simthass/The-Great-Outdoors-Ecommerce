# test_cart_page.py  — DROP-IN
import os
import time
import pytest
from urllib.parse import urlparse

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils import by_testid, wait_visible, wait_clickable

# ---------------- fixtures & helpers ----------------

@pytest.fixture(scope="session")
def root_url(base_url: str) -> str:
    """
    Normalize whatever --base-url you pass to just the origin + trailing slash.
      e.g. http://localhost:3000/cart -> http://localhost:3000/
    """
    parsed = urlparse(base_url)
    origin = f"{parsed.scheme}://{parsed.netloc}/"
    return origin

def _scroll_into_view(driver, el):
    driver.execute_script("arguments[0].scrollIntoView({block:'center', inline:'center'});", el)

def _js_click(driver, el):
    driver.execute_script("arguments[0].click();", el)

def _safe_click(driver, locator, timeout=8):
    el = WebDriverWait(driver, timeout).until(EC.presence_of_element_located(locator))
    _scroll_into_view(driver, el)
    try:
        WebDriverWait(driver, timeout).until(EC.element_to_be_clickable(locator)).click()
    except Exception:
        try:
            _js_click(driver, el)
        except Exception:
            el2 = WebDriverWait(driver, timeout).until(EC.presence_of_element_located(locator))
            _scroll_into_view(driver, el2)
            _js_click(driver, el2)

def _login_via_ui(driver, root_url, email, password):
    driver.get(root_url + "login")
    wait_visible(driver, by_testid("email-input")).clear()
    wait_visible(driver, by_testid("password-input")).clear()
    wait_visible(driver, by_testid("email-input")).send_keys(email)
    wait_visible(driver, by_testid("password-input")).send_keys(password)
    _safe_click(driver, by_testid("signin-btn"))
    # success = URL goes away from /login (to / or /cart or wherever)
    try:
        WebDriverWait(driver, 10).until(lambda d: "/login" not in d.current_url.lower())
        return True
    except Exception:
        return False  # caller may inspect error banner or try fallback

def _register_then_login(driver, root_url, password="secret123"):
    """Registers a fresh user (random email) and logs in."""
    driver.get(root_url + "register")
    uniq = str(int(time.time()*1000))[-6:]
    email = f"auto{uniq}@example.com"
    wait_visible(driver, by_testid("firstName-input")).send_keys("Auto")
    wait_visible(driver, by_testid("lastName-input")).send_keys("User")
    wait_visible(driver, by_testid("email-input")).send_keys(email)
    wait_visible(driver, by_testid("password-input")).send_keys(password)
    _safe_click(driver, by_testid("terms-checkbox"))
    _safe_click(driver, by_testid("submit-btn"))
    # should redirect to /login on success
    WebDriverWait(driver, 12).until(lambda d: "/login" in d.current_url.lower())
    assert _login_via_ui(driver, root_url, email, password), "Login after register failed"
    return email, password

@pytest.fixture(scope="function")
def login_as_test_user(driver, root_url):
    """
    Logs in before a test and yields. Priority:
      1) Use env PPA_TEST_EMAIL / PPA_TEST_PASSWORD if set
      2) Otherwise auto-register a throwaway and login
    """
    email = os.getenv("test@gmail.com")
    password = os.getenv("Testing@123")
    if email and password:
        ok = _login_via_ui(driver, root_url, email, password)
        if not ok:
            # if provided creds fail, try register fallback
            email, password = _register_then_login(driver, root_url)
    else:
        email, password = _register_then_login(driver, root_url)

    try:
        yield  # tests run logged-in
    finally:
        # Best-effort: go to /logout if your app has it; otherwise clear storage
        try:
            driver.get(root_url + "logout")
        except Exception:
            driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")

# Keep for symmetry with your earlier fixture if you want it
@pytest.fixture
def cart_url(root_url):
    return root_url + "cart"

# ---------------- tests ----------------

def test_redirects_to_login_when_not_authenticated(driver, root_url):
    # ensure logged out
    driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
    driver.get(root_url + "cart")
    WebDriverWait(driver, 8).until(EC.url_contains("/login"))
    assert "/login" in driver.current_url

def test_cart_loading_then_empty_or_items(driver, login_as_test_user, root_url):
    driver.get(root_url + "cart")
    # loading is optional/brief
    try:
        wait_visible(driver, by_testid("cart-loading"), timeout=3)
    except Exception:
        pass
    # end state: either empty or non-empty containers
    if driver.find_elements(*by_testid("cart-empty")):
        wait_visible(driver, by_testid("cart-empty"))
    else:
        wait_visible(driver, by_testid("cart-page"))
        wait_visible(driver, by_testid("cart-items"))
        wait_visible(driver, by_testid("cart-summary"))

@pytest.mark.usefixtures("login_as_test_user")
def test_empty_cart_view(driver, root_url):
    driver.get(root_url + "cart")
    empty = driver.find_elements(*by_testid("cart-empty"))
    if not empty:
        pytest.skip("Cart is not empty in this environment")
    wait_visible(driver, by_testid("cart-empty"))
    wait_visible(driver, by_testid("continue-shopping-btn"))

@pytest.mark.usefixtures("login_as_test_user")
def test_change_address_modal_opens(driver, root_url):
    driver.get(root_url + "cart")
    if not driver.find_elements(*by_testid("cart-page")):
        pytest.skip("Cart has no items; cannot open address modal")
    _safe_click(driver, by_testid("change-address-btn"))
    wait_visible(driver, by_testid("address-modal"))

@pytest.mark.usefixtures("login_as_test_user")
def test_checkout_requires_address(driver, root_url):
    driver.get(root_url + "cart")
    if not driver.find_elements(*by_testid("cart-page")):
        pytest.skip("Cart has no items")
    btn = wait_visible(driver, by_testid("checkout-btn"))
    # If the UI disables the button when no address:
    if btn.get_attribute("disabled"):
        # either button text or a nearby helper could show this; tolerate both
        assert ("Please Select an Address" in btn.text) or driver.find_elements(
            By.XPATH, "//*[contains(., 'Please Select an Address')]"
        )

@pytest.mark.usefixtures("login_as_test_user")
def test_quantity_inc_dec_and_remove(driver, root_url):
    driver.get(root_url + "cart")
    rows = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='cart-row-']")
    if not rows:
        pytest.skip("No items in cart to test quantity changes")
    row = rows[0]
    row_id = row.get_attribute("data-testid").replace("cart-row-", "")
    qty_val = wait_visible(driver, by_testid(f"qty-val-{row_id}"))
    start = int(qty_val.text or "1")

    # increment
    _safe_click(driver, by_testid(f"qty-inc-{row_id}"))
    WebDriverWait(driver, 8).until(
        lambda d: int(d.find_element(*by_testid(f"qty-val-{row_id}")).text) == start + 1
    )

    # decrement (only if >1)
    if start + 1 > 1:
        _safe_click(driver, by_testid(f"qty-dec-{row_id}"))
        WebDriverWait(driver, 8).until(
            lambda d: int(d.find_element(*by_testid(f"qty-val-{row_id}")).text) == start
        )

    # remove (optional UI)
    rem = driver.find_elements(*by_testid(f"remove-{row_id}"))
    if rem:
        _safe_click(driver, by_testid(f"remove-{row_id}"))
        WebDriverWait(driver, 8).until(
            EC.invisibility_of_element_located(by_testid(f"cart-row-{row_id}"))
        )
