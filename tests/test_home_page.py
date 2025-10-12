# test_home_page.py
import pytest
import time
from urllib.parse import urlparse, parse_qs

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils import by_testid, wait_visible, wait_clickable

@pytest.fixture
def home_url(base_url):
    # If your base_url is http://localhost:3000/ or /login, normalize to /
    if base_url.endswith("/login"):
        return base_url[:-len("/login")]
    return base_url.rstrip("/")

# ------------------ helpers ------------------

def scroll_into_view(driver, el):
    driver.execute_script("arguments[0].scrollIntoView({block:'center', inline:'center'});", el)

def js_click(driver, el):
    driver.execute_script("arguments[0].click();", el)

def safe_click(driver, locator, timeout=6):
    """
    Be resilient vs. overlays/animations:
    - wait present -> scroll -> clickable -> click
    - if WebDriver click fails, fall back to JS click
    """
    el = WebDriverWait(driver, timeout).until(EC.presence_of_element_located(locator))
    scroll_into_view(driver, el)
    try:
        el = WebDriverWait(driver, timeout).until(EC.element_to_be_clickable(locator))
        el.click()
    except Exception:
        # fall back to JS click on the element we already located
        try:
            js_click(driver, el)
        except Exception:
            # final retry: re-find + JS click (handles re-render)
            el2 = WebDriverWait(driver, timeout).until(EC.presence_of_element_located(locator))
            scroll_into_view(driver, el2)
            js_click(driver, el2)

def url_contains_category(url: str, expected_category: str) -> bool:
    """
    Accept either:
      /shop?category=Hunting
      /shop?category=hunting
      /shop/hunting
      /shop/Hunting
      or any variant where query param 'category' equals expected (case-insensitive).
    """
    url = url.lower()
    exp = expected_category.lower()
    if "/shop/" in url and exp in url:
        return True
    if "/shop" in url and "category=" in url:
        qs = parse_qs(urlparse(url).query)
        cat = (qs.get("category") or [""])[0].lower()
        return cat == exp
    # also accept plain substring match when router appends search/hash
    return f"/shop?category={exp}" in url

def wait_for_category_change(driver, expected_category, timeout=8):
    WebDriverWait(driver, timeout).until(
        lambda d: url_contains_category(d.current_url, expected_category)
    )

# ------------------ A) Smoke / layout ------------------

def test_home_renders_core_sections(driver, home_url):
    driver.get(home_url + "/")
    wait_visible(driver, by_testid("home-page"))
    wait_visible(driver, by_testid("category-tiles"))
    wait_visible(driver, by_testid("hot-section"))
    wait_visible(driver, by_testid("banner-slider"))
    wait_visible(driver, by_testid("feature-strip"))
    wait_visible(driver, by_testid("subscription-section"))
    wait_visible(driver, by_testid("featured-section"))

# ------------------ B) Category tiles ------------------

@pytest.mark.parametrize("tile,test_category", [
    ("tile-hunting",  "Hunting"),
    ("tile-camping",  "Camping"),
    ("tile-fishing",  "Fishing"),
    ("tile-climbing", "Climbing"),
])
def test_category_tile_navigation(driver, home_url, tile, test_category):
    driver.get(home_url + "/")
    # Actually click the tile (previous code only waited)
    safe_click(driver, by_testid(tile))
    # Some sliders animate; give a tiny settle time before waiting URL
    time.sleep(0.1)
    wait_for_category_change(driver, test_category, timeout=10)
    assert url_contains_category(driver.current_url, test_category)

# ------------------ C) Subscription ------------------

def test_subscription_form_visible(driver, home_url):
    driver.get(home_url + "/")
    wait_visible(driver, by_testid("subscription-form"))

# ------------------ D) Product cards (tolerant to empty backend) ------------------

def test_hot_products_grid(driver, home_url):
    driver.get(home_url + "/")
    # If the section is missing entirely, skip (e.g., backend off)
    section = driver.find_elements(*by_testid("hot-section"))
    if not section:
        pytest.skip("Hot section not rendered (likely no backend data).")
    grid = driver.find_elements(*by_testid("hot-grid"))
    if not grid:
        pytest.skip("Hot grid not rendered (likely no products).")
    grid = grid[0]

    cards = grid.find_elements(By.CSS_SELECTOR, "[data-testid^='hot-card-']")
    # the page shows up to 4 – accept 0..4
    assert len(cards) <= 4
    if cards:
        # click the first card title or the whole card to navigate
        clickable_bits = cards[0].find_elements(By.CSS_SELECTOR, "[data-testid^='hot-card-name-'], a, button")
        target = clickable_bits[0] if clickable_bits else cards[0]
        scroll_into_view(driver, target)
        try:
            target.click()
        except Exception:
            js_click(driver, target)
        WebDriverWait(driver, 8).until(EC.url_contains("/product/"))
        assert "/product/" in driver.current_url

def test_featured_products_grid(driver, home_url):
    driver.get(home_url + "/")
    section = driver.find_elements(*by_testid("featured-section"))
    if not section:
        pytest.skip("Featured section not rendered.")
    grid = driver.find_elements(*by_testid("featured-grid"))
    if not grid:
        pytest.skip("Featured grid not rendered (likely empty).")
    grid = grid[0]

    cards = grid.find_elements(By.CSS_SELECTOR, "[data-testid^='feat-card-']")
    assert len(cards) <= 4

# ------------------ E) Add to cart (logged out) ------------------

def test_add_to_cart_prompts_login(driver, home_url):
    driver.get(home_url + "/")
    # If there are no hot products/buttons, skip neatly
    buttons = driver.find_elements(By.CSS_SELECTOR, "[data-testid^='hot-card-add-']")
    if not buttons:
        pytest.skip("No hot products found in backend response")

    btn = buttons[0]
    scroll_into_view(driver, btn)

    # First: dismiss alert
    try:
        btn.click()
    except Exception:
        js_click(driver, btn)

    alert = driver.switch_to.alert
    alert.dismiss()
    assert "/login" not in driver.current_url

    # Second: accept → should navigate to /login
    try:
        btn.click()
    except Exception:
        js_click(driver, btn)

    alert = driver.switch_to.alert
    alert.accept()
    WebDriverWait(driver, 8).until(EC.url_contains("/login"))
    assert "/login" in driver.current_url

