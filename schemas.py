from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Admin schemas
class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Project schemas
class ProjectImageResponse(BaseModel):
    id: int
    image_path: str
    project_id: int

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    description: str
    demo_link: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    images: List[ProjectImageResponse] = []

    class Config:
        from_attributes = True

# Contact Message schemas
class ContactMessageBase(BaseModel):
    sender_name: str
    sender_contact: str
    message_text: str

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessageResponse(ContactMessageBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Settings schemas
class SettingBase(BaseModel):
    key: str
    value: str

class SettingUpdate(BaseModel):
    value: str

class SettingResponse(SettingBase):
    class Config:
        from_attributes = True
