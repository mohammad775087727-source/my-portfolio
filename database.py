from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

import os

import os

# استخدام رابط قاعدة البيانات من البيئة (Neon) أو الرجوع إلى SQLite محلياً (في مجلد tmp المسموح بالكتابة فيه على Vercel)
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:////tmp/portfolio.db")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # توافق مع بروتوكول postgresql في SQLAlchemy واستخدام pg8000 لتجنب أخطاء C Extensions في Vercel
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
    elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and "pg8000" not in SQLALCHEMY_DATABASE_URL:
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
        
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
