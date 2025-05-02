import os
import boto3
from botocore.client import Config
import logging
from fastapi import UploadFile
import aiofiles
import uuid
import shutil

logger = logging.getLogger(__name__)

class R2Storage:
    def __init__(self):
        self.endpoint_url = os.getenv("R2_ENDPOINT_URL")
        self.access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        self.secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
        self.bucket_name = os.getenv("R2_BUCKET_NAME", "ai-scientist")
        
        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
            config=Config(signature_version='s3v4')
        )
    
    async def upload_file(self, file_path: str, key: str) -> str:
        """Upload a file to R2 storage"""
        try:
            self.s3_client.upload_file(file_path, self.bucket_name, key)
            return f"{self.endpoint_url}/{self.bucket_name}/{key}"
        except Exception as e:
            logger.error(f"Error uploading file to R2: {str(e)}")
            raise e
    
    async def upload_file_obj(self, file: UploadFile, folder: str) -> tuple:
        """Upload a file object to R2 storage"""
        # Create a temporary file path
        temp_file_path = f"/tmp/{uuid.uuid4()}_{file.filename}"
        
        try:
            # Save the uploaded file temporarily
            async with aiofiles.open(temp_file_path, 'wb') as out_file:
                content = await file.read()
                await out_file.write(content)
            
            # Generate a unique key for the file in R2
            key = f"{folder}/{uuid.uuid4()}_{file.filename}"
            
            # Upload to R2
            self.s3_client.upload_file(temp_file_path, self.bucket_name, key)
            
            # Return the file URL and key
            url = f"{self.endpoint_url}/{self.bucket_name}/{key}"
            return url, key
        except Exception as e:
            logger.error(f"Error uploading file to R2: {str(e)}")
            raise e
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    
    async def upload_directory(self, directory_path: str, base_key: str) -> dict:
        """Upload all files in a directory to R2 storage"""
        uploaded_files = {}
        
        try:
            for root, _, files in os.walk(directory_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, directory_path)
                    key = f"{base_key}/{relative_path}"
                    
                    self.s3_client.upload_file(file_path, self.bucket_name, key)
                    url = f"{self.endpoint_url}/{self.bucket_name}/{key}"
                    uploaded_files[relative_path] = url
            
            return uploaded_files
        except Exception as e:
            logger.error(f"Error uploading directory to R2: {str(e)}")
            raise e
    
    def download_file(self, key: str, destination_path: str) -> bool:
        """Download a file from R2 storage"""
        try:
            self.s3_client.download_file(self.bucket_name, key, destination_path)
            return True
        except Exception as e:
            logger.error(f"Error downloading file from R2: {str(e)}")
            return False

# Initialize the R2 storage client
r2_storage = R2Storage() 