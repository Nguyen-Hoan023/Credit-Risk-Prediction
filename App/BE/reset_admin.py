import os
import sys

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import SessionLocal
from domain.user.model import User
from domain.user.enums import UserRole
from core.security import hash_password

def reset_admin_password():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if admin:
            new_password = "admin@123"
            admin.hashed_password = hash_password(new_password)
            db.commit()
            print(f"Thành công! Đã reset mật khẩu của admin '{admin.email}' thành '{new_password}'.")
        else:
            print("Không tìm thấy tài khoản admin trong database!")
    except Exception as e:
        print(f"Lỗi: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()
