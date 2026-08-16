#!/usr/bin/env python3
"""
Fake E-Commerce Clickstream Data Generator
Produces realistic clickstream events to Kafka topic.
"""

import json
import os
import random
import signal
import sys
import time
import uuid
from datetime import datetime, timezone

from faker import Faker
from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable

fake = Faker()

# Configuration
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka:29092")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "clickstream_events")
EVENTS_PER_SECOND = int(os.getenv("EVENTS_PER_SECOND", "20"))

# Product catalog simulation
CATEGORIES = {
    "electronics": {
        "products": ["laptop", "smartphone", "headphones", "tablet", "smartwatch", "camera", "speaker", "monitor"],
        "price_range": (29.99, 1999.99),
    },
    "clothing": {
        "products": ["t-shirt", "jeans", "jacket", "sneakers", "dress", "hoodie", "shorts", "boots"],
        "price_range": (9.99, 199.99),
    },
    "home": {
        "products": ["lamp", "pillow", "blanket", "vase", "rug", "curtains", "mirror", "shelf"],
        "price_range": (14.99, 499.99),
    },
    "sports": {
        "products": ["yoga-mat", "dumbbells", "running-shoes", "backpack", "water-bottle", "resistance-bands", "ball"],
        "price_range": (9.99, 299.99),
    },
    "books": {
        "products": ["novel", "cookbook", "textbook", "comics", "journal", "biography", "self-help"],
        "price_range": (4.99, 59.99),
    },
    "beauty": {
        "products": ["moisturizer", "sunscreen", "shampoo", "perfume", "lipstick", "serum", "mask"],
        "price_range": (7.99, 149.99),
    },
}

EVENT_TYPES = ["page_view", "page_view", "page_view", "page_view", "page_view",
               "click", "click", "click",
               "search", "search",
               "add_to_cart", "add_to_cart",
               "remove_from_cart",
               "purchase"]

REFERRERS = ["google", "google", "google",
             "direct", "direct",
             "social", "social",
             "email",
             "bing"]

DEVICES = ["desktop", "desktop", "mobile", "mobile", "mobile", "tablet"]

BROWSERS = ["chrome", "chrome", "chrome", "firefox", "safari", "safari", "edge"]

PAGES = ["/", "/products", "/categories", "/deals", "/cart", "/checkout",
         "/account", "/search", "/about", "/contact", "/blog"]

running = True


def signal_handler(sig, frame):
    global running
    print("\nShutting down gracefully...")
    running = False


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def create_producer():
    """Create Kafka producer with retry logic."""
    while running:
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BROKER,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                key_serializer=lambda k: k.encode("utf-8") if k else None,
                acks="all",
                retries=3,
                max_in_flight_requests_per_connection=1,
            )
            print(f"Connected to Kafka at {KAFKA_BROKER}")
            return producer
        except NoBrokersAvailable:
            print(f"Kafka not ready, retrying in 5s...")
            time.sleep(5)
    return None


def generate_user_id():
    """Generate a realistic-looking user ID."""
    return f"user_{random.randint(1000, 9999)}"


def generate_session_id():
    """Generate a session ID."""
    return f"sess_{uuid.uuid4().hex[:12]}"


def generate_event_type():
    """Weighted random event type selection."""
    return random.choice(EVENT_TYPES)


def generate_event():
    """Generate a single clickstream event."""
    event_type = generate_event_type()
    category = random.choice(list(CATEGORIES.keys()))
    cat_data = CATEGORIES[category]
    product = random.choice(cat_data["products"])
    product_id = f"prod_{product}_{random.randint(100, 999)}"

    user_id = generate_user_id()
    session_id = generate_session_id()

    # Determine price based on category
    price = round(random.uniform(*cat_data["price_range"]), 2)

    # Generate page URL based on event type
    if event_type == "purchase":
        page_url = f"/checkout/{category}/{product}"
    elif event_type == "add_to_cart":
        page_url = f"/products/{category}/{product}"
    elif event_type == "search":
        page_url = f"/search?q={product.replace('-', '+')}"
    elif event_type == "click_ad":
        page_url = f"/ad/{category}/{product}"
    else:
        page_url = random.choice(PAGES)

    # Generate timestamp with some randomness (last 30 seconds)
    timestamp = datetime.now(timezone.utc)

    event = {
        "event_id": str(uuid.uuid4()),
        "user_id": user_id,
        "session_id": session_id,
        "event_type": event_type,
        "product_id": product_id if event_type in ["page_view", "add_to_cart", "purchase", "click"] else None,
        "category": category,
        "page_url": page_url,
        "referrer": random.choice(REFERRERS),
        "device": random.choice(DEVICES),
        "browser": random.choice(BROWSERS),
        "price": price if event_type == "purchase" else None,
        "timestamp": timestamp.isoformat(),
    }

    return event


def main():
    print(f"Starting clickstream generator: {EVENTS_PER_SECOND} events/sec to topic '{KAFKA_TOPIC}'")

    producer = create_producer()
    if not producer:
        return

    event_count = 0
    interval = 1.0 / EVENTS_PER_SECOND

    try:
        while running:
            start = time.time()

            event = generate_event()
            user_id = event["user_id"]

            producer.send(KAFKA_TOPIC, key=user_id, value=event)
            event_count += 1

            if event_count % 100 == 0:
                print(f"Sent {event_count} events | Latest: {event['event_type']} - {event.get('category', 'N/A')}")

            # Maintain target rate
            elapsed = time.time() - start
            sleep_time = max(0, interval - elapsed)
            time.sleep(sleep_time)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        producer.flush()
        producer.close()
        print(f"Total events sent: {event_count}")


if __name__ == "__main__":
    main()
