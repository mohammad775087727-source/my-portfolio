from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

import os

import os

# استخدام رابط قاعدة البيانات من البيئة (Neon) أو الرجوع إلى SQLite محلياً (في مجلد tmp المسموح بالكتابة فيه على Vercel)
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:////tmp/portfolio.db")

import ssl

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    connect_args = {}
    if SQLALCHEMY_DATABASE_URL.startswith("postgres"):
        if "?" in SQLALCHEMY_DATABASE_URL:
            SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.split("?")[0]
            
        if "pg8000" not in SQLALCHEMY_DATABASE_URL:
            if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
                SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
            elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
                SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
        
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        connect_args = {"ssl_context": ssl_ctx}

    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
