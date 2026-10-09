import urllib.request
import json

url = "https://portfolio-backend-rust-kappa.vercel.app/api/admin/setup"
data = json.dumps({"username": "admin", "password": "admin123"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print("✅ تم إنشاء حساب المدير بنجاح في قاعدة البيانات السحابية (Neon)!")
        print("اسم المستخدم: admin")
        print("كلمة المرور: admin123")
except urllib.error.HTTPError as e:
    print("❌ حدث خطأ، قد يكون الحساب موجوداً بالفعل:", e.read().decode('utf-8'))
except Exception as e:
    print("❌ خطأ في الاتصال:", e)
