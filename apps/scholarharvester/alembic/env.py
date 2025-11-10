from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from scholarharvester.models import Base

config = context.config
fileConfig(config.config_file_name)

target_metadata = Base.metadata

async_engine = create_async_engine(
    config.get_main_option('sqlalchemy.url'),
    future=True,
)


def run_migrations_online() -> None:
    async def do_run_migrations(connection) -> None:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

    async def runner() -> None:
        async with async_engine.connect() as connection:
            await connection.run_sync(do_run_migrations)
        await async_engine.dispose()

    import asyncio

    asyncio.run(runner())


if context.is_offline_mode():
    raise RuntimeError('Offline mode is not supported')
else:
    run_migrations_online()
