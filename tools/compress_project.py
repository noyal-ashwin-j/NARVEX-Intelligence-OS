import os
import zipfile
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def compress_narvex():
    source_dir = r"E:\prgt\NARVEX"
    target_zip1 = r"E:\prgt\NARVEX_SOVEREIGN_PLATFORM_V3.zip"
    target_zip2 = r"E:\NARVEX_PROJECT_ARCHIVE.zip"

    exclude_dirs = {"node_modules", ".git", ".gemini", "dist", "build"}
    exclude_extensions = {".log", ".tmp"}

    print(f"Starting compression of NARVEX from {source_dir}...")
    start_time = time.time()

    file_count = 0
    total_uncompressed_bytes = 0

    with zipfile.ZipFile(target_zip1, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in exclude_extensions:
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)

                try:
                    file_size = os.path.getsize(full_path)
                    total_uncompressed_bytes += file_size
                    zipf.write(full_path, rel_path)
                    file_count += 1
                except Exception as e:
                    print(f"Skipping {file}: {e}")

    # Copy / Create second backup in E:\
    import shutil
    shutil.copy2(target_zip1, target_zip2)

    elapsed = time.time() - start_time
    zip_size_mb1 = os.path.getsize(target_zip1) / (1024 * 1024)
    raw_size_mb = total_uncompressed_bytes / (1024 * 1024)

    print("\n========================================================")
    print("✅ COMPRESSION COMPLETE")
    print("========================================================")
    print(f"📁 Total Files Archived: {file_count}")
    print(f"📊 Uncompressed Size:    {raw_size_mb:.2f} MB")
    print(f"🗜️ Compressed Zip Size:   {zip_size_mb1:.2f} MB")
    print(f"⏱️ Time Taken:           {elapsed:.2f} seconds")
    print(f"📦 Primary Output:        {target_zip1}")
    print(f"📦 Secondary Backup:      {target_zip2}")
    print("========================================================")

if __name__ == "__main__":
    compress_narvex()
