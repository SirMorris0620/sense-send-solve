/* ============ PHOTOS (hot-linked from the maker's or a retailer's page, always credited) ============ */
const PH = {
 uno:   ["https://store-usa.arduino.cc/cdn/shop/files/ABX00087_00.front_1200x900.jpg?v=1749566728", "Arduino UNO R4 WiFi (ABX00087)", "Arduino Store", "https://docs.arduino.cc/hardware/uno-r4-wifi/"],
 s3:    ["https://circuitpython.org/assets/images/boards/large/espressif_esp32s3_devkitc_1.jpg", "Espressif ESP32-S3-DevKitC-1", "CircuitPython.org", "https://circuitpython.org/board/espressif_esp32s3_devkitc_1_n8r8/"],
 esp8266:["https://components101.com/sites/default/files/components/ESP8266-NodeMCU.jpg", "NodeMCU ESP8266 development board", "Components101", "https://components101.com/development-boards/nodemcu-esp8266-pinout-features-and-datasheet"],
 dhtBare:["https://cdn-learn.adafruit.com/assets/assets/000/000/576/medium800/weather_dhtsensors.jpg?1396764183", "Bare DHT11 (blue) and DHT22 (white) sensors: four pins, no resistor", "Adafruit Learning System", "https://learn.adafruit.com/dht"],
 dht11Mod:["https://static.cytron.io/image/catalog/products/SN-DHT11-MOD/SN-DHT11-MOD%20(a).jpg", "DHT11 on a module: three pins, pull-up resistor already on the board", "Cytron Technologies", "https://www.cytron.io/"],
 dht22Mod:["https://elecsynergy.in/cdn/shop/files/DHT22-2.webp?v=1763334440&width=1024", "DHT22 on a module (three pins)", "Elecsynergy", "https://elecsynergy.in/"],
 hcsr04:["https://core-electronics.com.au/media/catalog/product/d/e/device6_1000.jpg", "HC-SR04 ultrasonic distance sensor", "Core Electronics", "https://core-electronics.com.au/hc-sr04-ultrasonic-module-distance-measuring-sensor.html"],
 ldr:   ["https://core-electronics.com.au/media/catalog/product/l/d/ldr.jpg", "Photoresistor (light-dependent resistor, LDR)", "Core Electronics", "https://core-electronics.com.au/light-dependent-resistor-ldr.html"],
 mq135: ["https://components101.com/sites/default/files/components/MQ-135-Sensor.png", "MQ-135 gas sensor: the bare sensor and the module", "Components101", "https://components101.com/sensors/mq135-gas-sensor-for-air-quality"],
};
const ph = (k, cls) => photo(PH[k][0], PH[k][1], PH[k][2], PH[k][3], cls);
