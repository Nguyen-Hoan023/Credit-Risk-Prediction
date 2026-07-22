import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Tải các cấu hình từ file .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

engine = None
SessionLocal = None

if not DATABASE_URL or "your-supabase-db-host" in DATABASE_URL:
    print("[database/connection.py] WARNING: DATABASE_URL is not configured. Database features will be unavailable.")
else:
    # Hỗ trợ chuỗi postgres:// nếu Render.com cung cấp
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    is_supabase_cloud = "supabase.co" in DATABASE_URL or "supabase.com" in DATABASE_URL
    if ENVIRONMENT == "development" and is_supabase_cloud:
        print("\n" + "="*70)
        print("[database/connection.py] ⚠️  CẢNH BÁO MÔI TRƯỜNG:")
        print("Backend đang chạy ở môi trường LOCAL/DEVELOPMENT nhưng kết nối tới SUPABASE PRODUCTION!")
        print("Mọi thao tác sửa/xóa dữ liệu sẽ ảnh hưởng trực tiếp đến Database Online.")
        print("Khuyên dùng: Đổi DATABASE_URL sang Postgres local hoặc Supabase Dev project.")
        print("="*70 + "\n")

    try:
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
        print("[database/connection.py] Connection engine created successfully.")
    except Exception as e:
        print(f"[database/connection.py] Error establishing database engine connection: {str(e)}")

Base = declarative_base()

# Dependency inject vào FastAPI
def get_db():
    if SessionLocal is None:
        yield None
        return
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
