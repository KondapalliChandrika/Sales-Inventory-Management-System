import logging

from app.core.database import SessionLocal
from app.core.demo_data import seed_demo_data

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    with SessionLocal() as db:
        seed_demo_data(db)
