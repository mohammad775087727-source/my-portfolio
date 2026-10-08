from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    demo_link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    images = relationship("ProjectImage", back_populates="project", cascade="all, delete-orphan")

class ProjectImage(Base):
    __tablename__ = "project_images"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String)
    project_id = Column(Integer, ForeignKey("projects.id"))

    project = relationship("Project", back_populates="images")

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_name = Column(String)
    sender_contact = Column(String)
    message_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(String)
