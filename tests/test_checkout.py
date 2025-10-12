import pytest
from utils import by_testid, wait_visible, wait_clickable

def go_to_checkout(driver, base_url):
    # Navigate directly to checkout page
    driver.get(base_url.replace("/login", "/checkout"))
    return driver

def test_checkout_page_renders(driver, base_url):
    go_to_checkout(driver, base_url)
    assert wait_visible(driver, by_testid("checkout-page"))

def test_checkout_empty_cart(driver, base_url):
    go_to_checkout(driver, base_url)
    btn = wait_visible(driver, by_testid("place-order-btn"))
    assert btn.is_enabled() is False
    # error should appear if clicked with empty cart
    btn.click()
    err = wait_visible(driver, by_testid("error-alert"))
    assert "Your cart is empty" in err.text

@pytest.mark.usefixtures("driver")
def test_full_checkout_flow(driver, base_url):
    """
    Full happy-path checkout:
    - Inject fake cart (if backend not available, you can expose test route /fake-checkout for testing)
    - Select payment method
    - Add notes
    - Place order
    - Verify success page
    """
    driver.get(base_url.replace("/login", "/checkout"))

    # ---- Step 1: Verify checkout page ----
    assert wait_visible(driver, by_testid("checkout-page"))

    # ---- Step 2: Select payment method ----
    cash_option = driver.find_element(*by_testid("payment-option-cash-on-delivery"))
    cash_option.click()
    assert cash_option.is_selected()

    # ---- Step 3: Enter notes ----
    notes = driver.find_element(*by_testid("order-notes-input"))
    notes.clear()
    notes.send_keys("Deliver between 6-8 PM please")

    # ---- Step 4: Place order ----
    place_order = wait_clickable(driver, by_testid("place-order-btn"))
    place_order.click()

    # ---- Step 5: Verify success page ----
    success_page = wait_visible(driver, by_testid("checkout-success-page"))
    assert success_page

    title = wait_visible(driver, by_testid("success-title"))
    assert "Order Placed Successfully" in title.text

    details = wait_visible(driver, by_testid("success-order-details"))
    assert "Order ID" in details.text
    assert "Rs." in details.text

    # ---- Step 6: Verify navigation buttons ----
    assert wait_visible(driver, by_testid("view-orders-btn"))
    assert wait_visible(driver, by_testid("continue-shopping-btn"))
