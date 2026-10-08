import database
import models

db = database.SessionLocal()
admin = db.query(models.Admin).first()
if admin:
    print(f"Username: {admin.username}")
    print(f"Hashed Password: {admin.hashed_password}")
else:
    print("No admin found.")
db.close()
