from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

engine = create_async_engine('sqlite+aiosqlite:///db.db', echo=True)

sessionmaker = async_sessionmaker(bind=engine)

async def get_async_session():
    async with sessionmaker() as session:
        yield session