from __future__ import annotations

from dataclasses import dataclass

from supabase import Client, create_client


@dataclass(frozen=True)
class StorageClient:
    client: Client
    bucket: str

    def upload_pdf(self, storage_path: str, file_bytes: bytes) -> None:
        self.client.storage.from_(self.bucket).upload(
            storage_path,
            file_bytes,
            file_options={"content-type": "application/pdf"},
        )


def create_storage_client(url: str, service_role_key: str, bucket: str) -> StorageClient:
    return StorageClient(client=create_client(url, service_role_key), bucket=bucket)
