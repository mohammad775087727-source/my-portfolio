from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import os
import shutil
import uuid
import urllib.request
import urllib.parse
import json
import base64

import models
import schemas
import database
import auth

# إنشاء الجداول في قاعدة البيانات عند التشغيل
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Portfolio Backend API")

# إعداد CORS للسماح للواجهة الأمامية بالاتصال
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # يمكن تعديلها في بيئة الإنتاج للسماح بنطاقات محددة فقط
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# التأكد من وجود مجلد رفع الصور وتجهيزه
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# خدمة مجلد الصور كملفات ثابتة (Static Files)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# مفتاح API لموقع ImgBB لرفع الصور سحابياً
IMGBB_API_KEY = "64a040621ff49008a0d22f6a3fbc299e"

def upload_image_to_imgbb(image_file):
    """دالة مساعدة لرفع الصورة إلى ImgBB واسترجاع الرابط المباشر"""
    try:
        image_data = image_file.file.read()
        image_b64 = base64.b64encode(image_data).decode('utf-8')
        
        url = "https://api.imgbb.com/1/upload"
        data = urllib.parse.urlencode({
            'key': IMGBB_API_KEY,
            'image': image_b64
        }).encode('utf-8')
        
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            if result.get('success'):
                return result['data']['url']
            return None
    except Exception as e:
        print("ImgBB Upload Error:", e)
        return None

# -----------------
# مسارات المدير (Admin & Auth)
# -----------------

@app.post("/api/admin/setup", response_model=schemas.Token)
def setup_admin(admin_data: schemas.AdminLogin, db: Session = Depends(database.get_db)):
    """إنشاء حساب المدير لأول مرة (يعمل فقط إذا كان الجدول فارغاً)"""
    admin_count = db.query(models.Admin).count()
    if admin_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin account is already setup."
        )
    
    hashed_password = auth.get_password_hash(admin_data.password)
    new_admin = models.Admin(username=admin_data.username, hashed_password=hashed_password)
    db.add(new_admin)
    db.commit()
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": new_admin.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/admin/login", response_model=schemas.Token)
def login(admin_data: schemas.AdminLogin, db: Session = Depends(database.get_db)):
    """تسجيل دخول المدير وإرجاع JWT Token"""
    admin = db.query(models.Admin).filter(models.Admin.username == admin_data.username).first()
    if not admin or not auth.verify_password(admin_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": admin.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.put("/api/admin/credentials", response_model=dict)
def update_credentials(
    admin_data: schemas.AdminLogin,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """تحديث بيانات دخول المدير (اسم المستخدم وكلمة المرور)"""
    current_admin.username = admin_data.username
    current_admin.hashed_password = auth.get_password_hash(admin_data.password)
    db.commit()
    return {"message": "Credentials updated successfully"}

# -----------------
# مسارات الرسائل (Contact Messages)
# -----------------

@app.post("/api/contact", response_model=schemas.ContactMessageResponse, status_code=status.HTTP_201_CREATED)
def create_contact_message(message: schemas.ContactMessageCreate, db: Session = Depends(database.get_db)):
    """إرسال رسالة تواصل من قبل زوار الموقع"""
    db_message = models.ContactMessage(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@app.get("/api/admin/messages", response_model=List[schemas.ContactMessageResponse])
def get_messages(db: Session = Depends(database.get_db), current_admin: models.Admin = Depends(auth.get_current_admin)):
    """عرض جميع الرسائل الواردة (محمي للمدير فقط)"""
    messages = db.query(models.ContactMessage).order_by(models.ContactMessage.created_at.desc()).all()
    return messages

# -----------------
# مسارات المشاريع (Projects)
# -----------------

@app.get("/api/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(database.get_db)):
    """عرض جميع المشاريع مع صورها للزوار"""
    projects = db.query(models.Project).order_by(models.Project.created_at.desc()).all()
    return projects

@app.post("/api/admin/projects", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    title: str = Form(...),
    description: str = Form(...),
    demo_link: str = Form(None),
    images: List[UploadFile] = File(...),
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """إضافة مشروع جديد مع رفع الصور (محمي للمدير فقط)"""
    # إنشاء المشروع
    db_project = models.Project(title=title, description=description, demo_link=demo_link)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # معالجة الصور ورفعها إلى ImgBB
    for image in images:
        img_url = upload_image_to_imgbb(image)
        if img_url:
            db_image = models.ProjectImage(image_path=img_url, project_id=db_project.id)
            db.add(db_image)
        else:
            # إذا فشل الرفع، التخزين المحلي كخيار بديل
            file_extension = os.path.splitext(image.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            with open(file_path, "wb") as buffer:
                image.file.seek(0)
                shutil.copyfileobj(image.file, buffer)
            db_image = models.ProjectImage(image_path=f"/{UPLOAD_DIR}/{unique_filename}", project_id=db_project.id)
            db.add(db_image)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/api/admin/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int, 
    db: Session = Depends(database.get_db), 
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """حذف مشروع وصوره المرتبطة (محمي للمدير فقط)"""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    
    # حذف ملفات الصور المرتبطة من التخزين المحلي (إذا كانت محلية)
    for image in project.images:
        if str(image.image_path).startswith("/uploads/"):
            file_path = image.image_path.lstrip("/") 
            if os.path.exists(file_path):
                os.remove(file_path)
    
    # حذف المشروع من قاعدة البيانات (الحذف المتسلسل سيحذف سجلات الصور أيضاً)
    db.delete(project)
    db.commit()
    return

# -----------------
# مسارات الإعدادات (Settings)
# -----------------

@app.get("/api/settings", response_model=List[schemas.SettingResponse])
def get_settings(db: Session = Depends(database.get_db)):
    """عرض الإعدادات العامة للزوار"""
    return db.query(models.Setting).all()

@app.put("/api/admin/settings/{key}", response_model=schemas.SettingResponse)
def update_setting(
    key: str,
    setting_data: schemas.SettingUpdate,
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """تحديث أو إنشاء إعداد (محمي للمدير فقط)"""
    setting = db.query(models.Setting).filter(models.Setting.key == key).first()
    if setting:
        setting.value = setting_data.value
    else:
        setting = models.Setting(key=key, value=setting_data.value)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting

@app.post("/api/admin/profile-picture", response_model=schemas.SettingResponse)
def upload_profile_picture(
    image: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """تحديث الصورة الشخصية ورفعها إلى ImgBB"""
    image_url = upload_image_to_imgbb(image)
    
    if not image_url:
        # خيار بديل إذا فشل الرفع
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"profile_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            image.file.seek(0)
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/{UPLOAD_DIR}/{unique_filename}"
    
    setting = db.query(models.Setting).filter(models.Setting.key == "profile_picture").first()
    if setting:
        # حذف الصورة القديمة إذا كانت موجودة لتوفير المساحة
        old_path = setting.value.lstrip("/")
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except:
                pass
        setting.value = image_url
    else:
        setting = models.Setting(key="profile_picture", value=image_url)
        db.add(setting)
    
    db.commit()
    db.refresh(setting)
    return setting
