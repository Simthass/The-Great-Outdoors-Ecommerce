from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def by_testid(tid):
    return (By.CSS_SELECTOR, f'[data-testid="{tid}"]')

def wait_visible(driver, locator, timeout=10):
    return WebDriverWait(driver, timeout).until(EC.visibility_of_element_located(locator))

def wait_clickable(driver, locator, timeout=10):
    el = WebDriverWait(driver, timeout).until(EC.element_to_be_clickable(locator))
    el.click()
    return el
