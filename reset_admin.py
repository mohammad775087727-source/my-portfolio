import database
import models
import auth

def reset_admin():
    db = database.SessionLocal()
    admin = db.query(models.Admin).first()
    if not admin:
        print("لا يوجد حساب مدير، سيتم إنشاء حساب جديد.")
        admin = models.Admin(username="admin")
        db.add(admin)
    else:
        print(f"تم العثور على حساب للمدير باسم: {admin.username}، سيتم إعادة تعيين بيانات الدخول.")
    
    admin.username = "admin"
    admin.hashed_password = auth.get_password_hash("admin123")
    db.commit()
    print("تم بنجاح! اسم المستخدم الجديد: admin | كلمة المرور الجديدة: admin123")
    db.close()

if __name__ == "__main__":
    reset_admin()
