import aiofiles


async def get_file_text(filename: str) -> str:
    async with aiofiles.open(filename, mode='r') as f:
        contents = await f.read()
        return contents
