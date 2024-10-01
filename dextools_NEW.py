import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from stem import Signal
from stem.control import Controller

DELAY_BEFORE_CLICK = 1  # Časová prodleva před kliknutím

# Function to get external IP address
def get_ip():
    url = 'https://api.ipify.org'
    try:
        response = requests.get(url, proxies={'http': 'socks5://127.0.0.1:9050', 'https': 'socks5://127.0.0.1:9050'}, timeout=3)
        return response.text.strip()
    except requests.RequestException as e:
        print(f"[-] Error fetching IP: {e}")
        return "Unavailable"

# Function to rotate Tor IP address
def rotate_tor_ip():
    try:
        with Controller.from_port(port=9051) as controller:
            controller.authenticate(password='16:5832E4DC8ADE7E5160DBCF510D2C2E98C768463CD99BFEB9151BF31AA9')  # Use your actual Tor password
            controller.signal(Signal.NEWNYM)
            print("[+] Tor IP rotated.")
    except Exception as e:
        print(f"[-] Error rotating Tor IP: {e}")

# Function to open and close browser, and perform actions
def open_and_close_browser(driver):
    try:
        url = "https://www.dextools.io/app/en/ether/pair-explorer/0xf716d309df919a2a22e3e4da19ff018f2f9b71e5?t=1727811462019"
        driver.get(url)

        # Vyhledání a kliknutí na tlačítko oblíbených položek
        favorite_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'app-favorite-button'))
        )
        favorite_button.click()
        print('Clicked on favorite button')

        # Další akce mohou být přidány zde...

    except Exception as e:
        print(f"[-] Error during browser interaction: {e}")

# Main loop
def main():
    x = input("[+] Time to refresh Dextools in Sec [type=5] >> ")
    refresh_interval = int(x) if x.isdigit() else 5  # Default to 5 seconds if input is not valid

    # Spuštění Firefoxu v headless režimu pro rychlejší interakci
    options = webdriver.FirefoxOptions()
    options.add_argument('--headless')  # Rychlejší spuštění
    driver = webdriver.Firefox(options=options)

    try:
        while True:
            open_and_close_browser(driver)
            rotate_tor_ip()  # Rotate IP after browser actions
            time.sleep(1)  # Give Tor some time to rotate IP
            ip_address = get_ip()
            print(f"[+] Your IP for this refresh: {ip_address}")
            time.sleep(refresh_interval)
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
