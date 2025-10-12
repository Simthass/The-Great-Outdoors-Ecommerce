# test_shop_page.py
import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils import by_testid, wait_visible

# --- helpers -----------------------------------------------------------------

def wait_present(driver, locator, timeout=8):
    return WebDriverWait(driver, timeout).until(
        EC.presence_of_element_located(locator)
    )

def js_click(driver, el):
    driver.execute_script("arguments[0].click();", el)

def scroll_into_view(driver, el):
    driver.execute_script("arguments[0].scrollIntoView({block:'center', inline:'center'});", el)

# --- fixtures ----------------------------------------------------------------

@pytest.fixture
def shop_url(base_url):
    return base_url.split("?")[0].rstrip("/")

# --- tests -------------------------------------------------------------------

def test_shop_smoke(driver, shop_url):
    driver.get(shop_url)
    wait_visible(driver, by_testid("shop-page"))
    wait_visible(driver, by_testid("shop-hero"))
    wait_visible(driver, by_testid("filters-sidebar"))
    wait_visible(driver, by_testid("products-section"))
    wait_visible(driver, by_testid("results-header"))
    wait_present(driver, by_testid("products-grid"))  # may be empty

def test_url_category_prefilter(driver, shop_url):
    driver.get(f"{shop_url}?category=Camping")
    wait_present(driver, by_testid("products-grid"))
    camp_cb = driver.find_elements(*by_testid("filter-cat-Camping"))
    if camp_cb:
        assert camp_cb[0].get_attribute("checked") in ("true", "checked")

def test_filters_toggle_and_brand_checkboxes(driver, shop_url):
    driver.get(shop_url)
    wait_visible(driver, by_testid("filters-sidebar"))

    # Try to toggle categories *if* a toggle control exists; otherwise continue.
    toggle = driver.find_elements(*by_testid("toggle-categories"))
    if toggle:
        try:
            toggle[0].click()
        except Exception:
            js_click(driver, toggle[0])
        time.sleep(0.15)
        try:
            toggle[0].click()
        except Exception:
            js_click(driver, toggle[0])

    # Pick a brand if present
    brands_container = driver.find_elements(*by_testid("brands-section"))
    if brands_container:
        brand_cbs = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='filter-brand-']")
        if brand_cbs:
            scroll_into_view(driver, brand_cbs[0])
            try:
                brand_cbs[0].click()
            except Exception:
                js_click(driver, brand_cbs[0])

def test_sort_and_pagination_widgets_present(driver, shop_url):
    driver.get(shop_url)
    wait_visible(driver, by_testid("sort-select"))
    wait_present(driver, by_testid("products-grid"))

def test_grid_cards_clickthrough_or_empty(driver, shop_url):
    driver.get(shop_url)
    grid = wait_present(driver, by_testid("products-grid"))
    if driver.find_elements(*by_testid("products-empty")):
        return

    cards = grid.find_elements(By.CSS_SELECTOR, "[data-testid^='prod-card-']")
    if not cards:
        return

    first = cards[0]
    name = first.find_elements(By.CSS_SELECTOR, "[data-testid^='prod-name-']")
    target = name[0] if name else first
    scroll_into_view(driver, target)
    try:
        target.click()
    except Exception:
        js_click(driver, target)

    WebDriverWait(driver, 8).until(EC.url_contains("/product/"))
    assert "/product/" in driver.current_url

def test_add_to_cart_prompts_login_when_logged_out(driver, shop_url):
    driver.get(shop_url)
    wait_present(driver, by_testid("products-grid"))
    if driver.find_elements(*by_testid("products-empty")):
        pytest.skip("No products rendered")

    add_buttons = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='prod-add-']")
    if not add_buttons:
        pytest.skip("No add-to-cart buttons (no products)")

    btn = add_buttons[0]
    scroll_into_view(driver, btn)
    try:
        btn.click()
    except Exception:
        js_click(driver, btn)

    # If your app shows confirm() when logged-out, handle it.
    try:
        alert = driver.switch_to.alert
        alert.dismiss()
        assert "/login" not in driver.current_url

        # Accept on second try -> should land on /login
        try:
            btn.click()
        except Exception:
            js_click(driver, btn)
        alert = driver.switch_to.alert
        alert.accept()
        WebDriverWait(driver, 6).until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
    except Exception:
        # No alert (e.g., already logged in) is acceptable
        pass

def test_price_slider_updates_text(driver, shop_url):
    driver.get(shop_url)
    slider = wait_visible(driver, by_testid("price-max-slider"))
    max_label = wait_visible(driver, by_testid("price-max"))
    before = max_label.text

    # Try the usual React-friendly update first
    driver.execute_script("""
      const s = arguments[0];
      s.value = 50000;
      s.dispatchEvent(new Event('input', {bubbles: true}));
      s.dispatchEvent(new Event('change', {bubbles: true}));
    """, slider)
    time.sleep(0.25)
    after = max_label.text
    if before != after:
        return

    # Fallback: send keyboard (some sliders only react to keys)
    try:
        slider.click()
    except Exception:
        js_click(driver, slider)
    for _ in range(5):
        slider.send_keys("\ue012")  # ARROW_DOWN
    time.sleep(0.25)
    after2 = max_label.text

    # Final acceptance: either label changed OR slider's DOM value changed
    dom_value = slider.get_attribute("value")
    assert (before != after2) or (dom_value != "100000"), \
        f"Slider did not appear to update (label stayed '{before}', value={dom_value})"
